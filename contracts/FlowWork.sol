// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FlowWork is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum AgreementStatus {
        Open,
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    enum MilestoneStatus {
        Pending,
        Submitted,
        Approved,
        Disputed
    }

    struct Agreement {
        uint256 id;
        address client;
        address contributor;
        address arbiter;
        uint256 totalAmount;
        uint256 releasedAmount;
        AgreementStatus status;
        uint256 createdAt;
        uint256 updatedAt;
        string title;
        uint256 milestoneCount;
        uint256 deadline;
    }

    struct Milestone {
        uint256 id;
        uint256 agreementId;
        string title;
        uint256 amount;
        MilestoneStatus status;
        bytes32 deliveryHash;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    event AgreementCreated(uint256 indexed id, address indexed client, address indexed contributor, uint256 totalAmount);
    event AgreementAccepted(uint256 indexed id);
    event AgreementCompleted(uint256 indexed id);
    event AgreementCancelled(uint256 indexed id);
    event DeliverySubmitted(uint256 indexed agreementId, uint256 milestoneIndex, bytes32 deliveryHash);
    event MilestoneApproved(uint256 indexed agreementId, uint256 milestoneIndex, uint256 amount);
    event MilestoneDisputed(uint256 indexed agreementId, uint256 milestoneIndex);
    event WithdrawalClaimed(address indexed recipient, uint256 amount);

    IERC20 public immutable usdc;

    // Starts at 1 so there are no zero-id agreements.
    uint256 public agreementCount = 1;
    uint256 public constant DISPUTE_TIMEOUT = 30 days;

    mapping(uint256 => Agreement) private _agreements;
    mapping(uint256 => Milestone[]) private _milestonesByAgreement;
    mapping(address => uint256[]) private _clientAgreements;
    mapping(address => uint256[]) private _contributorAgreements;
    mapping(address => uint256) public pendingWithdrawals;

    constructor(address usdcToken) {
        require(usdcToken != address(0), "FlowWork: zero USDC address");
        usdc = IERC20(usdcToken);
    }

    /// @dev Assumes usdcToken is a non-fee-on-transfer ERC-20 (e.g. Circle USDC). Using a deflationary token will under-collateralise the escrow.
    function createAgreement(
        address contributor,
        address arbiter,
        string calldata title,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneTitles,
        uint256 deadline
    ) external nonReentrant returns (uint256 agreementId) {
        require(contributor != address(0), "FlowWork: zero contributor");
        require(contributor != msg.sender, "FlowWork: contributor is client");
        require(bytes(title).length <= 100, "FlowWork: title too long");

        uint256 milestoneCount = milestoneAmounts.length;
        require(milestoneCount >= 1 && milestoneCount <= 5, "FlowWork: invalid milestone count");
        require(milestoneTitles.length == milestoneCount, "FlowWork: mismatched milestone arrays");
        require(deadline == 0 || deadline > block.timestamp, "FlowWork: invalid deadline");

        uint256 totalAmount;
        for (uint256 i = 0; i < milestoneCount; i++) {
            uint256 amount = milestoneAmounts[i];
            require(amount > 0, "FlowWork: zero milestone amount");
            totalAmount += amount;
        }

        agreementId = agreementCount;
        agreementCount = agreementId + 1;

        Agreement storage agreement = _agreements[agreementId];
        agreement.id = agreementId;
        agreement.client = msg.sender;
        agreement.contributor = contributor;
        agreement.arbiter = arbiter;
        agreement.totalAmount = totalAmount;
        agreement.releasedAmount = 0;
        agreement.status = AgreementStatus.Open;
        agreement.createdAt = block.timestamp;
        agreement.updatedAt = block.timestamp;
        agreement.title = title;
        agreement.milestoneCount = milestoneCount;
        agreement.deadline = deadline;

        for (uint256 i = 0; i < milestoneCount; i++) {
            _milestonesByAgreement[agreementId].push(
                Milestone({
                    id: i,
                    agreementId: agreementId,
                    title: milestoneTitles[i],
                    amount: milestoneAmounts[i],
                    status: MilestoneStatus.Pending,
                    deliveryHash: bytes32(0),
                    submittedAt: 0,
                    approvedAt: 0
                })
            );
        }

        _clientAgreements[msg.sender].push(agreementId);
        _contributorAgreements[contributor].push(agreementId);

        uint256 balanceBefore = usdc.balanceOf(address(this));
        usdc.safeTransferFrom(msg.sender, address(this), totalAmount);
        uint256 receivedAmount = usdc.balanceOf(address(this)) - balanceBefore;
        require(receivedAmount == totalAmount, "FlowWork: transfer amount mismatch");

        emit AgreementCreated(agreementId, msg.sender, contributor, totalAmount);
    }

    function acceptAgreement(uint256 agreementId) external {
        Agreement storage agreement = _requireAgreement(agreementId);
        require(msg.sender == agreement.contributor, "FlowWork: only contributor");
        require(agreement.status == AgreementStatus.Open, "FlowWork: agreement not open");

        agreement.status = AgreementStatus.Active;
        agreement.updatedAt = block.timestamp;

        emit AgreementAccepted(agreementId);
    }

    function submitDelivery(uint256 agreementId, uint256 milestoneIndex, bytes32 deliveryHash) external {
        Agreement storage agreement = _requireAgreement(agreementId);
        require(msg.sender == agreement.contributor, "FlowWork: only contributor");
        require(agreement.status == AgreementStatus.Active, "FlowWork: agreement not active");
        require(deliveryHash != bytes32(0), "FlowWork: zero delivery hash");

        Milestone storage milestone = _requireMilestone(agreementId, milestoneIndex);
        require(milestone.status == MilestoneStatus.Pending, "FlowWork: milestone not pending");

        milestone.deliveryHash = deliveryHash;
        milestone.status = MilestoneStatus.Submitted;
        milestone.submittedAt = block.timestamp;

        agreement.updatedAt = block.timestamp;

        emit DeliverySubmitted(agreementId, milestoneIndex, deliveryHash);
    }

    function approveMilestone(uint256 agreementId, uint256 milestoneIndex) external nonReentrant {
        Agreement storage agreement = _requireAgreement(agreementId);
        Milestone storage milestone = _requireMilestone(agreementId, milestoneIndex);

        bool isClient = msg.sender == agreement.client;
        bool isArbiter = msg.sender == agreement.arbiter && agreement.arbiter != address(0);

        if (agreement.status == AgreementStatus.Active) {
            require(isClient, "FlowWork: only client when active");
            require(milestone.status == MilestoneStatus.Submitted, "FlowWork: milestone not submitted");
        } else if (agreement.status == AgreementStatus.Disputed) {
            require(isArbiter, "FlowWork: only arbiter when disputed");
            require(
                milestone.status == MilestoneStatus.Submitted || milestone.status == MilestoneStatus.Disputed,
                "FlowWork: invalid disputed milestone status"
            );
        } else {
            revert("FlowWork: invalid agreement status");
        }

        milestone.status = MilestoneStatus.Approved;
        milestone.approvedAt = block.timestamp;

        agreement.releasedAmount += milestone.amount;
        agreement.updatedAt = block.timestamp;

        pendingWithdrawals[agreement.contributor] += milestone.amount;

        if (_allMilestonesApproved(agreementId)) {
            agreement.status = AgreementStatus.Completed;
            emit AgreementCompleted(agreementId);
        } else if (agreement.status == AgreementStatus.Disputed) {
            // Return to active flow after arbiter resolves this milestone.
            agreement.status = AgreementStatus.Active;
        }

        emit MilestoneApproved(agreementId, milestoneIndex, milestone.amount);
    }

    function disputeMilestone(uint256 agreementId, uint256 milestoneIndex) external {
        Agreement storage agreement = _requireAgreement(agreementId);
        require(agreement.arbiter != address(0), "FlowWork: no arbiter set");
        require(msg.sender == agreement.client, "FlowWork: only client");
        require(agreement.status == AgreementStatus.Active, "FlowWork: agreement not active");

        Milestone storage milestone = _requireMilestone(agreementId, milestoneIndex);
        require(milestone.status == MilestoneStatus.Submitted, "FlowWork: milestone not submitted");

        milestone.status = MilestoneStatus.Disputed;
        agreement.updatedAt = block.timestamp;

        if (agreement.arbiter != address(0)) {
            agreement.status = AgreementStatus.Disputed;
        }

        emit MilestoneDisputed(agreementId, milestoneIndex);
    }

    function forceCloseDispute(uint256 agreementId) external nonReentrant {
        Agreement storage agreement = _requireAgreement(agreementId);
        require(msg.sender == agreement.client, "FlowWork: only client");
        require(agreement.status == AgreementStatus.Disputed, "FlowWork: agreement not disputed");
        require(block.timestamp > agreement.updatedAt + DISPUTE_TIMEOUT, "FlowWork: timeout not elapsed");

        agreement.status = AgreementStatus.Cancelled;
        pendingWithdrawals[agreement.client] += agreement.totalAmount - agreement.releasedAmount;
        agreement.updatedAt = block.timestamp;

        emit AgreementCancelled(agreementId);
    }

    function cancelAgreement(uint256 agreementId) external nonReentrant {
        Agreement storage agreement = _requireAgreement(agreementId);
        require(msg.sender == agreement.client, "FlowWork: only client");

        if (agreement.status == AgreementStatus.Open) {
            pendingWithdrawals[agreement.client] += agreement.totalAmount;
        } else if (agreement.status == AgreementStatus.Active) {
            require(agreement.deadline != 0 && block.timestamp > agreement.deadline, "FlowWork: deadline not passed");
            uint256 unreleasedAmount = agreement.totalAmount - agreement.releasedAmount;
            pendingWithdrawals[agreement.client] += unreleasedAmount;
        } else {
            revert("FlowWork: cannot cancel");
        }

        agreement.status = AgreementStatus.Cancelled;
        agreement.updatedAt = block.timestamp;

        emit AgreementCancelled(agreementId);
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        pendingWithdrawals[msg.sender] = 0;

        usdc.safeTransfer(msg.sender, amount);

        emit WithdrawalClaimed(msg.sender, amount);
    }

    function getAgreement(uint256 agreementId) external view returns (Agreement memory) {
        return _requireAgreement(agreementId);
    }

    function getMilestone(uint256 agreementId, uint256 milestoneIndex) external view returns (Milestone memory) {
        return _requireMilestone(agreementId, milestoneIndex);
    }

    function getClientAgreements(address client) external view returns (uint256[] memory) {
        return _clientAgreements[client];
    }

    function getContributorAgreements(address contributor) external view returns (uint256[] memory) {
        return _contributorAgreements[contributor];
    }

    function getMilestones(uint256 agreementId) external view returns (Milestone[] memory) {
        _requireAgreement(agreementId);
        return _milestonesByAgreement[agreementId];
    }

    function _allMilestonesApproved(uint256 agreementId) internal view returns (bool) {
        Milestone[] storage milestones = _milestonesByAgreement[agreementId];
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.Approved) {
                return false;
            }
        }
        return true;
    }

    function _requireAgreement(uint256 agreementId) internal view returns (Agreement storage agreement) {
        agreement = _agreements[agreementId];
        require(agreement.id != 0, "FlowWork: agreement does not exist");
    }

    function _requireMilestone(
        uint256 agreementId,
        uint256 milestoneIndex
    ) internal view returns (Milestone storage milestone) {
        Milestone[] storage milestones = _milestonesByAgreement[agreementId];
        require(milestoneIndex < milestones.length, "FlowWork: invalid milestone index");
        milestone = milestones[milestoneIndex];
    }
}

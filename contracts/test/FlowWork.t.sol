// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {FlowWork} from "../FlowWork.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

contract FlowWorkTest is Test {
    // ───────────────────────────────────────────────
    //  Constants & addresses
    // ───────────────────────────────────────────────
    uint256 internal constant USDC_DECIMALS = 6;
    uint256 internal constant ONE_USDC = 1e6;

    address internal client      = makeAddr("client");
    address internal contributor = makeAddr("contributor");
    address internal arbiter     = makeAddr("arbiter");
    address internal stranger    = makeAddr("stranger");

    // ───────────────────────────────────────────────
    //  Shared state
    // ───────────────────────────────────────────────
    MockERC20  internal usdc;
    FlowWork   internal fw;

    // ───────────────────────────────────────────────
    //  setUp — runs before EVERY test
    // ───────────────────────────────────────────────
    function setUp() public {
        usdc = new MockERC20("Mock USDC", "mUSDC", 6);
        fw   = new FlowWork(address(usdc));

        // Fund client generously
        usdc.mint(client, 1_000_000 * ONE_USDC);
        vm.prank(client);
        usdc.approve(address(fw), type(uint256).max);
    }

    // ═══════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════

    /// @dev Create a standard 2-milestone agreement (100 + 200 USDC).
    function _createStdAgreement() internal returns (uint256 id) {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * ONE_USDC;
        amounts[1] = 200 * ONE_USDC;

        string[] memory titles = new string[](2);
        titles[0] = "Milestone 1";
        titles[1] = "Milestone 2";

        vm.prank(client);
        id = fw.createAgreement(contributor, arbiter, "Test Agreement", amounts, titles, 0);
    }

    /// @dev Create a 1-milestone agreement with a specific deadline.
    function _createAgreementWithDeadline(uint256 deadline) internal returns (uint256 id) {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * ONE_USDC;

        string[] memory titles = new string[](1);
        titles[0] = "Milestone 1";

        vm.prank(client);
        id = fw.createAgreement(contributor, arbiter, "Deadline Agreement", amounts, titles, deadline);
    }

    /// @dev Create a 1-milestone agreement with NO arbiter.
    function _createNoArbiterAgreement() internal returns (uint256 id) {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * ONE_USDC;

        string[] memory titles = new string[](1);
        titles[0] = "Milestone 1";

        vm.prank(client);
        id = fw.createAgreement(contributor, address(0), "No Arbiter", amounts, titles, 0);
    }

    // ═══════════════════════════════════════════════
    //  1. DEPLOYMENT / CONSTRUCTOR
    // ═══════════════════════════════════════════════

    function test_Constructor_SetsUsdc() public view {
        assertEq(address(fw.usdc()), address(usdc));
    }

    function test_Constructor_AgreementCountStartsAtOne() public view {
        assertEq(fw.agreementCount(), 1);
    }

    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(bytes("FlowWork: zero USDC address"));
        new FlowWork(address(0));
    }

    // ═══════════════════════════════════════════════
    //  2. createAgreement — happy path & reverts
    // ═══════════════════════════════════════════════

    function test_CreateAgreement_HappyPath() public {
        vm.expectEmit(true, true, true, true, address(fw));
        emit FlowWork.AgreementCreated(1, client, contributor, 300 * ONE_USDC);

        uint256 id = _createStdAgreement();

        assertEq(id, 1);
        assertEq(fw.agreementCount(), 2);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(ag.id, 1);
        assertEq(ag.client, client);
        assertEq(ag.contributor, contributor);
        assertEq(ag.arbiter, arbiter);
        assertEq(ag.totalAmount, 300 * ONE_USDC);
        assertEq(ag.releasedAmount, 0);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Open));
        assertEq(ag.milestoneCount, 2);

        // Escrow holds the funds
        assertEq(usdc.balanceOf(address(fw)), 300 * ONE_USDC);
    }

    function test_CreateAgreement_StoresClientAndContributorIndexes() public {
        uint256 id = _createStdAgreement();
        uint256[] memory clientAgs = fw.getClientAgreements(client);
        uint256[] memory contribAgs = fw.getContributorAgreements(contributor);
        assertEq(clientAgs.length, 1);
        assertEq(clientAgs[0], id);
        assertEq(contribAgs.length, 1);
        assertEq(contribAgs[0], id);
    }

    function test_CreateAgreement_StoresMilestones() public {
        uint256 id = _createStdAgreement();
        FlowWork.Milestone[] memory ms = fw.getMilestones(id);
        assertEq(ms.length, 2);
        assertEq(ms[0].amount, 100 * ONE_USDC);
        assertEq(ms[1].amount, 200 * ONE_USDC);
        assertEq(uint8(ms[0].status), uint8(FlowWork.MilestoneStatus.Pending));
        assertEq(uint8(ms[1].status), uint8(FlowWork.MilestoneStatus.Pending));
    }

    function test_CreateAgreement_RevertsZeroContributor() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: zero contributor"));
        fw.createAgreement(address(0), address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsContributorIsClient() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: contributor is client"));
        fw.createAgreement(client, address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsTitleTooLong() public {
        // Build a 101-char title
        bytes memory longTitle = new bytes(101);
        for (uint256 i = 0; i < 101; i++) longTitle[i] = 0x41; // 'A'

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: title too long"));
        fw.createAgreement(contributor, address(0), string(longTitle), amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsZeroMilestones() public {
        uint256[] memory amounts = new uint256[](0);
        string[] memory titles = new string[](0);
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: invalid milestone count"));
        fw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsSixMilestones() public {
        uint256[] memory amounts = new uint256[](6);
        string[] memory titles = new string[](6);
        for (uint256 i = 0; i < 6; i++) {
            amounts[i] = ONE_USDC;
            titles[i] = "M";
        }
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: invalid milestone count"));
        fw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsArrayMismatch() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = ONE_USDC;
        amounts[1] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: mismatched milestone arrays"));
        fw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsZeroMilestoneAmount() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 0;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: zero milestone amount"));
        fw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
    }

    function test_CreateAgreement_RevertsInvalidDeadline() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: invalid deadline"));
        fw.createAgreement(contributor, address(0), "T", amounts, titles, block.timestamp);
    }

    function test_CreateAgreement_FeeOnTransferReverts() public {
        // Deploy a separate fee token
        MockERC20 feeToken = new MockERC20("FeeToken", "FT", 6);
        feeToken.setFeeBps(100); // 1% fee
        feeToken.mint(client, 1_000 * ONE_USDC);

        FlowWork feefw = new FlowWork(address(feeToken));

        vm.prank(client);
        feeToken.approve(address(feefw), type(uint256).max);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";

        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: transfer amount mismatch"));
        feefw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
    }

    // ═══════════════════════════════════════════════
    //  3. acceptAgreement
    // ═══════════════════════════════════════════════

    function test_AcceptAgreement_HappyPath() public {
        uint256 id = _createStdAgreement();

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementAccepted(id);

        vm.prank(contributor);
        fw.acceptAgreement(id);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Active));
    }

    function test_AcceptAgreement_RevertsNonContributor() public {
        uint256 id = _createStdAgreement();
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only contributor"));
        fw.acceptAgreement(id);
    }

    function test_AcceptAgreement_RevertsAlreadyActive() public {
        uint256 id = _createStdAgreement();
        vm.prank(contributor);
        fw.acceptAgreement(id);
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: agreement not open"));
        fw.acceptAgreement(id);
    }

    function test_AcceptAgreement_RevertsNonExistentAgreement() public {
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: agreement does not exist"));
        fw.acceptAgreement(999);
    }

    // ═══════════════════════════════════════════════
    //  4. submitDelivery
    // ═══════════════════════════════════════════════

    function _activateStdAgreement() internal returns (uint256 id) {
        id = _createStdAgreement();
        vm.prank(contributor);
        fw.acceptAgreement(id);
    }

    function test_SubmitDelivery_HappyPath() public {
        uint256 id = _activateStdAgreement();
        bytes32 hash = keccak256("delivery-proof");

        vm.expectEmit(true, false, false, true, address(fw));
        emit FlowWork.DeliverySubmitted(id, 0, hash);

        vm.prank(contributor);
        fw.submitDelivery(id, 0, hash);

        FlowWork.Milestone memory ms = fw.getMilestone(id, 0);
        assertEq(uint8(ms.status), uint8(FlowWork.MilestoneStatus.Submitted));
        assertEq(ms.deliveryHash, hash);
        assertGt(ms.submittedAt, 0);
    }

    function test_SubmitDelivery_RevertsNonContributor() public {
        uint256 id = _activateStdAgreement();
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only contributor"));
        fw.submitDelivery(id, 0, keccak256("x"));
    }

    function test_SubmitDelivery_RevertsWhenOpen() public {
        uint256 id = _createStdAgreement();
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: agreement not active"));
        fw.submitDelivery(id, 0, keccak256("x"));
    }

    function test_SubmitDelivery_RevertsZeroHash() public {
        uint256 id = _activateStdAgreement();
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: zero delivery hash"));
        fw.submitDelivery(id, 0, bytes32(0));
    }

    function test_SubmitDelivery_RevertsInvalidMilestoneIndex() public {
        uint256 id = _activateStdAgreement();
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: invalid milestone index"));
        fw.submitDelivery(id, 99, keccak256("x"));
    }

    function test_SubmitDelivery_RevertsAlreadySubmitted() public {
        uint256 id = _activateStdAgreement();
        vm.prank(contributor);
        fw.submitDelivery(id, 0, keccak256("first"));
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: milestone not pending"));
        fw.submitDelivery(id, 0, keccak256("second"));
    }

    // ═══════════════════════════════════════════════
    //  5. approveMilestone (client path)
    // ═══════════════════════════════════════════════

    function _submitMilestone(uint256 id, uint256 idx) internal {
        vm.prank(contributor);
        fw.submitDelivery(id, idx, keccak256(abi.encodePacked("delivery", id, idx)));
    }

    function test_ApproveMilestone_HappyPath_SingleMilestone() public {
        // Use a 1-milestone agreement so approval triggers AgreementCompleted
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        uint256 id = fw.createAgreement(contributor, arbiter, "Single", amounts, titles, 0);
        vm.prank(contributor);
        fw.acceptAgreement(id);
        _submitMilestone(id, 0);

        // Contract emits MilestoneApproved first, then AgreementCompleted
        vm.expectEmit(true, false, false, true, address(fw));
        emit FlowWork.MilestoneApproved(id, 0, 100 * ONE_USDC);

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementCompleted(id);

        vm.prank(client);
        fw.approveMilestone(id, 0);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Completed));
        assertEq(ag.releasedAmount, 100 * ONE_USDC);
        assertEq(fw.pendingWithdrawals(contributor), 100 * ONE_USDC);
    }

    function test_ApproveMilestone_PartialApproval_StaysActive() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);

        vm.prank(client);
        fw.approveMilestone(id, 0);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        // Still Active because milestone 1 is not yet approved
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Active));
        assertEq(ag.releasedAmount, 100 * ONE_USDC);
        assertEq(fw.pendingWithdrawals(contributor), 100 * ONE_USDC);
    }

    function test_ApproveMilestone_AllMilestones_Completes() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);

        _submitMilestone(id, 1);
        vm.prank(client);
        fw.approveMilestone(id, 1);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Completed));
        assertEq(ag.releasedAmount, 300 * ONE_USDC);
        assertEq(fw.pendingWithdrawals(contributor), 300 * ONE_USDC);
    }

    function test_ApproveMilestone_RevertsNonClient() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only client when active"));
        fw.approveMilestone(id, 0);
    }

    function test_ApproveMilestone_RevertsWhenNotSubmitted() public {
        uint256 id = _activateStdAgreement();
        // milestone 0 is still Pending
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: milestone not submitted"));
        fw.approveMilestone(id, 0);
    }

    function test_ApproveMilestone_RevertsOnCancelledAgreement() public {
        uint256 id = _createStdAgreement(); // Open status
        // Cancel it immediately (from Open)
        vm.prank(client);
        fw.cancelAgreement(id);

        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: invalid agreement status"));
        fw.approveMilestone(id, 0);
    }

    // ═══════════════════════════════════════════════
    //  6. FULL HAPPY PATH: create → accept → submit → approve → withdraw
    // ═══════════════════════════════════════════════

    function test_FullHappyPath_TwoMilestones_Withdraw() public {
        uint256 id = _activateStdAgreement();

        // Submit & approve milestone 0
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);

        // Submit & approve milestone 1
        _submitMilestone(id, 1);
        vm.prank(client);
        fw.approveMilestone(id, 1);

        assertEq(uint8(fw.getAgreement(id).status), uint8(FlowWork.AgreementStatus.Completed));

        uint256 contribBalBefore = usdc.balanceOf(contributor);

        vm.expectEmit(true, false, false, true, address(fw));
        emit FlowWork.WithdrawalClaimed(contributor, 300 * ONE_USDC);

        vm.prank(contributor);
        fw.withdraw();

        assertEq(usdc.balanceOf(contributor), contribBalBefore + 300 * ONE_USDC);
        assertEq(fw.pendingWithdrawals(contributor), 0);
    }

    // ═══════════════════════════════════════════════
    //  7. cancelAgreement
    // ═══════════════════════════════════════════════

    function test_CancelAgreement_FromOpen_FullRefund() public {
        uint256 id = _createStdAgreement();
        uint256 clientBalBefore = usdc.balanceOf(client);
        // escrow holds 300 USDC at this point

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementCancelled(id);

        vm.prank(client);
        fw.cancelAgreement(id);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Cancelled));
        assertEq(fw.pendingWithdrawals(client), 300 * ONE_USDC);

        // Client withdraws the full escrow
        vm.prank(client);
        fw.withdraw();
        assertEq(usdc.balanceOf(client), clientBalBefore + 300 * ONE_USDC);
    }

    function test_CancelAgreement_FromActive_AfterDeadline_PartialRefund() public {
        uint256 deadline = block.timestamp + 7 days;
        uint256 id = _createAgreementWithDeadline(deadline);
        vm.prank(contributor);
        fw.acceptAgreement(id);

        // Submit & approve the single milestone to partially release
        _submitMilestone(id, 0);
        // But we want to cancel NOT approve — let's test with a fresh 2-milestone agreement
        // Create a fresh 2-milestone deal with deadline
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * ONE_USDC;
        amounts[1] = 200 * ONE_USDC;
        string[] memory titles = new string[](2);
        titles[0] = "M1";
        titles[1] = "M2";
        uint256 dl = block.timestamp + 3 days;
        vm.prank(client);
        uint256 id2 = fw.createAgreement(contributor, address(0), "Cancellable", amounts, titles, dl);
        vm.prank(contributor);
        fw.acceptAgreement(id2);

        // Approve milestone 0 to establish a releasedAmount
        _submitMilestone(id2, 0);
        vm.prank(client);
        fw.approveMilestone(id2, 0);
        assertEq(fw.getAgreement(id2).releasedAmount, 100 * ONE_USDC);

        // Warp past deadline
        vm.warp(dl + 1);

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementCancelled(id2);

        vm.prank(client);
        fw.cancelAgreement(id2);

        FlowWork.Agreement memory ag = fw.getAgreement(id2);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Cancelled));
        // Unreleased = 300 - 100 = 200 USDC should be claimable
        assertEq(fw.pendingWithdrawals(client), 200 * ONE_USDC);
    }

    function test_CancelAgreement_RevertsNonClient() public {
        uint256 id = _createStdAgreement();
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only client"));
        fw.cancelAgreement(id);
    }

    function test_CancelAgreement_RevertsActiveWithoutDeadline() public {
        uint256 id = _activateStdAgreement(); // no deadline
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: deadline not passed"));
        fw.cancelAgreement(id);
    }

    function test_CancelAgreement_RevertsActiveBeforeDeadline() public {
        uint256 deadline = block.timestamp + 7 days;
        uint256 id = _createAgreementWithDeadline(deadline);
        vm.prank(contributor);
        fw.acceptAgreement(id);

        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: deadline not passed"));
        fw.cancelAgreement(id);
    }

    function test_CancelAgreement_RevertsCompleted() public {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        uint256 id = fw.createAgreement(contributor, address(0), "T", amounts, titles, 0);
        vm.prank(contributor);
        fw.acceptAgreement(id);
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);
        // Agreement is now Completed
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: cannot cancel"));
        fw.cancelAgreement(id);
    }

    // ═══════════════════════════════════════════════
    //  8. disputeMilestone
    // ═══════════════════════════════════════════════

    function test_DisputeMilestone_HappyPath() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);

        vm.expectEmit(true, false, false, true, address(fw));
        emit FlowWork.MilestoneDisputed(id, 0);

        vm.prank(client);
        fw.disputeMilestone(id, 0);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Disputed));
        FlowWork.Milestone memory ms = fw.getMilestone(id, 0);
        assertEq(uint8(ms.status), uint8(FlowWork.MilestoneStatus.Disputed));
    }

    function test_DisputeMilestone_RevertsNoArbiter() public {
        uint256 id = _createNoArbiterAgreement();
        vm.prank(contributor);
        fw.acceptAgreement(id);
        _submitMilestone(id, 0);
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: no arbiter set"));
        fw.disputeMilestone(id, 0);
    }

    function test_DisputeMilestone_RevertsNonClient() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only client"));
        fw.disputeMilestone(id, 0);
    }

    function test_DisputeMilestone_RevertsWhenNotActive() public {
        // Cancel a freshly-created (Open) agreement → status becomes Cancelled
        uint256 id = _createStdAgreement();
        vm.prank(client);
        fw.cancelAgreement(id);  // now Cancelled

        // disputeMilestone requires Active status → must revert
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: agreement not active"));
        fw.disputeMilestone(id, 0);
    }

    function test_DisputeMilestone_RevertsNotSubmitted() public {
        uint256 id = _activateStdAgreement();
        // Milestone is Pending (not Submitted) → revert
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: milestone not submitted"));
        fw.disputeMilestone(id, 0);
    }

    // ═══════════════════════════════════════════════
    //  9. approveMilestone (arbiter path — Disputed)
    // ═══════════════════════════════════════════════

    function test_ArbiterApproveMilestone_ResolvesDispute() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);

        vm.prank(client);
        fw.disputeMilestone(id, 0);

        // Arbiter approves the disputed milestone
        vm.expectEmit(true, false, false, true, address(fw));
        emit FlowWork.MilestoneApproved(id, 0, 100 * ONE_USDC);

        vm.prank(arbiter);
        fw.approveMilestone(id, 0);

        // One milestone remains → back to Active
        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Active));
        assertEq(fw.pendingWithdrawals(contributor), 100 * ONE_USDC);
    }

    function test_ArbiterApproveMilestone_LastMilestone_Completes() public {
        // Single milestone agreement
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * ONE_USDC;
        string[] memory titles = new string[](1);
        titles[0] = "M1";
        vm.prank(client);
        uint256 id = fw.createAgreement(contributor, arbiter, "Single", amounts, titles, 0);
        vm.prank(contributor);
        fw.acceptAgreement(id);
        _submitMilestone(id, 0);

        vm.prank(client);
        fw.disputeMilestone(id, 0);

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementCompleted(id);

        vm.prank(arbiter);
        fw.approveMilestone(id, 0);

        assertEq(uint8(fw.getAgreement(id).status), uint8(FlowWork.AgreementStatus.Completed));
    }

    function test_ArbiterApproveMilestone_RevertsNonArbiter() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.disputeMilestone(id, 0);

        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only arbiter when disputed"));
        fw.approveMilestone(id, 0);
    }

    function test_ArbiterApproveMilestone_ClientCannotApproveWhenDisputed() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.disputeMilestone(id, 0);

        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: only arbiter when disputed"));
        fw.approveMilestone(id, 0);
    }

    // ═══════════════════════════════════════════════
    //  10. forceCloseDispute
    // ═══════════════════════════════════════════════

    function test_ForceCloseDispute_HappyPath() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);

        // Approve milestone 0 so releasedAmount = 100 USDC
        vm.prank(client);
        fw.approveMilestone(id, 0);

        // Submit & dispute milestone 1
        _submitMilestone(id, 1);
        vm.prank(client);
        fw.disputeMilestone(id, 1);

        uint256 disputedAt = fw.getAgreement(id).updatedAt;

        // Warp past DISPUTE_TIMEOUT
        vm.warp(disputedAt + 30 days + 1);

        vm.expectEmit(true, false, false, false, address(fw));
        emit FlowWork.AgreementCancelled(id);

        vm.prank(client);
        fw.forceCloseDispute(id);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(uint8(ag.status), uint8(FlowWork.AgreementStatus.Cancelled));
        // Unreleased = 300 - 100 = 200 USDC credited to client
        assertEq(fw.pendingWithdrawals(client), 200 * ONE_USDC);
    }

    function test_ForceCloseDispute_RevertsNonClient() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.disputeMilestone(id, 0);
        vm.warp(block.timestamp + 31 days);

        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: only client"));
        fw.forceCloseDispute(id);
    }

    function test_ForceCloseDispute_RevertsNotDisputed() public {
        uint256 id = _activateStdAgreement();
        vm.warp(block.timestamp + 31 days);
        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: agreement not disputed"));
        fw.forceCloseDispute(id);
    }

    function test_ForceCloseDispute_RevertsBeforeTimeout() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.disputeMilestone(id, 0);

        // Only 10 days elapsed (< 30)
        vm.warp(block.timestamp + 10 days);

        vm.prank(client);
        vm.expectRevert(bytes("FlowWork: timeout not elapsed"));
        fw.forceCloseDispute(id);
    }

    // ═══════════════════════════════════════════════
    //  11. withdraw
    // ═══════════════════════════════════════════════

    function test_Withdraw_ZeroBalance_Reverts() public {
        // withdraw() now guards against zero amount
        vm.prank(stranger);
        vm.expectRevert(bytes("FlowWork: nothing to withdraw"));
        fw.withdraw();
    }

    function test_Withdraw_ClearsBalanceAndTransfersTokens() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);

        assertEq(fw.pendingWithdrawals(contributor), 100 * ONE_USDC);

        uint256 balBefore = usdc.balanceOf(contributor);
        vm.prank(contributor);
        fw.withdraw();

        assertEq(usdc.balanceOf(contributor), balBefore + 100 * ONE_USDC);
        assertEq(fw.pendingWithdrawals(contributor), 0);
    }

    function test_Withdraw_CannotDoubleWithdraw() public {
        uint256 id = _activateStdAgreement();
        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);

        vm.prank(contributor);
        fw.withdraw();
        // Second withdraw — pendingWithdrawals is now 0 → must revert
        vm.prank(contributor);
        vm.expectRevert(bytes("FlowWork: nothing to withdraw"));
        fw.withdraw();
    }

    // ═══════════════════════════════════════════════
    //  12. FUZZ: milestoneAmounts within valid range
    // ═══════════════════════════════════════════════

    function testFuzz_CreateAgreement_ValidMilestoneAmounts(
        uint8 milestoneCountRaw,
        uint256[5] memory rawAmounts
    ) public {
        // Bound milestone count to [1, 5]
        uint256 milestoneCount = bound(uint256(milestoneCountRaw), 1, 5);

        uint256[] memory amounts = new uint256[](milestoneCount);
        string[] memory titles   = new string[](milestoneCount);
        uint256 totalExpected;

        for (uint256 i = 0; i < milestoneCount; i++) {
            // Each amount in [1, 1e12] (avoids overflow; stay sane for a 6-dec USDC mock)
            uint256 amt = bound(rawAmounts[i], 1, 1e12);
            amounts[i] = amt;
            titles[i]  = "M";
            totalExpected += amt;
        }

        // Mint & approve enough
        usdc.mint(client, totalExpected);
        // approve was set to max in setUp

        vm.prank(client);
        uint256 id = fw.createAgreement(contributor, address(0), "Fuzz", amounts, titles, 0);

        FlowWork.Agreement memory ag = fw.getAgreement(id);
        assertEq(ag.totalAmount, totalExpected);
        assertEq(ag.milestoneCount, milestoneCount);
        assertEq(usdc.balanceOf(address(fw)), totalExpected);
    }

    function testFuzz_FullFlow_TwoMilestones(uint128 amt0, uint128 amt1) public {
        uint256 a0 = bound(uint256(amt0), 1, 1e15);
        uint256 a1 = bound(uint256(amt1), 1, 1e15);
        uint256 total = a0 + a1;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = a0;
        amounts[1] = a1;
        string[] memory titles = new string[](2);
        titles[0] = "M1";
        titles[1] = "M2";

        usdc.mint(client, total);

        vm.prank(client);
        uint256 id = fw.createAgreement(contributor, address(0), "FuzzFlow", amounts, titles, 0);

        vm.prank(contributor);
        fw.acceptAgreement(id);

        _submitMilestone(id, 0);
        vm.prank(client);
        fw.approveMilestone(id, 0);

        _submitMilestone(id, 1);
        vm.prank(client);
        fw.approveMilestone(id, 1);

        assertEq(fw.pendingWithdrawals(contributor), total);

        uint256 balBefore = usdc.balanceOf(contributor);
        vm.prank(contributor);
        fw.withdraw();
        assertEq(usdc.balanceOf(contributor), balBefore + total);
    }

    // ═══════════════════════════════════════════════
    //  13. INVARIANT-STYLE: escrow balance ≥ sum of pending withdrawals
    // ═══════════════════════════════════════════════

    function test_Invariant_EscrowCoversAllPendingWithdrawals() public {
        // Create, fund, and partially approve two agreements
        uint256 id1 = _activateStdAgreement();
        _submitMilestone(id1, 0);
        vm.prank(client);
        fw.approveMilestone(id1, 0);

        // Second agreement — different contributor amounts
        uint256[] memory amounts2 = new uint256[](2);
        amounts2[0] = 50 * ONE_USDC;
        amounts2[1] = 75 * ONE_USDC;
        string[] memory titles2 = new string[](2);
        titles2[0] = "X";
        titles2[1] = "Y";

        address client2 = makeAddr("client2");
        address contrib2 = makeAddr("contrib2");
        usdc.mint(client2, 1_000 * ONE_USDC);
        vm.prank(client2);
        usdc.approve(address(fw), type(uint256).max);

        vm.prank(client2);
        uint256 id2 = fw.createAgreement(contrib2, address(0), "Inv2", amounts2, titles2, 0);
        vm.prank(contrib2);
        fw.acceptAgreement(id2);
        vm.prank(contrib2);
        fw.submitDelivery(id2, 0, keccak256("d"));
        vm.prank(client2);
        fw.approveMilestone(id2, 0);

        // escrow balance must be >= all pending withdrawals
        uint256 escrowBal = usdc.balanceOf(address(fw));
        uint256 pendingContrib  = fw.pendingWithdrawals(contributor);
        uint256 pendingContrib2 = fw.pendingWithdrawals(contrib2);
        assertGe(escrowBal, pendingContrib + pendingContrib2, "escrow must cover all pending withdrawals");
    }
}

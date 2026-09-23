// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Minimal ERC-20 mock used by FlowWork tests.
///      Includes an optional fee-on-transfer mode (feeBps > 0) to test the
///      "FlowWork: transfer amount mismatch" guard.
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    /// @dev When > 0, transferFrom deducts this many basis points from the
    ///      received amount (simulating a fee-on-transfer token).
    uint256 public feeBps;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function setFeeBps(uint256 _feeBps) external {
        feeBps = _feeBps;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "MockERC20: insufficient balance");
        balanceOf[msg.sender] -= amount;
        uint256 received = amount;
        if (feeBps > 0) {
            uint256 fee = (amount * feeBps) / 10_000;
            received = amount - fee;
            // fee is burned (totalSupply decreases)
            totalSupply -= fee;
        }
        balanceOf[to] += received;
        emit Transfer(msg.sender, to, received);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "MockERC20: insufficient balance");
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "MockERC20: insufficient allowance");
            allowance[from][msg.sender] = allowed - amount;
        }
        balanceOf[from] -= amount;
        uint256 received = amount;
        if (feeBps > 0) {
            uint256 fee = (amount * feeBps) / 10_000;
            received = amount - fee;
            totalSupply -= fee;
        }
        balanceOf[to] += received;
        emit Transfer(from, to, received);
        return true;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @dev 用于测试的ERC20代币合约
 */
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10 ** 18); // 铸造100万个代币
    }

    /**
     * @dev 铸造代币（仅用于测试）
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

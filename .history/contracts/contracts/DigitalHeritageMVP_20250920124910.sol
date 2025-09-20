// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DigitalHeritageMVP
 * @dev 数字遗产托管员MVP合约
 * 功能：90天无活动检测 + 多重签名验证 + 资产转移
 */
contract DigitalHeritageMVP is ReentrancyGuard, Ownable {
    // 事件定义
    event HeritageConfigured(address indexed owner, address indexed heir, address[] validators);
    event InactivityDetected(address indexed owner, uint256 lastActivity);
    event InheritanceTriggered(address indexed owner, address indexed heir);
    event InheritanceConfirmed(address indexed owner, address indexed heir, uint256 amount);
    event ActivityUpdated(address indexed owner, uint256 timestamp);
    
    // 结构体定义
    struct HeritageConfig {
        address heir;                    // 继承人地址
        address[] validators;           // 验证者列表
        uint256 lastActivity;          // 最后活动时间
        uint256 inactivityPeriod;      // 无活动期限（90天）
        bool isConfigured;             // 是否已配置
        bool isInheritanceTriggered;   // 是否已触发继承
        mapping(address => bool) validatorConfirmed; // 验证者确认状态
    }
    
    // 状态变量
    mapping(address => HeritageConfig) public heritageConfigs;
    mapping(address => uint256) public validatorConfirmations;
    uint256 public constant DEFAULT_INACTIVITY_PERIOD = 90 days;
    uint256 public constant REQUIRED_CONFIRMATIONS = 2; // 至少需要2个验证者确认
    
    // 修饰符
    modifier onlyConfigured() {
        require(heritageConfigs[msg.sender].isConfigured, "Heritage not configured");
        _;
    }
    
    modifier onlyValidator(address owner) {
        require(isValidator(owner, msg.sender), "Not a validator");
        _;
    }
    
    // 构造函数
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev 配置数字遗产
     * @param heir 继承人地址
     * @param validators 验证者地址列表
     */
    function configureHeritage(
        address heir,
        address[] memory validators
    ) external {
        require(heir != address(0), "Invalid heir address");
        require(validators.length >= 2, "At least 2 validators required");
        require(heir != msg.sender, "Heir cannot be owner");
        
        // 检查验证者地址有效性
        for (uint256 i = 0; i < validators.length; i++) {
            require(validators[i] != address(0), "Invalid validator address");
            require(validators[i] != msg.sender, "Validator cannot be owner");
            require(validators[i] != heir, "Validator cannot be heir");
        }
        
        // 配置遗产信息
        HeritageConfig storage config = heritageConfigs[msg.sender];
        config.heir = heir;
        config.validators = validators;
        config.lastActivity = block.timestamp;
        config.inactivityPeriod = DEFAULT_INACTIVITY_PERIOD;
        config.isConfigured = true;
        config.isInheritanceTriggered = false;
        
        emit HeritageConfigured(msg.sender, heir, validators);
    }
    
    /**
     * @dev 更新活动时间（心跳检测）
     */
    function updateActivity() external onlyConfigured {
        require(!heritageConfigs[msg.sender].isInheritanceTriggered, "Inheritance already triggered");
        
        heritageConfigs[msg.sender].lastActivity = block.timestamp;
        emit ActivityUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev 检查无活动状态
     */
    function checkInactivity() external onlyConfigured {
        HeritageConfig storage config = heritageConfigs[msg.sender];
        require(!config.isInheritanceTriggered, "Inheritance already triggered");
        
        if (block.timestamp - config.lastActivity >= config.inactivityPeriod) {
            config.isInheritanceTriggered = true;
            emit InactivityDetected(msg.sender, config.lastActivity);
            emit InheritanceTriggered(msg.sender, config.heir);
        }
    }
    
    /**
     * @dev 验证者确认继承
     */
    function confirmInheritance(address owner) external onlyValidator(owner) {
        HeritageConfig storage config = heritageConfigs[owner];
        require(config.isInheritanceTriggered, "Inheritance not triggered");
        require(!config.validatorConfirmed[msg.sender], "Already confirmed");
        
        config.validatorConfirmed[msg.sender] = true;
        validatorConfirmations[owner]++;
        
        // 检查是否达到所需确认数量
        if (validatorConfirmations[owner] >= REQUIRED_CONFIRMATIONS) {
            _executeInheritance(owner);
        }
    }
    
    /**
     * @dev 执行继承（转移资产）
     */
    function _executeInheritance(address owner) internal {
        HeritageConfig storage config = heritageConfigs[owner];
        address heir = config.heir;
        
        // 获取合约中的ETH余额
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            payable(heir).transfer(ethBalance);
        }
        
        emit InheritanceConfirmed(owner, heir, ethBalance);
    }
    
    /**
     * @dev 转移ERC20代币给继承人
     * @param token 代币合约地址
     * @param amount 转移数量
     */
    function transferTokenToHeir(address token, uint256 amount) external onlyConfigured {
        HeritageConfig storage config = heritageConfigs[msg.sender];
        require(config.isInheritanceTriggered, "Inheritance not triggered");
        require(validatorConfirmations[msg.sender] >= REQUIRED_CONFIRMATIONS, "Insufficient confirmations");
        
        IERC20(token).transfer(config.heir, amount);
        emit InheritanceConfirmed(msg.sender, config.heir, amount);
    }
    
    /**
     * @dev 检查是否为验证者
     */
    function isValidator(address owner, address validator) public view returns (bool) {
        address[] memory validators = heritageConfigs[owner].validators;
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev 获取遗产配置信息
     */
    function getHeritageConfig(address owner) external view returns (
        address heir,
        address[] memory validators,
        uint256 lastActivity,
        uint256 inactivityPeriod,
        bool isConfigured,
        bool isInheritanceTriggered,
        uint256 confirmations
    ) {
        HeritageConfig storage config = heritageConfigs[owner];
        return (
            config.heir,
            config.validators,
            config.lastActivity,
            config.inactivityPeriod,
            config.isConfigured,
            config.isInheritanceTriggered,
            validatorConfirmations[owner]
        );
    }
    
    /**
     * @dev 获取验证者确认状态
     */
    function getValidatorConfirmation(address owner, address validator) external view returns (bool) {
        return heritageConfigs[owner].validatorConfirmed[validator];
    }
    
    // 接收ETH
    receive() external payable {}
}

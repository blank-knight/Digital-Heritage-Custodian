const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigitalHeritageMVP", function () {
  let digitalHeritage;
  let mockToken;
  let owner, heir, validator1, validator2, validator3;
  
  beforeEach(async function () {
    [owner, heir, validator1, validator2, validator3] = await ethers.getSigners();
    
    // 部署DigitalHeritageMVP合约
    const DigitalHeritageMVP = await ethers.getContractFactory("DigitalHeritageMVP");
    digitalHeritage = await DigitalHeritageMVP.deploy();
    await digitalHeritage.waitForDeployment();
    
    // 部署MockERC20代币
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TEST");
    await mockToken.waitForDeployment();
    
    // 给owner一些代币
    await mockToken.mint(owner.address, ethers.parseEther("1000"));
  });
  
  describe("配置数字遗产", function () {
    it("应该能够配置遗产信息", async function () {
      const validators = [validator1.address, validator2.address];
      
      await digitalHeritage.connect(owner).configureHeritage(heir.address, validators);
      
      const config = await digitalHeritage.getHeritageConfig(owner.address);
      expect(config.heir).to.equal(heir.address);
      expect(config.validators).to.deep.equal(validators);
      expect(config.isConfigured).to.be.true;
    });
    
    it("应该拒绝无效的配置", async function () {
      const validators = [validator1.address, validator2.address];
      
      // 继承人不能是零地址
      await expect(
        digitalHeritage.connect(owner).configureHeritage(ethers.ZeroAddress, validators)
      ).to.be.revertedWith("Invalid heir address");
      
      // 继承人不能是owner自己
      await expect(
        digitalHeritage.connect(owner).configureHeritage(owner.address, validators)
      ).to.be.revertedWith("Heir cannot be owner");
      
      // 至少需要2个验证者
      await expect(
        digitalHeritage.connect(owner).configureHeritage(heir.address, [validator1.address])
      ).to.be.revertedWith("At least 2 validators required");
    });
  });
  
  describe("心跳检测", function () {
    beforeEach(async function () {
      const validators = [validator1.address, validator2.address];
      await digitalHeritage.connect(owner).configureHeritage(heir.address, validators);
    });
    
    it("应该能够更新活动时间", async function () {
      await digitalHeritage.connect(owner).updateActivity();
      
      const config = await digitalHeritage.getHeritageConfig(owner.address);
      expect(config.lastActivity).to.be.greaterThan(0);
    });
    
    it("应该在90天后触发继承", async function () {
      // 模拟90天后的时间
      await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await digitalHeritage.connect(owner).checkInactivity();
      
      const config = await digitalHeritage.getHeritageConfig(owner.address);
      expect(config.isInheritanceTriggered).to.be.true;
    });
  });
  
  describe("继承流程", function () {
    beforeEach(async function () {
      const validators = [validator1.address, validator2.address];
      await digitalHeritage.connect(owner).configureHeritage(heir.address, validators);
      
      // 触发继承
      await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await digitalHeritage.connect(owner).checkInactivity();
    });
    
    it("应该能够确认继承", async function () {
      await digitalHeritage.connect(validator1).confirmInheritance(owner.address);
      await digitalHeritage.connect(validator2).confirmInheritance(owner.address);
      
      const confirmations = await digitalHeritage.validatorConfirmations(owner.address);
      expect(confirmations).to.equal(2);
    });
    
    it("应该拒绝非验证者确认", async function () {
      await expect(
        digitalHeritage.connect(validator3).confirmInheritance(owner.address)
      ).to.be.revertedWith("Not a validator");
    });
    
    it("应该拒绝重复确认", async function () {
      await digitalHeritage.connect(validator1).confirmInheritance(owner.address);
      
      await expect(
        digitalHeritage.connect(validator1).confirmInheritance(owner.address)
      ).to.be.revertedWith("Already confirmed");
    });
  });
  
  describe("代币转移", function () {
    beforeEach(async function () {
      const validators = [validator1.address, validator2.address];
      await digitalHeritage.connect(owner).configureHeritage(heir.address, validators);
      
      // 触发继承并确认
      await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      await digitalHeritage.connect(owner).checkInactivity();
      await digitalHeritage.connect(validator1).confirmInheritance(owner.address);
      await digitalHeritage.connect(validator2).confirmInheritance(owner.address);
    });
    
    it("应该能够转移ERC20代币", async function () {
      const amount = ethers.parseEther("100");
      
      // 授权合约转移代币
      await mockToken.connect(owner).approve(await digitalHeritage.getAddress(), amount);
      
      // 转移代币给继承人
      await digitalHeritage.connect(owner).transferTokenToHeir(await mockToken.getAddress(), amount);
      
      const heirBalance = await mockToken.balanceOf(heir.address);
      expect(heirBalance).to.equal(amount);
    });
  });
});

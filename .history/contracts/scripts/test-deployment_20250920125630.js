const { ethers } = require("hardhat");

async function main() {
  console.log("开始测试部署的合约...");
  
  // 读取部署信息
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    const data = fs.readFileSync('deployment.json', 'utf8');
    deploymentInfo = JSON.parse(data);
  } catch (error) {
    console.error("无法读取部署信息文件:", error.message);
    return;
  }
  
  const { digitalHeritageAddress, mockTokenAddress } = deploymentInfo;
  
  if (!digitalHeritageAddress || !mockTokenAddress) {
    console.error("部署信息不完整");
    return;
  }
  
  // 获取合约实例
  const DigitalHeritageMVP = await ethers.getContractFactory("DigitalHeritageMVP");
  const digitalHeritage = DigitalHeritageMVP.attach(digitalHeritageAddress);
  
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = MockERC20.attach(mockTokenAddress);
  
  // 获取测试账户
  const [owner, heir, validator1, validator2] = await ethers.getSigners();
  
  console.log("测试账户:");
  console.log("Owner:", owner.address);
  console.log("Heir:", heir.address);
  console.log("Validator1:", validator1.address);
  console.log("Validator2:", validator2.address);
  
  try {
    // 测试1: 配置遗产
    console.log("\n测试1: 配置遗产...");
    const validators = [validator1.address, validator2.address];
    const tx1 = await digitalHeritage.connect(owner).configureHeritage(heir.address, validators);
    await tx1.wait();
    console.log("✓ 遗产配置成功");
    
    // 测试2: 检查配置
    console.log("\n测试2: 检查配置...");
    const config = await digitalHeritage.getHeritageConfig(owner.address);
    console.log("继承人:", config.heir);
    console.log("验证者数量:", config.validators.length);
    console.log("是否已配置:", config.isConfigured);
    
    // 测试3: 更新活动
    console.log("\n测试3: 更新活动...");
    const tx2 = await digitalHeritage.connect(owner).updateActivity();
    await tx2.wait();
    console.log("✓ 活动更新成功");
    
    // 测试4: 检查代币余额
    console.log("\n测试4: 检查代币余额...");
    const balance = await mockToken.balanceOf(owner.address);
    console.log("Owner代币余额:", ethers.formatEther(balance), "DHT");
    
    // 测试5: 授权代币转移
    console.log("\n测试5: 授权代币转移...");
    const amount = ethers.parseEther("100");
    const tx3 = await mockToken.connect(owner).approve(digitalHeritageAddress, amount);
    await tx3.wait();
    console.log("✓ 代币授权成功");
    
    // 测试6: 模拟时间流逝（仅用于测试）
    console.log("\n测试6: 模拟90天无活动...");
    await ethers.provider.send("evm_increaseTime", [90 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");
    
    const tx4 = await digitalHeritage.connect(owner).checkInactivity();
    await tx4.wait();
    console.log("✓ 无活动检测成功");
    
    // 测试7: 验证者确认
    console.log("\n测试7: 验证者确认...");
    const tx5 = await digitalHeritage.connect(validator1).confirmInheritance(owner.address);
    await tx5.wait();
    console.log("✓ Validator1确认成功");
    
    const tx6 = await digitalHeritage.connect(validator2).confirmInheritance(owner.address);
    await tx6.wait();
    console.log("✓ Validator2确认成功");
    
    // 测试8: 转移代币
    console.log("\n测试8: 转移代币...");
    const tx7 = await digitalHeritage.connect(owner).transferTokenToHeir(mockTokenAddress, amount);
    await tx7.wait();
    console.log("✓ 代币转移成功");
    
    // 检查最终状态
    console.log("\n最终状态检查:");
    const heirBalance = await mockToken.balanceOf(heir.address);
    console.log("继承人代币余额:", ethers.formatEther(heirBalance), "DHT");
    
    const finalConfig = await digitalHeritage.getHeritageConfig(owner.address);
    console.log("继承是否已触发:", finalConfig.isInheritanceTriggered);
    console.log("确认数量:", finalConfig.confirmations);
    
    console.log("\n✅ 所有测试通过！");
    
  } catch (error) {
    console.error("测试失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("测试失败:", error);
    process.exit(1);
  });

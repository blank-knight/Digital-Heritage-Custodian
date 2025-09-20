const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署数字遗产托管员合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  console.log("部署者余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // 部署DigitalHeritageMVP合约
  console.log("\n部署DigitalHeritageMVP合约...");
  const DigitalHeritageMVP = await ethers.getContractFactory("DigitalHeritageMVP");
  const digitalHeritage = await DigitalHeritageMVP.deploy();
  await digitalHeritage.waitForDeployment();
  
  const digitalHeritageAddress = await digitalHeritage.getAddress();
  console.log("DigitalHeritageMVP合约地址:", digitalHeritageAddress);
  
  // 部署MockERC20代币（用于测试）
  console.log("\n部署MockERC20代币...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Digital Heritage Token", "DHT");
  await mockToken.waitForDeployment();
  
  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockERC20代币地址:", mockTokenAddress);
  
  // 铸造一些代币给部署者
  const mintAmount = ethers.parseEther("1000000");
  await mockToken.mint(deployer.address, mintAmount);
  console.log("已铸造", ethers.formatEther(mintAmount), "DHT代币给部署者");
  
  // 输出部署信息
  console.log("\n=== 部署完成 ===");
  console.log("网络:", await ethers.provider.getNetwork());
  console.log("DigitalHeritageMVP合约地址:", digitalHeritageAddress);
  console.log("MockERC20代币地址:", mockTokenAddress);
  console.log("部署者地址:", deployer.address);
  
  // 保存部署信息到文件
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    digitalHeritageAddress: digitalHeritageAddress,
    mockTokenAddress: mockTokenAddress,
    deployerAddress: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n部署信息已保存到 deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });

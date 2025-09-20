const { ethers } = require("hardhat");

async function main() {
  console.log("开始验证合约...");
  
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
  
  console.log("DigitalHeritageMVP合约地址:", digitalHeritageAddress);
  console.log("MockERC20代币地址:", mockTokenAddress);
  
  // 验证合约
  try {
    console.log("\n验证DigitalHeritageMVP合约...");
    await hre.run("verify:verify", {
      address: digitalHeritageAddress,
      constructorArguments: [],
    });
    console.log("DigitalHeritageMVP合约验证成功");
  } catch (error) {
    console.error("DigitalHeritageMVP合约验证失败:", error.message);
  }
  
  try {
    console.log("\n验证MockERC20合约...");
    await hre.run("verify:verify", {
      address: mockTokenAddress,
      constructorArguments: ["Digital Heritage Token", "DHT"],
    });
    console.log("MockERC20合约验证成功");
  } catch (error) {
    console.error("MockERC20合约验证失败:", error.message);
  }
  
  console.log("\n验证完成");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("验证失败:", error);
    process.exit(1);
  });

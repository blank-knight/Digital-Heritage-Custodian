const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署数字遗产托管员合约到Monad测试网...");
  
  // 使用测试私钥（请替换为您的实际私钥）
  const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("部署者地址:", wallet.address);
  console.log("部署者余额:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
  
  // 部署DigitalHeritageMVP合约
  console.log("\n部署DigitalHeritageMVP合约...");
  const DigitalHeritageMVP = await ethers.getContractFactory("DigitalHeritageMVP");
  const digitalHeritage = await DigitalHeritageMVP.connect(wallet).deploy();
  await digitalHeritage.waitForDeployment();
  
  const digitalHeritageAddress = await digitalHeritage.getAddress();
  console.log("DigitalHeritageMVP合约地址:", digitalHeritageAddress);
  
  // 部署MockERC20代币（用于测试）
  console.log("\n部署MockERC20代币...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.connect(wallet).deploy("Digital Heritage Token", "DHT");
  await mockToken.waitForDeployment();
  
  const mockTokenAddress = await mockToken.getAddress();
  console.log("MockERC20代币地址:", mockTokenAddress);
  
  // 铸造一些代币给部署者
  const mintAmount = ethers.parseEther("1000000");
  await mockToken.mint(wallet.address, mintAmount);
  console.log("已铸造", ethers.formatEther(mintAmount), "DHT代币给部署者");
  
  // 输出部署信息
  console.log("\n=== 部署完成 ===");
  console.log("网络: Monad测试网");
  console.log("DigitalHeritageMVP合约地址:", digitalHeritageAddress);
  console.log("MockERC20代币地址:", mockTokenAddress);
  console.log("部署者地址:", wallet.address);
  
  // 保存部署信息到文件
  const deploymentInfo = {
    network: "Monad Testnet",
    digitalHeritageAddress: digitalHeritageAddress,
    mockTokenAddress: mockTokenAddress,
    deployerAddress: wallet.address,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n部署信息已保存到 deployment.json");
  
  console.log("\n请将以下合约地址更新到前端代码中:");
  console.log("frontend/src/hooks/useWeb3.js 第80行:");
  console.log(`const contractAddress = '${digitalHeritageAddress}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });


import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment on 0G Galileo testnet...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "OG");

  // Deploy ZAI Token
  console.log("\n1. Deploying ZAI Token...");
  const ZAI = await hre.ethers.getContractFactory("ZAI");
  const zai = await ZAI.deploy();
  await zai.waitForDeployment();
  const zaiAddress = await zai.getAddress();
  console.log("ZAI Token deployed to:", zaiAddress);

  // Deploy ContributorNFT
  console.log("\n2. Deploying ContributorNFT...");
  const ContributorNFT = await hre.ethers.getContractFactory("ContributorNFT");
  const contributorNFT = await ContributorNFT.deploy();
  await contributorNFT.waitForDeployment();
  const contributorNFTAddress = await contributorNFT.getAddress();
  console.log("ContributorNFT deployed to:", contributorNFTAddress);

  // Deploy DatasetRegistry
  console.log("\n3. Deploying DatasetRegistry...");
  const DatasetRegistry = await hre.ethers.getContractFactory("DatasetRegistry");
  const datasetRegistry = await DatasetRegistry.deploy(zaiAddress, deployer.address);
  await datasetRegistry.waitForDeployment();
  const datasetRegistryAddress = await datasetRegistry.getAddress();
  console.log("DatasetRegistry deployed to:", datasetRegistryAddress);

  // Mint additional ZAI tokens to demo wallets
  console.log("\n4. Minting ZAI tokens to demo wallets...");
  const demoWallet1 = "0x742d35Cc6634C0532925a3b8D0CaC5E5e8b8e4C8";
  const demoWallet2 = "0x83B7c4c8f3a3e9f2e7b6c5d4a3b2c1f0e9d8c7b6";
  const tokenAmount = hre.ethers.parseEther("1000"); // 1000 ZAI tokens
  
  await zai.mint(demoWallet1, tokenAmount);
  console.log(`Minted 1000 ZAI to demo wallet 1: ${demoWallet1}`);
  
  await zai.mint(demoWallet2, tokenAmount);
  console.log(`Minted 1000 ZAI to demo wallet 2: ${demoWallet2}`);
  
  // Create addresses.json for frontend
  const addresses = {
    ZAI: zaiAddress,
    ContributorNFT: contributorNFTAddress,
    DatasetRegistry: datasetRegistryAddress,
    demoWallets: {
      wallet1: demoWallet1,
      wallet2: demoWallet2
    },
    chainId: 16601
  };

  const frontendConstantsDir = path.join(__dirname, "../../client/src/lib/contracts");
  if (!fs.existsSync(frontendConstantsDir)) {
    fs.mkdirSync(frontendConstantsDir, { recursive: true });
  }

  const addressesPath = path.join(frontendConstantsDir, "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log("\n✅ Deployment completed!");
  console.log("📄 Contract addresses saved to:", addressesPath);
  console.log("\n📋 Deployed Contracts:");
  console.log("ZAI Token:", zaiAddress);
  console.log("ContributorNFT:", contributorNFTAddress);
  console.log("DatasetRegistry:", datasetRegistryAddress);
  console.log("\n💰 Demo Wallets with 1000 ZAI:");
  console.log("Wallet 1:", demoWallet1);
  console.log("Wallet 2:", demoWallet2);
  console.log("\n🔗 View on Explorer:");
  console.log(`https://chainscan-galileo.0g.ai/address/${zaiAddress}`);
  console.log(`https://chainscan-galileo.0g.ai/address/${contributorNFTAddress}`);
  console.log(`https://chainscan-galileo.0g.ai/address/${datasetRegistryAddress}`);
  console.log("\n🔑 Environment Variables:");
  console.log(`VITE_ZAI_ADDRESS=${zaiAddress}`);
  console.log(`VITE_DATASET_REGISTRY_ADDRESS=${datasetRegistryAddress}`);
  console.log(`VITE_CONTRIBUTOR_NFT_ADDRESS=${contributorNFTAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

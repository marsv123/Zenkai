import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting deployment on 0G Galileo testnet...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "OG");

  // Deploy IMT Token
  console.log("\n1. Deploying IMT Token...");
  const IMT = await ethers.getContractFactory("IMT");
  const imt = await IMT.deploy();
  await imt.waitForDeployment();
  const imtAddress = await imt.getAddress();
  console.log("IMT Token deployed to:", imtAddress);

  // Deploy ContributorNFT
  console.log("\n2. Deploying ContributorNFT...");
  const ContributorNFT = await ethers.getContractFactory("ContributorNFT");
  const contributorNFT = await ContributorNFT.deploy();
  await contributorNFT.waitForDeployment();
  const contributorNFTAddress = await contributorNFT.getAddress();
  console.log("ContributorNFT deployed to:", contributorNFTAddress);

  // Deploy DatasetRegistry
  console.log("\n3. Deploying DatasetRegistry...");
  const DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
  const datasetRegistry = await DatasetRegistry.deploy(imtAddress, deployer.address);
  await datasetRegistry.waitForDeployment();
  const datasetRegistryAddress = await datasetRegistry.getAddress();
  console.log("DatasetRegistry deployed to:", datasetRegistryAddress);

  // Create addresses.json for frontend
  const addresses = {
    IMT: imtAddress,
    ContributorNFT: contributorNFTAddress,
    DatasetRegistry: datasetRegistryAddress,
    chainId: 16601
  };

  const frontendConstantsDir = path.join(__dirname, "../../frontend/constants");
  if (!fs.existsSync(frontendConstantsDir)) {
    fs.mkdirSync(frontendConstantsDir, { recursive: true });
  }

  const addressesPath = path.join(frontendConstantsDir, "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

  console.log("\n✅ Deployment completed!");
  console.log("📄 Contract addresses saved to:", addressesPath);
  console.log("\n📋 Deployed Contracts:");
  console.log("IMT Token:", imtAddress);
  console.log("ContributorNFT:", contributorNFTAddress);
  console.log("DatasetRegistry:", datasetRegistryAddress);
  console.log("\n🔗 View on Explorer:");
  console.log(`https://chainscan-galileo.0g.ai/address/${imtAddress}`);
  console.log(`https://chainscan-galileo.0g.ai/address/${contributorNFTAddress}`);
  console.log(`https://chainscan-galileo.0g.ai/address/${datasetRegistryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

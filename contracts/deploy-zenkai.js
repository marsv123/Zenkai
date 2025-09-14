import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deployZenkai() {
  try {
    console.log('🚀 Starting Zenkai smart contract deployment to 0G Galileo testnet...\n');
    
    // Environment setup
    const RPC_URL = process.env.RPC_0G || 'https://evmrpc-testnet.0g.ai';
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    
    // Connect to 0G Galileo testnet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('Deployer address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'OG\n');
    
    // Load compiled contracts
    const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
    const zaiBytecode = fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.bin', 'utf8');
    
    const contributorNFTAbi = JSON.parse(fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.abi', 'utf8'));
    const contributorNFTBytecode = fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.bin', 'utf8');
    
    const datasetRegistryAbi = JSON.parse(fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.abi', 'utf8'));
    const datasetRegistryBytecode = fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.bin', 'utf8');
    
    // Deploy ZAI Token
    console.log('1️⃣ Deploying ZAI Token...');
    const zaiFactory = new ethers.ContractFactory(zaiAbi, zaiBytecode, wallet);
    const zai = await zaiFactory.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await zai.waitForDeployment();
    const zaiAddress = await zai.getAddress();
    console.log('   ✅ ZAI Token deployed to:', zaiAddress);
    
    // Deploy ContributorNFT
    console.log('\n2️⃣ Deploying ContributorNFT...');
    const contributorNFTFactory = new ethers.ContractFactory(contributorNFTAbi, contributorNFTBytecode, wallet);
    const contributorNFT = await contributorNFTFactory.deploy({
      gasLimit: 2000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await contributorNFT.waitForDeployment();
    const contributorNFTAddress = await contributorNFT.getAddress();
    console.log('   ✅ ContributorNFT deployed to:', contributorNFTAddress);
    
    // Deploy DatasetRegistry
    console.log('\n3️⃣ Deploying DatasetRegistry...');
    const datasetRegistryFactory = new ethers.ContractFactory(datasetRegistryAbi, datasetRegistryBytecode, wallet);
    const datasetRegistry = await datasetRegistryFactory.deploy(zaiAddress, wallet.address, {
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await datasetRegistry.waitForDeployment();
    const datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log('   ✅ DatasetRegistry deployed to:', datasetRegistryAddress);
    
    // Mint initial ZAI tokens to demo wallets
    console.log('\n4️⃣ Minting ZAI tokens...');
    const demoWallet1 = '0x742d35Cc6634C0532925a3b8D0CaC5E5e8b8e4C8';
    const demoWallet2 = '0x83B7c4c8f3a3e9f2e7b6c5d4a3b2c1f0e9d8c7b6';
    const tokenAmount = ethers.parseEther('1000'); // 1000 ZAI tokens
    
    // Mint 1000 ZAI to each demo wallet
    const mintTx1 = await zai.mint(demoWallet1, tokenAmount, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await mintTx1.wait();
    console.log('   ✅ Minted 1000 ZAI to demo wallet 1:', demoWallet1);
    
    const mintTx2 = await zai.mint(demoWallet2, tokenAmount, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });
    await mintTx2.wait();
    console.log('   ✅ Minted 1000 ZAI to demo wallet 2:', demoWallet2);
    
    // Export contract addresses and ABIs to frontend
    console.log('\n5️⃣ Exporting contract data to frontend...');
    
    const addresses = {
      ZAI: zaiAddress,
      ContributorNFT: contributorNFTAddress,
      DatasetRegistry: datasetRegistryAddress,
      demoWallets: {
        wallet1: demoWallet1,
        wallet2: demoWallet2
      },
      chainId: 16601,
      deployedAt: new Date().toISOString()
    };
    
    const abis = {
      ZAI: zaiAbi,
      ContributorNFT: contributorNFTAbi,
      DatasetRegistry: datasetRegistryAbi
    };
    
    // Create frontend contracts directory
    const frontendContractsDir = path.join(__dirname, '../client/src/lib/contracts');
    if (!fs.existsSync(frontendContractsDir)) {
      fs.mkdirSync(frontendContractsDir, { recursive: true });
    }
    
    // Write addresses and ABIs
    fs.writeFileSync(
      path.join(frontendContractsDir, 'addresses.json'),
      JSON.stringify(addresses, null, 2)
    );
    
    fs.writeFileSync(
      path.join(frontendContractsDir, 'abis.json'),
      JSON.stringify(abis, null, 2)
    );
    
    console.log('   ✅ Contract data exported to frontend');
    
    // Generate deployment summary
    console.log('\n🎉 ZENKAI DEPLOYMENT COMPLETED! 🎉\n');
    console.log('📋 DEPLOYED CONTRACTS:');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`✅ ZAI Token: ${zaiAddress}`);
    console.log(`✅ ContributorNFT: ${contributorNFTAddress}`);
    console.log(`✅ DatasetRegistry: ${datasetRegistryAddress}`);
    
    console.log('\n🔗 EXPLORER LINKS:');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`ZAI Token: https://chainscan-galileo.0g.ai/address/${zaiAddress}`);
    console.log(`ContributorNFT: https://chainscan-galileo.0g.ai/address/${contributorNFTAddress}`);
    console.log(`DatasetRegistry: https://chainscan-galileo.0g.ai/address/${datasetRegistryAddress}`);
    
    console.log('\n💰 DEMO WALLETS (1000 ZAI each):');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`Wallet 1: ${demoWallet1}`);
    console.log(`Wallet 2: ${demoWallet2}`);
    
    console.log('\n🔑 ENVIRONMENT VARIABLES:');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`VITE_ZAI_ADDRESS=${zaiAddress}`);
    console.log(`VITE_DATASET_REGISTRY_ADDRESS=${datasetRegistryAddress}`);
    console.log(`VITE_CONTRIBUTOR_NFT_ADDRESS=${contributorNFTAddress}`);
    
    console.log('\n📦 FILES CREATED:');
    console.log('══════════════════════════════════════════════════════════════');
    console.log('- client/src/lib/contracts/addresses.json');
    console.log('- client/src/lib/contracts/abis.json');
    
    console.log('\n🚀 Ready for frontend integration!');
    
    return {
      zaiAddress,
      contributorNFTAddress,
      datasetRegistryAddress,
      demoWallets: { wallet1: demoWallet1, wallet2: demoWallet2 }
    };
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the deployment
deployZenkai();
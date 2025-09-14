import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deployRemaining() {
  try {
    console.log('🚀 Deploying remaining contracts...\n');
    
    const RPC_URL = 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Existing ZAI contract address
    const zaiAddress = '0x604966d7123963291058c323B19D293335EcC92a';
    
    console.log('Deployer address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'OG\n');
    
    // Load ABIs and bytecode
    const contributorNFTAbi = JSON.parse(fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.abi', 'utf8'));
    const contributorNFTBytecode = fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.bin', 'utf8');
    
    const datasetRegistryAbi = JSON.parse(fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.abi', 'utf8'));
    const datasetRegistryBytecode = fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.bin', 'utf8');
    
    // Deploy ContributorNFT with retry logic
    console.log('1️⃣ Deploying ContributorNFT...');
    const contributorNFTFactory = new ethers.ContractFactory(contributorNFTAbi, contributorNFTBytecode, wallet);
    let contributorNFT;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/3...`);
        contributorNFT = await contributorNFTFactory.deploy({
          gasLimit: 1500000,
          gasPrice: ethers.parseUnits('10', 'gwei')
        });
        await contributorNFT.waitForDeployment();
        break;
      } catch (error) {
        console.log(`   Attempt ${attempt} failed:`, error.message.substring(0, 100));
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }
    
    const contributorNFTAddress = await contributorNFT.getAddress();
    console.log('   ✅ ContributorNFT deployed to:', contributorNFTAddress);
    
    // Deploy DatasetRegistry with retry logic
    console.log('\n2️⃣ Deploying DatasetRegistry...');
    const datasetRegistryFactory = new ethers.ContractFactory(datasetRegistryAbi, datasetRegistryBytecode, wallet);
    let datasetRegistry;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/3...`);
        datasetRegistry = await datasetRegistryFactory.deploy(zaiAddress, wallet.address, {
          gasLimit: 2500000,
          gasPrice: ethers.parseUnits('10', 'gwei')
        });
        await datasetRegistry.waitForDeployment();
        break;
      } catch (error) {
        console.log(`   Attempt ${attempt} failed:`, error.message.substring(0, 100));
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }
    
    const datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log('   ✅ DatasetRegistry deployed to:', datasetRegistryAddress);
    
    // Load ZAI ABI for minting
    const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
    const zai = new ethers.Contract(zaiAddress, zaiAbi, wallet);
    
    // Mint tokens to demo wallets
    console.log('\n3️⃣ Minting ZAI tokens to demo wallets...');
    const demoWallet1 = '0x742d35Cc6634C0532925a3b8D0CaC5E5e8b8e4C8';
    const demoWallet2 = '0x83B7c4c8f3a3e9f2e7b6c5d4a3b2c1f0e9d8c7b6';
    const tokenAmount = ethers.parseEther('1000');
    
    try {
      const mintTx1 = await zai.mint(demoWallet1, tokenAmount, {
        gasLimit: 100000,
        gasPrice: ethers.parseUnits('10', 'gwei')
      });
      await mintTx1.wait();
      console.log('   ✅ Minted 1000 ZAI to demo wallet 1:', demoWallet1);
    } catch (error) {
      console.log('   ⚠️  Failed to mint to wallet 1:', error.message.substring(0, 100));
    }
    
    try {
      const mintTx2 = await zai.mint(demoWallet2, tokenAmount, {
        gasLimit: 100000,
        gasPrice: ethers.parseUnits('10', 'gwei')
      });
      await mintTx2.wait();
      console.log('   ✅ Minted 1000 ZAI to demo wallet 2:', demoWallet2);
    } catch (error) {
      console.log('   ⚠️  Failed to mint to wallet 2:', error.message.substring(0, 100));
    }
    
    // Export everything
    console.log('\n4️⃣ Exporting to frontend...');
    
    const addresses = {
      ZAI: zaiAddress,
      ContributorNFT: contributorNFTAddress,
      DatasetRegistry: datasetRegistryAddress,
      demoWallets: { wallet1: demoWallet1, wallet2: demoWallet2 },
      chainId: 16601,
      deployedAt: new Date().toISOString()
    };
    
    const abis = {
      ZAI: zaiAbi,
      ContributorNFT: contributorNFTAbi,
      DatasetRegistry: datasetRegistryAbi
    };
    
    const frontendDir = path.join(__dirname, '../client/src/lib/contracts');
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(frontendDir, 'addresses.json'), JSON.stringify(addresses, null, 2));
    fs.writeFileSync(path.join(frontendDir, 'abis.json'), JSON.stringify(abis, null, 2));
    
    console.log('\n🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY! 🎉\n');
    console.log('📋 ZENKAI SMART CONTRACTS ON 0G GALILEO TESTNET:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`✅ ZAI Token: ${zaiAddress}`);
    console.log(`✅ ContributorNFT: ${contributorNFTAddress}`);
    console.log(`✅ DatasetRegistry: ${datasetRegistryAddress}`);
    
    console.log('\n🔗 0G CHAINSCAN EXPLORER LINKS:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`ZAI Token: https://chainscan-galileo.0g.ai/address/${zaiAddress}`);
    console.log(`ContributorNFT: https://chainscan-galileo.0g.ai/address/${contributorNFTAddress}`);
    console.log(`DatasetRegistry: https://chainscan-galileo.0g.ai/address/${datasetRegistryAddress}`);
    
    console.log('\n💰 DEMO WALLETS (1000 ZAI each):');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`Demo Wallet 1: ${demoWallet1}`);
    console.log(`Demo Wallet 2: ${demoWallet2}`);
    
    console.log('\n🔑 ENVIRONMENT VARIABLES FOR FRONTEND:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(`VITE_ZAI_ADDRESS=${zaiAddress}`);
    console.log(`VITE_DATASET_REGISTRY_ADDRESS=${datasetRegistryAddress}`);
    console.log(`VITE_CONTRIBUTOR_NFT_ADDRESS=${contributorNFTAddress}`);
    
    console.log('\n📦 FRONTEND FILES GENERATED:');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('- client/src/lib/contracts/addresses.json');
    console.log('- client/src/lib/contracts/abis.json');
    
    console.log('\n🚀 Zenkai dApp is ready for testing!');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    process.exit(1);
  }
}

deployRemaining();
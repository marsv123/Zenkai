import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function finishDeployment() {
  try {
    console.log('🚀 Finishing Zenkai deployment on 0G Galileo testnet...\n');
    
    const RPC_URL = 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Existing contract addresses
    const zaiAddress = '0x604966d7123963291058c323B19D293335EcC92a';
    const contributorNFTAddress = '0x2A96200Cdd3195aA9b2B4E6D8a986c942aaa207D';
    
    console.log('Deployer address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'OG\n');
    
    // Load compiled contract data
    const datasetRegistryAbi = JSON.parse(fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.abi', 'utf8'));
    const datasetRegistryBytecode = fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.bin', 'utf8');
    const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
    
    // Deploy DatasetRegistry
    console.log('1️⃣ Deploying DatasetRegistry...');
    const datasetRegistryFactory = new ethers.ContractFactory(datasetRegistryAbi, datasetRegistryBytecode, wallet);
    const datasetRegistry = await datasetRegistryFactory.deploy(zaiAddress, wallet.address, {
      gasLimit: 2500000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    
    await datasetRegistry.waitForDeployment();
    const datasetRegistryAddress = await datasetRegistry.getAddress();
    console.log('   ✅ DatasetRegistry deployed to:', datasetRegistryAddress);
    console.log('   🔗 Explorer:', `https://chainscan-galileo.0g.ai/address/${datasetRegistryAddress}\n`);
    
    // Generate demo wallets
    console.log('2️⃣ Generating demo wallets...');
    const demoWallet1 = ethers.Wallet.createRandom();
    const demoWallet2 = ethers.Wallet.createRandom();
    
    console.log('   Demo Wallet A:', demoWallet1.address);
    console.log('   Demo Wallet A Private Key:', demoWallet1.privateKey);
    console.log('   Demo Wallet B:', demoWallet2.address); 
    console.log('   Demo Wallet B Private Key:', demoWallet2.privateKey);
    
    // Connect to ZAI contract and mint tokens
    console.log('\n3️⃣ Minting ZAI tokens to demo wallets...');
    const zai = new ethers.Contract(zaiAddress, zaiAbi, wallet);
    const tokenAmount = ethers.parseEther('1000');
    
    const mintTx1 = await zai.mint(demoWallet1.address, tokenAmount, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await mintTx1.wait();
    console.log('   ✅ Minted 1000 ZAI to Demo Wallet A');
    
    const mintTx2 = await zai.mint(demoWallet2.address, tokenAmount, {
      gasLimit: 100000, 
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await mintTx2.wait();
    console.log('   ✅ Minted 1000 ZAI to Demo Wallet B');
    
    // Verify balances
    console.log('\n4️⃣ Verifying demo wallet balances...');
    const balance1 = await zai.balanceOf(demoWallet1.address);
    const balance2 = await zai.balanceOf(demoWallet2.address);
    console.log('   Demo Wallet A ZAI balance:', ethers.formatEther(balance1));
    console.log('   Demo Wallet B ZAI balance:', ethers.formatEther(balance2));
    
    // Export to frontend
    console.log('\n5️⃣ Updating frontend contracts...');
    const addresses = {
      ZAI: zaiAddress,
      ContributorNFT: contributorNFTAddress,
      DatasetRegistry: datasetRegistryAddress,
      demoWallets: {
        walletA: {
          address: demoWallet1.address,
          privateKey: demoWallet1.privateKey
        },
        walletB: {
          address: demoWallet2.address, 
          privateKey: demoWallet2.privateKey
        }
      },
      chainId: 16601,
      deployedAt: new Date().toISOString()
    };
    
    const contributorNFTAbi = JSON.parse(fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.abi', 'utf8'));
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
    console.log('   ✅ Frontend contracts updated');
    
    // Create .env file
    console.log('\n6️⃣ Creating client/.env file...');
    const envContent = `VITE_ZAI_ADDRESS=${zaiAddress}
VITE_DATASET_REGISTRY_ADDRESS=${datasetRegistryAddress}
VITE_CONTRIBUTOR_NFT_ADDRESS=${contributorNFTAddress}
`;
    
    fs.writeFileSync(path.join(__dirname, '../client/.env'), envContent);
    console.log('   ✅ client/.env file created');
    
    return {
      zaiAddress,
      contributorNFTAddress,
      datasetRegistryAddress,
      demoWallets: {
        walletA: { address: demoWallet1.address, privateKey: demoWallet1.privateKey },
        walletB: { address: demoWallet2.address, privateKey: demoWallet2.privateKey }
      }
    };
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    throw error;
  }
}

// Run the deployment
const result = await finishDeployment();
console.log('\n🎉 DEPLOYMENT COMPLETED!');

export { result };
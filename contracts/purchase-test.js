import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runPurchaseTest() {
  try {
    console.log('🧪 Running purchase test on Zenkai marketplace...\n');
    
    const RPC_URL = 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Contract addresses
    const zaiAddress = '0x604966d7123963291058c323B19D293335EcC92a';
    const datasetRegistryAddress = '0xa7502234A9e90172F237075a1872Ec7fF108FE77';
    
    // Demo wallet private keys
    const demoWalletAPrivateKey = '0x7c1f7edb6a0f5e59b0e772027bb5ffad08eb0199ad4cc591bc94e6c3766bbf5a';
    const demoWalletBPrivateKey = '0x881f45271757d1e1f2890849c78547f466363afe8923798358ce5e031749a335';
    
    // Create wallet instances
    const walletA = new ethers.Wallet(demoWalletAPrivateKey, provider);
    const walletB = new ethers.Wallet(demoWalletBPrivateKey, provider);
    const deployerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Demo Wallet A (Seller):', walletA.address);
    console.log('Demo Wallet B (Buyer):', walletB.address);
    console.log('Treasury/Deployer:', deployerWallet.address);
    
    // Load ABIs
    const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
    const datasetRegistryAbi = JSON.parse(fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.abi', 'utf8'));
    
    // Create contract instances
    const zaiA = new ethers.Contract(zaiAddress, zaiAbi, walletA);
    const zaiB = new ethers.Contract(zaiAddress, zaiAbi, walletB);
    const registryA = new ethers.Contract(datasetRegistryAddress, datasetRegistryAbi, walletA);
    const registryB = new ethers.Contract(datasetRegistryAddress, datasetRegistryAbi, walletB);
    const registryDeployer = new ethers.Contract(datasetRegistryAddress, datasetRegistryAbi, deployerWallet);
    
    // Check initial balances
    console.log('\\n📊 Initial balances:');
    const balanceA = await zaiA.balanceOf(walletA.address);
    const balanceB = await zaiB.balanceOf(walletB.address);
    const balanceDeployer = await zaiA.balanceOf(deployerWallet.address);
    console.log('   Wallet A:', ethers.formatEther(balanceA), 'ZAI');
    console.log('   Wallet B:', ethers.formatEther(balanceB), 'ZAI'); 
    console.log('   Treasury:', ethers.formatEther(balanceDeployer), 'ZAI');
    
    // Step 1: Register dataset with Wallet A
    console.log('\\n1️⃣ Registering dataset with Demo Wallet A...');
    const datasetURI = 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o'; // Placeholder IPFS CID
    const datasetPrice = ethers.parseEther('10'); // 10 ZAI
    
    const registerTx = await registryA.register(datasetURI, datasetPrice, {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    const registerReceipt = await registerTx.wait();
    
    // Get dataset ID from event
    const registerEvent = registerReceipt.logs.find(log => {
      try {
        const decoded = registryA.interface.parseLog(log);
        return decoded.name === 'Registered';
      } catch { return false; }
    });
    
    const datasetId = registerEvent ? registryA.interface.parseLog(registerEvent).args.datasetId : 1;
    
    console.log('   ✅ Dataset registered!');
    console.log('   📋 Dataset ID:', datasetId.toString());
    console.log('   📄 IPFS URI:', datasetURI);
    console.log('   💰 Price: 10 ZAI');
    console.log('   🔗 Tx:', `https://chainscan-galileo.0g.ai/tx/${registerTx.hash}`);
    
    // Step 2: Approve ZAI spending for Wallet B
    console.log('\\n2️⃣ Approving ZAI spending for Demo Wallet B...');
    const approveTx = await zaiB.approve(datasetRegistryAddress, datasetPrice, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await approveTx.wait();
    
    console.log('   ✅ Approved 10 ZAI for DatasetRegistry');
    console.log('   🔗 Tx:', `https://chainscan-galileo.0g.ai/tx/${approveTx.hash}`);
    
    // Step 3: Purchase dataset with Wallet B
    console.log('\\n3️⃣ Purchasing dataset with Demo Wallet B...');
    const buyTx = await registryB.buy(datasetId, {
      gasLimit: 300000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    const buyReceipt = await buyTx.wait();
    
    // Find AccessGranted event
    const accessEvent = buyReceipt.logs.find(log => {
      try {
        const decoded = registryB.interface.parseLog(log);
        return decoded.name === 'AccessGranted';
      } catch { return false; }
    });
    
    if (accessEvent) {
      const eventData = registryB.interface.parseLog(accessEvent);
      console.log('   ✅ Purchase successful!');
      console.log('   📋 Dataset ID:', eventData.args.datasetId.toString());
      console.log('   🛒 Buyer:', eventData.args.buyer);
      console.log('   👤 Seller:', eventData.args.owner);
      console.log('   💰 Price paid:', ethers.formatEther(eventData.args.price), 'ZAI');
    }
    
    console.log('   🔗 Purchase Tx:', `https://chainscan-galileo.0g.ai/tx/${buyTx.hash}`);
    
    // Step 4: Verify final balances
    console.log('\\n4️⃣ Verifying final balances...');
    const finalBalanceA = await zaiA.balanceOf(walletA.address);
    const finalBalanceB = await zaiB.balanceOf(walletB.address);
    const finalBalanceDeployer = await zaiA.balanceOf(deployerWallet.address);
    
    console.log('   Final balances:');
    console.log('   Wallet A (Seller):', ethers.formatEther(finalBalanceA), 'ZAI');
    console.log('   Wallet B (Buyer):', ethers.formatEther(finalBalanceB), 'ZAI');
    console.log('   Treasury:', ethers.formatEther(finalBalanceDeployer), 'ZAI');
    
    // Calculate changes
    const sellerChange = finalBalanceA - balanceA;
    const buyerChange = finalBalanceB - balanceB;
    const treasuryChange = finalBalanceDeployer - balanceDeployer;
    
    console.log('\\n   Balance changes:');
    console.log('   Seller received:', ethers.formatEther(sellerChange), 'ZAI');
    console.log('   Buyer paid:', ethers.formatEther(-buyerChange), 'ZAI');
    console.log('   Treasury fee:', ethers.formatEther(treasuryChange), 'ZAI');
    
    // Verify access
    console.log('\\n5️⃣ Verifying dataset access...');
    const hasAccess = await registryB.checkAccess(walletB.address, datasetId);
    console.log('   Buyer has access to dataset:', hasAccess ? '✅ YES' : '❌ NO');
    
    return {
      registerTx: registerTx.hash,
      buyTx: buyTx.hash,
      datasetId: datasetId.toString(),
      balanceChanges: {
        seller: ethers.formatEther(sellerChange),
        buyer: ethers.formatEther(-buyerChange),
        treasury: ethers.formatEther(treasuryChange)
      },
      hasAccess
    };
    
  } catch (error) {
    console.error('\\n❌ PURCHASE TEST FAILED:', error.message);
    throw error;
  }
}

// Run the test
const testResults = await runPurchaseTest();
console.log('\\n🎉 PURCHASE TEST COMPLETED SUCCESSFULLY!');

export { testResults };
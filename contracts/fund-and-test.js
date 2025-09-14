import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fundAndTest() {
  try {
    console.log('💰 Funding demo wallets and running purchase test...\n');
    
    const RPC_URL = 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Contract addresses
    const zaiAddress = '0x604966d7123963291058c323B19D293335EcC92a';
    const datasetRegistryAddress = '0xa7502234A9e90172F237075a1872Ec7fF108FE77';
    
    // Wallets
    const deployerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const demoWalletA = new ethers.Wallet('0x7c1f7edb6a0f5e59b0e772027bb5ffad08eb0199ad4cc591bc94e6c3766bbf5a', provider);
    const demoWalletB = new ethers.Wallet('0x881f45271757d1e1f2890849c78547f466363afe8923798358ce5e031749a335', provider);
    
    console.log('🔧 Funding demo wallets with OG for gas...');
    
    // Send 0.01 OG to each demo wallet
    const gasAmount = ethers.parseEther('0.01');
    
    const fundTx1 = await deployerWallet.sendTransaction({
      to: demoWalletA.address,
      value: gasAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await fundTx1.wait();
    console.log('   ✅ Funded Demo Wallet A with 0.01 OG');
    
    const fundTx2 = await deployerWallet.sendTransaction({
      to: demoWalletB.address,
      value: gasAmount,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await fundTx2.wait();
    console.log('   ✅ Funded Demo Wallet B with 0.01 OG');
    
    // Load ABIs
    const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
    const datasetRegistryAbi = JSON.parse(fs.readFileSync('compiled/contracts_DatasetRegistry_sol_DatasetRegistry.abi', 'utf8'));
    
    // Contract instances
    const zaiA = new ethers.Contract(zaiAddress, zaiAbi, demoWalletA);
    const zaiB = new ethers.Contract(zaiAddress, zaiAbi, demoWalletB);
    const registryA = new ethers.Contract(datasetRegistryAddress, datasetRegistryAbi, demoWalletA);
    const registryB = new ethers.Contract(datasetRegistryAddress, datasetRegistryAbi, demoWalletB);
    
    // Check balances
    console.log('\\n📊 Initial balances:');
    const balanceA_ZAI = await zaiA.balanceOf(demoWalletA.address);
    const balanceB_ZAI = await zaiB.balanceOf(demoWalletB.address);
    const balanceDeployer_ZAI = await zaiA.balanceOf(deployerWallet.address);
    
    console.log('   Wallet A ZAI:', ethers.formatEther(balanceA_ZAI));
    console.log('   Wallet B ZAI:', ethers.formatEther(balanceB_ZAI));
    console.log('   Treasury ZAI:', ethers.formatEther(balanceDeployer_ZAI));
    
    // 1. Register dataset with Wallet A
    console.log('\\n1️⃣ Registering dataset with Demo Wallet A...');
    const datasetURI = 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o';
    const datasetPrice = ethers.parseEther('10');
    
    const registerTx = await registryA.register(datasetURI, datasetPrice, {
      gasLimit: 150000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    const registerReceipt = await registerTx.wait();
    
    const registerEvent = registerReceipt.logs.find(log => {
      try {
        const decoded = registryA.interface.parseLog(log);
        return decoded.name === 'Registered';
      } catch { return false; }
    });
    
    const datasetId = registerEvent ? registryA.interface.parseLog(registerEvent).args.datasetId : 1;
    
    console.log('   ✅ Dataset registered with ID:', datasetId.toString());
    console.log('   🔗 Register Tx:', `https://chainscan-galileo.0g.ai/tx/${registerTx.hash}`);
    
    // 2. Approve ZAI spending for Wallet B
    console.log('\\n2️⃣ Approving ZAI spending for Demo Wallet B...');
    const approveTx = await zaiB.approve(datasetRegistryAddress, datasetPrice, {
      gasLimit: 80000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    await approveTx.wait();
    console.log('   ✅ Approved 10 ZAI for DatasetRegistry');
    console.log('   🔗 Approve Tx:', `https://chainscan-galileo.0g.ai/tx/${approveTx.hash}`);
    
    // 3. Purchase dataset with Wallet B
    console.log('\\n3️⃣ Purchasing dataset with Demo Wallet B...');
    const buyTx = await registryB.buy(datasetId, {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits('10', 'gwei')
    });
    const buyReceipt = await buyTx.wait();
    
    const accessEvent = buyReceipt.logs.find(log => {
      try {
        const decoded = registryB.interface.parseLog(log);
        return decoded.name === 'AccessGranted';
      } catch { return false; }
    });
    
    let eventData = null;
    if (accessEvent) {
      eventData = registryB.interface.parseLog(accessEvent);
      console.log('   ✅ Purchase successful!');
      console.log('   📋 Dataset ID:', eventData.args.datasetId.toString());
      console.log('   💰 Price paid:', ethers.formatEther(eventData.args.price), 'ZAI');
    }
    
    console.log('   🔗 Purchase Tx:', `https://chainscan-galileo.0g.ai/tx/${buyTx.hash}`);
    
    // 4. Verify final balances
    console.log('\\n4️⃣ Final balances:');
    const finalA_ZAI = await zaiA.balanceOf(demoWalletA.address);
    const finalB_ZAI = await zaiB.balanceOf(demoWalletB.address);
    const finalDeployer_ZAI = await zaiA.balanceOf(deployerWallet.address);
    
    console.log('   Wallet A (Seller):', ethers.formatEther(finalA_ZAI), 'ZAI');
    console.log('   Wallet B (Buyer):', ethers.formatEther(finalB_ZAI), 'ZAI');
    console.log('   Treasury:', ethers.formatEther(finalDeployer_ZAI), 'ZAI');
    
    // Calculate changes
    const sellerEarned = finalA_ZAI - balanceA_ZAI;
    const buyerSpent = balanceB_ZAI - finalB_ZAI;
    const treasuryFee = finalDeployer_ZAI - balanceDeployer_ZAI;
    
    console.log('\\n   💰 Transaction breakdown:');
    console.log('   Seller earned:', ethers.formatEther(sellerEarned), 'ZAI');
    console.log('   Buyer spent:', ethers.formatEther(buyerSpent), 'ZAI');
    console.log('   Treasury fee (4%):', ethers.formatEther(treasuryFee), 'ZAI');
    
    // Verify access
    const hasAccess = await registryB.checkAccess(demoWalletB.address, datasetId);
    console.log('\\n   🔐 Buyer has dataset access:', hasAccess ? '✅ YES' : '❌ NO');
    
    return {
      registerTx: registerTx.hash,
      approveTx: approveTx.hash,
      buyTx: buyTx.hash,
      datasetId: datasetId.toString(),
      results: {
        sellerEarned: ethers.formatEther(sellerEarned),
        buyerSpent: ethers.formatEther(buyerSpent),
        treasuryFee: ethers.formatEther(treasuryFee),
        accessGranted: hasAccess
      }
    };
    
  } catch (error) {
    console.error('\\n❌ TEST FAILED:', error.message);
    throw error;
  }
}

const testResults = await fundAndTest();
console.log('\\n🎉 PURCHASE TEST COMPLETED SUCCESSFULLY!');

export { testResults };
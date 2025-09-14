import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Export what we have so far
const zaiAddress = '0x604966d7123963291058c323B19D293335EcC92a';
const contributorNFTAddress = '0x2A96200Cdd3195aA9b2B4E6D8a986c942aaa207D';

console.log('📦 Exporting successfully deployed contracts...');

// Load ABIs
const zaiAbi = JSON.parse(fs.readFileSync('compiled/contracts_ZAI_sol_ZAI.abi', 'utf8'));
const contributorNFTAbi = JSON.parse(fs.readFileSync('compiled/contracts_ContributorNFT_sol_ContributorNFT.abi', 'utf8'));

const addresses = {
  ZAI: zaiAddress,
  ContributorNFT: contributorNFTAddress,
  DatasetRegistry: null, // To be deployed later
  demoWallets: {
    wallet1: '0x742d35Cc6634C0532925a3b8D0CaC5E5e8b8e4C8',
    wallet2: '0x83B7c4c8f3a3e9f2e7b6c5d4a3b2c1f0e9d8c7b6'
  },
  chainId: 16601,
  deployedAt: new Date().toISOString(),
  status: 'partial'
};

const abis = {
  ZAI: zaiAbi,
  ContributorNFT: contributorNFTAbi,
  DatasetRegistry: null // To be added later
};

const frontendDir = path.join(__dirname, '../client/src/lib/contracts');
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

fs.writeFileSync(path.join(frontendDir, 'addresses.json'), JSON.stringify(addresses, null, 2));
fs.writeFileSync(path.join(frontendDir, 'abis.json'), JSON.stringify(abis, null, 2));

console.log('✅ Partial deployment exported to frontend');
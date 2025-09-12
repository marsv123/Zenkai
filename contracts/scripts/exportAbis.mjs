import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportAbis() {
  console.log("Exporting contract ABIs...");

  const contractNames = ["IMT", "ContributorNFT", "DatasetRegistry"];
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const frontendAbiDir = path.join(__dirname, "../../frontend/constants/abi");

  // Create ABI directory if it doesn't exist
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }

  for (const contractName of contractNames) {
    try {
      const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
      
      if (!fs.existsSync(artifactPath)) {
        console.warn(`⚠️  Artifact not found: ${artifactPath}`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
      const abi = artifact.abi;

      const abiPath = path.join(frontendAbiDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
      
      console.log(`✅ Exported ${contractName} ABI to: ${abiPath}`);
    } catch (error) {
      console.error(`❌ Failed to export ${contractName} ABI:`, error.message);
    }
  }

  console.log("🎉 ABI export completed!");
}

exportAbis().catch(console.error);

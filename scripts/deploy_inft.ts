import { ethers } from "hardhat";
import { artifacts } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const royaltyReceiver = deployer.address;
  const royaltyBps = 500; // 5%

  const INFT = await ethers.getContractFactory("ZenkaiINFT");
  const inft = await INFT.deploy("Zenkai INFT", "ZINFT", deployer.address, royaltyReceiver, royaltyBps);
  await inft.waitForDeployment();
  const inftAddr = await inft.getAddress();
  console.log("ZenkaiINFT:", inftAddr);

  const outDir = path.resolve(__dirname, "../../client/src/lib/contracts");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const abisPath = path.join(outDir, "abis.json");
  const addrPath = path.join(outDir, "addresses.json");

  const inftAbi = (await artifacts.readArtifact("ZenkaiINFT")).abi;

  let abis: any = {};
  let addrs: any = {};
  try { abis = JSON.parse(fs.readFileSync(abisPath, "utf8")); } catch {}
  try { addrs = JSON.parse(fs.readFileSync(addrPath, "utf8")); } catch {}

  abis = { ...abis, ZenkaiINFT: inftAbi };
  addrs = { ...addrs, ZenkaiINFT: inftAddr };

  fs.writeFileSync(abisPath, JSON.stringify(abis, null, 2));
  fs.writeFileSync(addrPath, JSON.stringify(addrs, null, 2));

  console.log("Exported INFT ABI/address to frontend.");
}

main().catch((e) => { console.error(e); process.exit(1); });
import addresses from './addresses.json';

/**
 * Check if a contract address is valid (not a placeholder)
 */
export function isValidContractAddress(address: string): boolean {
  return address !== "0x0000000000000000000000000000000000000000" && address.length === 42;
}

/**
 * Check if ZenkaiINFT contract is deployed and ready for interaction
 */
export function isZenkaiINFTReady(): boolean {
  return isValidContractAddress(addresses.ZenkaiINFT);
}

/**
 * Get contract address if valid, throw error if not deployed
 */
export function requireValidContract(contractName: keyof typeof addresses): string {
  const address = addresses[contractName] as string;
  if (!isValidContractAddress(address)) {
    throw new Error(`${contractName} contract is not deployed. Please deploy the contract first.`);
  }
  return address;
}

/**
 * Contract deployment status for UI
 */
export function getContractStatus() {
  return {
    ZAI: { deployed: isValidContractAddress(addresses.ZAI), address: addresses.ZAI },
    ContributorNFT: { deployed: isValidContractAddress(addresses.ContributorNFT), address: addresses.ContributorNFT },
    DatasetRegistry: { deployed: isValidContractAddress(addresses.DatasetRegistry), address: addresses.DatasetRegistry },
    ZenkaiINFT: { deployed: isValidContractAddress(addresses.ZenkaiINFT), address: addresses.ZenkaiINFT }
  };
}

/**
 * Check if all required contracts are deployed
 */
export function areBasicContractsReady(): boolean {
  return isValidContractAddress(addresses.ZAI) && 
         isValidContractAddress(addresses.DatasetRegistry);
}

/**
 * Check if all contracts including INFT are deployed
 */
export function areAllContractsReady(): boolean {
  return areBasicContractsReady() && isZenkaiINFTReady();
}
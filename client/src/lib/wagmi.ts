import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { ogGalileo } from './og';

export const config = getDefaultConfig({
  appName: 'Zatori Intelligence Marketplace',
  projectId: 'zatori-0g-marketplace', // Replace with your WalletConnect Project ID
  chains: [ogGalileo, mainnet, polygon, optimism, arbitrum],
  ssr: true,
});
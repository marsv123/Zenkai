import { Chain } from 'viem';

export const ogGalileo: Chain = {
  id: 16601,
  name: '0G Galileo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: 'OG',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Galileo Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
};

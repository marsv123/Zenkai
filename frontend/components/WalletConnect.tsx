'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

export default function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors glow-effect flex items-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-6 py-2 bg-destructive text-destructive-foreground font-medium rounded-lg hover:bg-destructive/90 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-2">
                  {chain.hasIcon && (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="flex items-center space-x-2 px-3 py-1 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors"
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          className="w-4 h-4"
                        />
                      )}
                      <span className="text-sm text-secondary-foreground">
                        {chain.name}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-6 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{account.displayName}</span>
                    {account.displayBalance && (
                      <span className="text-sm opacity-75">
                        ({account.displayBalance})
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

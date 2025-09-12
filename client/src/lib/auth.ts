import { signMessage } from '@wagmi/core';
import { config } from './wagmi';

// Create signature message for API authentication
export const createSignatureMessage = (address: string, timestamp: number, action: string) => {
  return `Zatori Marketplace Authentication

Address: ${address}
Action: ${action}
Timestamp: ${timestamp}

Please sign this message to verify your identity.`;
};

// Sign a message for API authentication
export const signAuthMessage = async (address: string, action: string): Promise<{
  signature: string;
  timestamp: number;
  message: string;
}> => {
  const timestamp = Date.now();
  const message = createSignatureMessage(address, timestamp, action);
  
  try {
    const signature = await signMessage(config, { message });
    
    return {
      signature,
      timestamp,
      message
    };
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new Error('Failed to sign authentication message');
  }
};

// Create authenticated API request headers
export const createAuthenticatedRequest = async (
  address: string, 
  action: string,
  data: any = {}
): Promise<{
  body: any;
  headers: Record<string, string>;
}> => {
  const authData = await signAuthMessage(address, action);
  
  return {
    body: {
      ...data,
      walletAddress: address,
      signature: authData.signature,
      timestamp: authData.timestamp,
      action
    },
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

// Authentication helper for different API actions
export const createUserAuth = (address: string, userData: any) => 
  createAuthenticatedRequest(address, 'create_user', userData);

export const updateUserAuth = (address: string, updates: any) => 
  createAuthenticatedRequest(address, 'update_user', updates);

export const createDatasetAuth = (address: string, datasetData: any) => 
  createAuthenticatedRequest(address, 'create_dataset', datasetData);

export const updateDatasetAuth = (address: string, updates: any) => 
  createAuthenticatedRequest(address, 'update_dataset', updates);

export const deleteDatasetAuth = (address: string) => 
  createAuthenticatedRequest(address, 'delete_dataset');

export const createTransactionAuth = (address: string, transactionData: any) => 
  createAuthenticatedRequest(address, 'create_transaction', transactionData);

export const updateTransactionAuth = (address: string, updates: any) => 
  createAuthenticatedRequest(address, 'update_transaction', updates);

export const createReviewAuth = (address: string, reviewData: any) => 
  createAuthenticatedRequest(address, 'create_review', reviewData);

export const updateReviewAuth = (address: string, updates: any) => 
  createAuthenticatedRequest(address, 'update_review', updates);

export const deleteReviewAuth = (address: string) => 
  createAuthenticatedRequest(address, 'delete_review');

// Enhanced API request function with authentication
export const authenticatedApiRequest = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  address: string,
  action: string,
  data?: any
) => {
  if (method === 'GET') {
    // GET requests don't need authentication for most endpoints
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  const authRequest = await createAuthenticatedRequest(address, action, data);
  
  const response = await fetch(url, {
    method,
    headers: authRequest.headers,
    body: JSON.stringify(authRequest.body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.details || errorData.error || 'API request failed');
  }

  return response.json();
};

// Wallet connection status
export const getWalletConnectionStatus = () => {
  // This will be used by components to check if wallet is connected
  // Implementation depends on the wagmi hooks in components
  return {
    isConnected: false, // This should be determined by wagmi hooks in components
    address: null
  };
};
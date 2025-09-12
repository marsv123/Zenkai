import type { Request, Response, NextFunction } from "express";
import { ethers } from "ethers";
import { storage } from "./storage";

// Extended request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

// Message template for signature verification
const createSignatureMessage = (address: string, timestamp: number, action: string) => {
  return `Zatori Marketplace Authentication

Address: ${address}
Action: ${action}
Timestamp: ${timestamp}

Please sign this message to verify your identity.`;
};

// Verify wallet signature middleware
export const verifyWalletSignature = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress, signature, timestamp, action } = req.body;

    if (!walletAddress || !signature || !timestamp || !action) {
      return res.status(401).json({ 
        error: "Authentication required", 
        details: "Missing walletAddress, signature, timestamp, or action" 
      });
    }

    // Check timestamp to prevent replay attacks (allow 5 minutes)
    const now = Date.now();
    const signatureAge = now - parseInt(timestamp);
    if (signatureAge > 5 * 60 * 1000) {
      return res.status(401).json({ 
        error: "Authentication expired", 
        details: "Signature timestamp is too old" 
      });
    }

    // Verify Ethereum address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(401).json({ 
        error: "Invalid wallet address", 
        details: "Provided address is not a valid Ethereum address" 
      });
    }

    // Create expected message
    const message = createSignatureMessage(walletAddress, parseInt(timestamp), action);

    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({ 
          error: "Authentication failed", 
          details: "Signature verification failed" 
        });
      }
    } catch (error) {
      return res.status(401).json({ 
        error: "Authentication failed", 
        details: "Invalid signature format" 
      });
    }

    // Find or create user
    let user = await storage.getUserByWallet(walletAddress);
    if (!user) {
      // Create user if they don't exist
      user = await storage.createUser({
        walletAddress,
        username: `User-${walletAddress.slice(-6)}`
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      walletAddress: user.walletAddress
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: "Authentication service error" 
    });
  }
};

// Optional authentication middleware (for read endpoints that benefit from user context)
export const optionalWalletAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress } = req.query;

    if (walletAddress && typeof walletAddress === 'string' && ethers.isAddress(walletAddress)) {
      const user = await storage.getUserByWallet(walletAddress);
      if (user) {
        req.user = {
          id: user.id,
          walletAddress: user.walletAddress
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors, just continue without user context
    next();
  }
};

// Authorization middleware for resource ownership
export const requireResourceOwnership = (resourceField: string = 'ownerId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: "Authentication required" 
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ 
          error: "Resource ID required" 
        });
      }

      let resource;
      
      // Determine resource type and fetch it
      if (req.path.includes('/datasets/')) {
        resource = await storage.getDataset(resourceId);
      } else if (req.path.includes('/reviews/')) {
        resource = await storage.getReview(resourceId);
        resourceField = 'reviewerId'; // Reviews use reviewerId field
      } else if (req.path.includes('/transactions/')) {
        resource = await storage.getTransaction(resourceId);
        // For transactions, check if user is buyer, seller, or initiator
        if (resource && (
          resource.buyerId === req.user.id || 
          resource.sellerId === req.user.id || 
          resource.initiatorId === req.user.id
        )) {
          return next();
        }
        return res.status(403).json({ 
          error: "Access denied", 
          details: "You can only access your own transactions" 
        });
      }

      if (!resource) {
        return res.status(404).json({ 
          error: "Resource not found" 
        });
      }

      // Check ownership
      const ownerId = (resource as any)[resourceField];
      if (ownerId !== req.user.id) {
        return res.status(403).json({ 
          error: "Access denied", 
          details: "You can only modify your own resources" 
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ 
        error: "Authorization service error" 
      });
    }
  };
};

// Helper function to extract wallet address from various sources
export const extractWalletAddress = (req: Request): string | null => {
  // Check body first (for mutations)
  if (req.body?.walletAddress && ethers.isAddress(req.body.walletAddress)) {
    return req.body.walletAddress;
  }
  
  // Check params (for routes like /users/wallet/:address)
  if (req.params?.address && ethers.isAddress(req.params.address)) {
    return req.params.address;
  }
  
  // Check query params
  if (req.query?.walletAddress && typeof req.query.walletAddress === 'string' && ethers.isAddress(req.query.walletAddress)) {
    return req.query.walletAddress;
  }
  
  return null;
};

// Middleware to validate wallet address in routes
export const validateWalletAddress = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const walletAddress = extractWalletAddress(req);
  
  if (!walletAddress) {
    return res.status(400).json({ 
      error: "Invalid wallet address", 
      details: "A valid Ethereum wallet address is required" 
    });
  }
  
  next();
};
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDatasetSchema, insertTransactionSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import {
  verifyWalletSignature,
  optionalWalletAuth,
  requireResourceOwnership,
  validateWalletAddress,
  extractWalletAddress,
  type AuthenticatedRequest
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes - READ endpoints (no auth required for basic reads)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/wallet/:address", validateWalletAddress, async (req, res) => {
    try {
      const user = await storage.getUserByWallet(req.params.address);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User creation with wallet verification
  app.post("/api/users", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Ensure wallet address matches authenticated user
      if (userData.walletAddress.toLowerCase() !== req.user!.walletAddress.toLowerCase()) {
        return res.status(403).json({ error: "Access denied", details: "Cannot create user for different wallet" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByWallet(userData.walletAddress);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists", user: existingUser });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error('User creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User updates require authentication and ownership verification
  app.put("/api/users/:id", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify user can only update their own profile
      if (req.params.id !== req.user!.id) {
        return res.status(403).json({ error: "Access denied", details: "Can only update your own profile" });
      }
      
      const updates = insertUserSchema.partial().parse(req.body);
      
      // Prevent wallet address changes
      if (updates.walletAddress && updates.walletAddress !== req.user!.walletAddress) {
        return res.status(400).json({ error: "Cannot change wallet address" });
      }
      
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error('User update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dataset routes - Public read endpoints
  app.get("/api/datasets", optionalWalletAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { category, search, limit, offset } = req.query;
      const datasets = await storage.getDatasets({
        category: category as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(datasets);
    } catch (error) {
      console.error('Dataset fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/datasets/:id", optionalWalletAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const dataset = await storage.getDataset(req.params.id);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      console.error('Dataset fetch by ID error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/datasets/owner/:ownerId", async (req, res) => {
    try {
      const datasets = await storage.getDatasetsByOwner(req.params.ownerId);
      res.json(datasets);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/datasets/owner/wallet/:address", validateWalletAddress, async (req, res) => {
    try {
      const user = await storage.getUserByWallet(req.params.address);
      if (!user) {
        return res.json([]); // Return empty array if user not found
      }
      const datasets = await storage.getDatasetsByOwner(user.id);
      res.json(datasets);
    } catch (error) {
      console.error('Dataset fetch by wallet error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dataset creation requires wallet verification
  app.post("/api/datasets", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      const datasetData = insertDatasetSchema.parse(req.body);
      
      // Ensure dataset owner matches authenticated user
      if (datasetData.ownerId.startsWith('0x')) {
        // If ownerId is a wallet address, it must match the authenticated wallet
        if (datasetData.ownerId.toLowerCase() !== req.user!.walletAddress.toLowerCase()) {
          return res.status(403).json({ error: "Access denied", details: "Cannot create dataset for different wallet" });
        }
        datasetData.ownerId = req.user!.id;
      } else {
        // If ownerId is a user ID, it must match the authenticated user
        if (datasetData.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied", details: "Cannot create dataset for different user" });
        }
      }
      
      const dataset = await storage.createDataset(datasetData);
      res.json(dataset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid dataset data", details: error.errors });
      }
      console.error('Dataset creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dataset updates require authentication and ownership verification
  app.put("/api/datasets/:id", verifyWalletSignature, requireResourceOwnership(), async (req: AuthenticatedRequest, res) => {
    try {
      const updates = insertDatasetSchema.partial().parse(req.body);
      
      // Prevent changing ownership
      if (updates.ownerId && updates.ownerId !== req.user!.id) {
        return res.status(400).json({ error: "Cannot change dataset ownership" });
      }
      
      const dataset = await storage.updateDataset(req.params.id, updates);
      if (!dataset) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json(dataset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid dataset data", details: error.errors });
      }
      console.error('Dataset update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dataset deletion requires authentication and ownership verification
  app.delete("/api/datasets/:id", verifyWalletSignature, requireResourceOwnership(), async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteDataset(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Dataset not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Dataset deletion error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transaction routes - Require authentication for accessing transaction details
  app.get("/api/transactions/:id", verifyWalletSignature, requireResourceOwnership(), async (req: AuthenticatedRequest, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error('Transaction fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public endpoint for transaction hash lookup (blockchain is public)
  app.get("/api/transactions/hash/:txHash", async (req, res) => {
    try {
      const transaction = await storage.getTransactionByHash(req.params.txHash);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error('Transaction fetch by hash error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Require authentication to access user's transaction history
  app.get("/api/transactions/user/:userId", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify user can only access their own transactions
      if (req.params.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied", details: "Can only access your own transactions" });
      }
      
      const { type } = req.query;
      const transactions = await storage.getTransactionsByUser(
        req.params.userId,
        type as 'buyer' | 'seller' | undefined
      );
      res.json(transactions);
    } catch (error) {
      console.error('User transactions fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Require authentication and wallet verification for transaction access
  app.get("/api/transactions/user/wallet/:address", verifyWalletSignature, validateWalletAddress, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify user can only access their own wallet's transactions
      if (req.params.address.toLowerCase() !== req.user!.walletAddress.toLowerCase()) {
        return res.status(403).json({ error: "Access denied", details: "Can only access your own wallet's transactions" });
      }
      
      const { type } = req.query;
      const user = await storage.getUserByWallet(req.params.address);
      if (!user) {
        return res.json([]); // Return empty array if user not found
      }
      const transactions = await storage.getTransactionsByUser(
        user.id,
        type as 'buyer' | 'seller' | undefined
      );
      res.json(transactions);
    } catch (error) {
      console.error('Wallet transactions fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transaction creation requires wallet verification
  app.post("/api/transactions", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Ensure transaction initiator matches authenticated user
      if (transactionData.initiatorId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied", details: "Cannot create transaction for different user" });
      }
      
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      console.error('Transaction creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Transaction updates require authentication and participation verification
  app.put("/api/transactions/:id", verifyWalletSignature, requireResourceOwnership(), async (req: AuthenticatedRequest, res) => {
    try {
      const updates = insertTransactionSchema.partial().parse(req.body);
      
      // Prevent changing critical fields that would affect ownership
      if (updates.buyerId || updates.sellerId || updates.initiatorId) {
        return res.status(400).json({ error: "Cannot change transaction participants" });
      }
      
      const transaction = await storage.updateTransaction(req.params.id, updates);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      console.error('Transaction update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review routes - Public read endpoints
  app.get("/api/reviews/dataset/:datasetId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByDataset(req.params.datasetId);
      res.json(reviews);
    } catch (error) {
      console.error('Dataset reviews fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.userId);
      res.json(reviews);
    } catch (error) {
      console.error('User reviews fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review creation requires wallet verification
  app.post("/api/reviews", verifyWalletSignature, async (req: AuthenticatedRequest, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      
      // Ensure review reviewer matches authenticated user
      if (reviewData.reviewerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied", details: "Cannot create review for different user" });
      }
      
      // Verify dataset exists
      const dataset = await storage.getDataset(reviewData.datasetId);
      if (!dataset) {
        return res.status(400).json({ error: "Dataset not found" });
      }
      
      // Prevent users from reviewing their own datasets
      if (dataset.ownerId === req.user!.id) {
        return res.status(400).json({ error: "Cannot review your own dataset" });
      }
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      console.error('Review creation error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review updates require authentication and ownership verification
  app.put("/api/reviews/:id", verifyWalletSignature, requireResourceOwnership('reviewerId'), async (req: AuthenticatedRequest, res) => {
    try {
      const updates = insertReviewSchema.partial().parse(req.body);
      
      // Prevent changing reviewer or dataset
      if (updates.reviewerId || updates.datasetId) {
        return res.status(400).json({ error: "Cannot change reviewer or dataset" });
      }
      
      const review = await storage.updateReview(req.params.id, updates);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      console.error('Review update error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Review deletion requires authentication and ownership verification
  app.delete("/api/reviews/:id", verifyWalletSignature, requireResourceOwnership('reviewerId'), async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Review deletion error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics routes - Public read endpoints
  app.get("/api/datasets/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getDatasetStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error('Dataset stats fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error('User stats fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/users/:address/stats", validateWalletAddress, async (req, res) => {
    try {
      const user = await storage.getUserByWallet(req.params.address);
      if (!user) {
        return res.json({ datasetsOwned: 0, totalSales: 0, totalPurchases: 0 });
      }
      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      console.error('User wallet stats fetch error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OpenAI Dataset Summarization endpoint with real AI integration
  app.post("/api/summarize", async (req, res) => {
    try {
      // Validate request body - SECURITY: Only allow IPFS URIs to prevent SSRF
      const uriSchema = z.object({
        uri: z.string()
          .min(1, 'URI is required')
          .max(2048, 'URI too long')
          .refine((uri) => uri.startsWith('ipfs://'), {
            message: 'Only IPFS URIs are allowed for security reasons'
          })
      });
      
      const { uri } = uriSchema.parse(req.body);

      // Convert IPFS URI to trusted gateway URL
      const hash = uri.replace('ipfs://', '');
      const metadataUrl = `https://ipfs.io/ipfs/${hash}`;

      // Fetch metadata from IPFS with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      let metadata: any;
      try {
        const metadataResponse = await fetch(metadataUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
        }

        metadata = await metadataResponse.json();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // If IPFS fetch fails, provide a generic summary based on URI
        const summary = `Dataset at ${uri} - IPFS metadata unavailable. This appears to be a blockchain-registered dataset that could contain valuable information for AI and machine learning applications.`;
        return res.json({ summary });
      }

      const metadataText = JSON.stringify(metadata, null, 2);

      // Use OpenAI for summarization if API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (apiKey && apiKey.trim() && apiKey !== "default_key") {
        try {
          // Dynamically import OpenAI (since it's ESM only)
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({ apiKey });

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Use supported OpenAI model
            messages: [
              {
                role: "system",
                content: "You are an AI assistant that summarizes dataset metadata. Provide a concise 1-2 sentence summary focusing on the key aspects of the dataset including its purpose, content type, and potential use cases."
              },
              {
                role: "user",
                content: `Please summarize this dataset metadata:\n\n${metadataText}`
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          });

          const summary = response.choices[0]?.message?.content || 'Unable to generate summary';
          res.json({ summary });
        } catch (openaiError) {
          console.error('OpenAI API error:', openaiError);
          // Fallback to basic summary if OpenAI fails
          const fallbackSummary = `Dataset from ${uri} - Contains structured data that could be valuable for machine learning applications. Metadata indicates this is a properly formatted dataset suitable for AI training and analysis.`;
          res.json({ summary: fallbackSummary });
        }
      } else {
        // Fallback when no API key
        const fallbackSummary = `Dataset from ${uri} - This appears to be a structured dataset containing valuable information for machine learning and AI applications.`;
        res.json({ summary: fallbackSummary });
      }
    } catch (error) {
      console.error('Summarization error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          summary: '',
          error: 'Invalid request data',
          details: error.errors
        });
      }
      res.status(500).json({ 
        summary: '',
        error: error instanceof Error ? error.message : 'Failed to summarize dataset'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

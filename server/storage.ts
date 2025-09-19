import { 
  type User, 
  type InsertUser,
  type Dataset,
  type InsertDataset,
  type Transaction,
  type InsertTransaction,
  type Review,
  type InsertReview,
  type TrainingJob,
  type InsertTrainingJob,
  type InftAsset,
  type InsertInftAsset
} from "@shared/schema";
import { users, datasets, transactions, reviews, trainingJobs, inftAssets } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, avg, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Dataset operations
  getDataset(id: string): Promise<Dataset | undefined>;
  getDatasets(options?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<Dataset[]>;
  getDatasetsByOwner(ownerId: string): Promise<Dataset[]>;
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  updateDataset(id: string, updates: Partial<InsertDataset>): Promise<Dataset | undefined>;
  deleteDataset(id: string): Promise<boolean>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByHash(txHash: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string, type?: 'buyer' | 'seller'): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;

  // Review operations
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByDataset(datasetId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;

  // Training Job operations
  getTrainingJob(id: string): Promise<TrainingJob | undefined>;
  getTrainingJobsByUser(userId: string): Promise<TrainingJob[]>;
  createTrainingJob(trainingJob: InsertTrainingJob): Promise<TrainingJob>;
  updateTrainingJob(id: string, updates: Partial<InsertTrainingJob>): Promise<TrainingJob | undefined>;

  // INFT Asset operations
  getInftAsset(id: string): Promise<InftAsset | undefined>;
  getInftAssetsByOwner(ownerId: string): Promise<InftAsset[]>;
  getInftAssetByTokenId(tokenId: number, contractAddress: string): Promise<InftAsset | undefined>;
  createInftAsset(inftAsset: InsertInftAsset): Promise<InftAsset>;
  updateInftAsset(id: string, updates: Partial<InsertInftAsset>): Promise<InftAsset | undefined>;

  // Analytics
  getDatasetStats(datasetId: string): Promise<{ rating: number; reviewCount: number; downloads: number }>;
  getUserStats(userId: string): Promise<{ datasetsOwned: number; totalSales: number; totalPurchases: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Dataset operations
  async getDataset(id: string): Promise<Dataset | undefined> {
    const [dataset] = await db.select().from(datasets).where(eq(datasets.id, id));
    return dataset || undefined;
  }

  async getDatasets(options: { category?: string; search?: string; limit?: number; offset?: number } = {}): Promise<Dataset[]> {
    const { category, search, limit = 50, offset = 0 } = options;
    
    let conditions = [eq(datasets.isActive, true)];
    
    if (category) {
      conditions.push(eq(datasets.category, category));
    }
    
    if (search) {
      const searchCondition = or(
        ilike(datasets.title, `%${search}%`),
        ilike(datasets.description, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    return await db.select().from(datasets)
      .where(and(...conditions))
      .orderBy(desc(datasets.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getDatasetsByOwner(ownerId: string): Promise<Dataset[]> {
    return await db.select().from(datasets)
      .where(eq(datasets.ownerId, ownerId))
      .orderBy(desc(datasets.createdAt));
  }

  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const [dataset] = await db
      .insert(datasets)
      .values(insertDataset)
      .returning();
    return dataset;
  }

  async updateDataset(id: string, updates: Partial<InsertDataset>): Promise<Dataset | undefined> {
    const [dataset] = await db
      .update(datasets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(datasets.id, id))
      .returning();
    return dataset || undefined;
  }

  async deleteDataset(id: string): Promise<boolean> {
    const result = await db
      .update(datasets)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(datasets.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByHash(txHash: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.txHash, txHash));
    return transaction || undefined;
  }

  async getTransactionsByUser(userId: string, type?: 'buyer' | 'seller'): Promise<Transaction[]> {
    if (type === 'buyer') {
      return await db.select().from(transactions)
        .where(eq(transactions.buyerId, userId))
        .orderBy(desc(transactions.createdAt));
    } else if (type === 'seller') {
      return await db.select().from(transactions)
        .where(eq(transactions.sellerId, userId))
        .orderBy(desc(transactions.createdAt));
    } else {
      return await db.select().from(transactions)
        .where(
          or(
            eq(transactions.buyerId, userId),
            eq(transactions.sellerId, userId)
          )
        )
        .orderBy(desc(transactions.createdAt));
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewsByDataset(datasetId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.datasetId, datasetId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.reviewerId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    
    // Update dataset rating and review count
    await this.updateDatasetStats(insertReview.datasetId);
    
    return review;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return review || undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Analytics
  async getDatasetStats(datasetId: string): Promise<{ rating: number; reviewCount: number; downloads: number }> {
    const [dataset] = await db.select({
      downloads: datasets.downloads,
      reviewCount: datasets.reviewCount,
      rating: datasets.rating
    }).from(datasets).where(eq(datasets.id, datasetId));
    
    return {
      rating: parseFloat(dataset?.rating || "0"),
      reviewCount: dataset?.reviewCount || 0,
      downloads: dataset?.downloads || 0
    };
  }

  async getUserStats(userId: string): Promise<{ datasetsOwned: number; totalSales: number; totalPurchases: number }> {
    // Count owned datasets
    const [datasetCount] = await db
      .select({ count: count() })
      .from(datasets)
      .where(and(eq(datasets.ownerId, userId), eq(datasets.isActive, true)));

    // Count sales
    const [salesCount] = await db
      .select({ count: count() })
      .from(transactions)
      .where(and(eq(transactions.sellerId, userId), eq(transactions.status, "confirmed")));

    // Count purchases
    const [purchaseCount] = await db
      .select({ count: count() })
      .from(transactions)
      .where(and(eq(transactions.buyerId, userId), eq(transactions.status, "confirmed")));

    return {
      datasetsOwned: datasetCount?.count || 0,
      totalSales: salesCount?.count || 0,
      totalPurchases: purchaseCount?.count || 0
    };
  }

  // Training Job operations
  async getTrainingJob(id: string): Promise<TrainingJob | undefined> {
    const [job] = await db.select().from(trainingJobs).where(eq(trainingJobs.id, id));
    return job || undefined;
  }

  async getTrainingJobsByUser(userId: string): Promise<TrainingJob[]> {
    return await db.select().from(trainingJobs)
      .where(eq(trainingJobs.userId, userId))
      .orderBy(desc(trainingJobs.createdAt));
  }

  async createTrainingJob(insertTrainingJob: InsertTrainingJob): Promise<TrainingJob> {
    const [job] = await db
      .insert(trainingJobs)
      .values(insertTrainingJob)
      .returning();
    return job;
  }

  async updateTrainingJob(id: string, updates: Partial<InsertTrainingJob>): Promise<TrainingJob | undefined> {
    const [job] = await db
      .update(trainingJobs)
      .set(updates)
      .where(eq(trainingJobs.id, id))
      .returning();
    return job || undefined;
  }

  // INFT Asset operations
  async getInftAsset(id: string): Promise<InftAsset | undefined> {
    const [asset] = await db.select().from(inftAssets).where(eq(inftAssets.id, id));
    return asset || undefined;
  }

  async getInftAssetsByOwner(ownerId: string): Promise<InftAsset[]> {
    return await db.select().from(inftAssets)
      .where(and(eq(inftAssets.ownerId, ownerId), eq(inftAssets.isActive, true)))
      .orderBy(desc(inftAssets.createdAt));
  }

  async getInftAssetByTokenId(tokenId: number, contractAddress: string): Promise<InftAsset | undefined> {
    const [asset] = await db.select().from(inftAssets)
      .where(and(
        eq(inftAssets.tokenId, tokenId),
        eq(inftAssets.contractAddress, contractAddress)
      ));
    return asset || undefined;
  }

  async createInftAsset(insertInftAsset: InsertInftAsset): Promise<InftAsset> {
    const [asset] = await db
      .insert(inftAssets)
      .values(insertInftAsset)
      .returning();
    return asset;
  }

  async updateInftAsset(id: string, updates: Partial<InsertInftAsset>): Promise<InftAsset | undefined> {
    const [asset] = await db
      .update(inftAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inftAssets.id, id))
      .returning();
    return asset || undefined;
  }

  private async updateDatasetStats(datasetId: string): Promise<void> {
    // Calculate average rating and count
    const [stats] = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.id)
      })
      .from(reviews)
      .where(eq(reviews.datasetId, datasetId));

    await db
      .update(datasets)
      .set({
        rating: stats.avgRating ? stats.avgRating.toString() : "0",
        reviewCount: stats.reviewCount || 0,
        updatedAt: new Date()
      })
      .where(eq(datasets.id, datasetId));
  }
}

export const storage = new DatabaseStorage();

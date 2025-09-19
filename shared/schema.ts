import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for Web3 addresses and profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  email: text("email"),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Datasets table for marketplace listings
export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: integer("contract_id"), // ID from smart contract
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  ipfsHash: text("ipfs_hash").notNull(),
  metadataUrl: text("metadata_url"),
  // 0G Storage support (new fields)
  ogStorageUri: text("og_storage_uri"), // og://... URI for 0G Storage
  storageProvider: text("storage_provider").default("ipfs").notNull(), // "ipfs" or "0g"
  zkProtected: boolean("zk_protected").default(false).notNull(), // Zero-knowledge privacy flag
  price: numeric("price", { precision: 18, scale: 8 }).notNull(), // In IMT tokens
  isActive: boolean("is_active").default(true).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table for purchase history
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  txHash: text("tx_hash").unique(), // Made nullable for draft transactions
  buyerId: varchar("buyer_id").references(() => users.id), // Made nullable for registration transactions
  sellerId: varchar("seller_id").references(() => users.id), // Made nullable for registration transactions
  datasetId: varchar("dataset_id").references(() => datasets.id),
  initiatorId: varchar("initiator_id").notNull().references(() => users.id), // The user who initiated the transaction
  transactionType: text("transaction_type").notNull().default("purchase"), // purchase, registration, withdrawal
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("draft"), // draft, pending, waiting_for_wallet, submitting, confirming, confirmed, failed
  errorCode: text("error_code"), // userRejectedRequest, insufficientFunds, chainMismatch, etc.
  errorMessage: text("error_message"),
  blockNumber: integer("block_number"),
  gasUsed: text("gas_used"),
  gasPrice: text("gas_price"),
  explorerUrl: text("explorer_url"), // Block explorer link
  retryCount: integer("retry_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"), // When submitted to blockchain
  confirmedAt: timestamp("confirmed_at"), // When confirmed on blockchain
  failedAt: timestamp("failed_at"), // When marked as failed
});

// Reviews table for dataset ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  datasetId: varchar("dataset_id").notNull().references(() => datasets.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Training Jobs table for 0G Compute tracking
export const trainingJobs = pgTable("training_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: text("job_id").unique(), // 0G Compute job ID
  userId: varchar("user_id").notNull().references(() => users.id),
  datasetUri: text("dataset_uri").notNull(), // og://... or ipfs://...
  modelConfig: jsonb("model_config").notNull(), // Training configuration
  computeParams: jsonb("compute_params"), // Additional compute parameters
  status: text("status").notNull().default("submitted"), // submitted, running, completed, failed
  resultUri: text("result_uri"), // og://... URI for trained model
  errorMessage: text("error_message"),
  progress: integer("progress").default(0).notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// INFT Assets table for ZenkaiINFT tracking
export const inftAssets = pgTable("inft_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenId: integer("token_id").notNull(), // NFT token ID from contract
  contractAddress: text("contract_address").notNull(), // ZenkaiINFT contract address
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  tokenUri: text("token_uri").notNull(), // Metadata URI for the NFT
  datasetUri: text("dataset_uri"), // og://... or ipfs://...
  modelUri: text("model_uri"), // og://... or ipfs://...
  encryptedMetaUri: text("encrypted_meta_uri"), // og://... or ipfs://...
  reputation: integer("reputation").default(0).notNull(), // 0-1000000000
  zkProtected: boolean("zk_protected").default(false).notNull(),
  royaltyBps: integer("royalty_bps").default(0).notNull(), // Royalty in basis points (e.g., 500 = 5%)
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  datasets: many(datasets),
  purchases: many(transactions, { relationName: "buyer" }),
  sales: many(transactions, { relationName: "seller" }),
  initiatedTransactions: many(transactions, { relationName: "initiator" }),
  reviews: many(reviews),
  trainingJobs: many(trainingJobs),
  inftAssets: many(inftAssets),
}));

export const datasetsRelations = relations(datasets, ({ one, many }) => ({
  owner: one(users, {
    fields: [datasets.ownerId],
    references: [users.id],
  }),
  transactions: many(transactions),
  reviews: many(reviews),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id], 
    relationName: "seller",
  }),
  initiator: one(users, {
    fields: [transactions.initiatorId],
    references: [users.id],
    relationName: "initiator",
  }),
  dataset: one(datasets, {
    fields: [transactions.datasetId],
    references: [datasets.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  dataset: one(datasets, {
    fields: [reviews.datasetId],
    references: [datasets.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const trainingJobsRelations = relations(trainingJobs, ({ one }) => ({
  user: one(users, {
    fields: [trainingJobs.userId],
    references: [users.id],
  }),
}));

export const inftAssetsRelations = relations(inftAssets, ({ one }) => ({
  owner: one(users, {
    fields: [inftAssets.ownerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloads: true,
  rating: true,
  reviewCount: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingJobSchema = createInsertSchema(trainingJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertInftAssetSchema = createInsertSchema(inftAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertTrainingJob = z.infer<typeof insertTrainingJobSchema>;
export type TrainingJob = typeof trainingJobs.$inferSelect;

export type InsertInftAsset = z.infer<typeof insertInftAssetSchema>;
export type InftAsset = typeof inftAssets.$inferSelect;

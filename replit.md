# Zatori - Intelligence Marketplace on 0G

## Overview

Zatori is a decentralized intelligence marketplace built on the 0G Galileo testnet where datasets can be registered, rented, and consumed by AI systems. The platform enables secure trading of AI datasets using smart contracts and IPFS for decentralized storage. Users can register datasets with metadata, set pricing in IMT tokens, and purchase access to datasets through blockchain transactions. The platform includes AI-powered dataset summarization and a comprehensive review system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**
- Next.js with TypeScript for the main frontend application
- React with Vite for the client-side application
- Tailwind CSS with shadcn/ui components for consistent styling
- RainbowKit for Web3 wallet integration supporting multiple chains including 0G Galileo testnet
- React Query (TanStack Query) for data fetching and state management
- Wagmi for Ethereum interactions and smart contract integration

**Backend Architecture**
- Express.js server with TypeScript for API endpoints
- RESTful API design with routes for users, datasets, transactions, and reviews
- Comprehensive storage interface with database abstraction layer
- Middleware for request logging and error handling
- Vite integration for development with HMR support

**Smart Contract Layer**
- Hardhat development environment with TypeScript configuration
- Three main contracts: IMT (ERC20 token), ContributorNFT (ERC721), and DatasetRegistry
- DatasetRegistry manages dataset registration, pricing, and access control with 4% treasury fee
- Deployment scripts configured for 0G Galileo testnet (Chain ID: 16601)
- Contract ABI export system for frontend integration

**Database Design**
- PostgreSQL with Drizzle ORM for type-safe database operations
- User management with wallet address linking and profile information
- Dataset metadata storage with IPFS hash references, pricing, and rating system
- Transaction tracking with blockchain hash correlation and status management
- Review system with ratings and feedback for datasets
- Comprehensive analytics tracking for datasets and user statistics

**Authentication & Authorization**
- Web3 wallet-based authentication using RainbowKit
- User identification through wallet addresses
- No traditional session management - relies on wallet connection state

**External Integrations**
- IPFS for decentralized file storage and metadata hosting
- OpenAI API integration for AI-powered dataset summarization
- 0G Galileo testnet blockchain interaction for smart contract operations

**Development Tools**
- TypeScript throughout the stack for type safety
- ESLint and Prettier for code quality
- Shared schema definitions between frontend and backend
- Environment-based configuration for different deployment stages

## External Dependencies

**Blockchain & Web3**
- 0G Galileo testnet (RPC: https://evmrpc-testnet.0g.ai, Chain ID: 16601)
- Ethereum ecosystem tools (ethers.js, viem, wagmi)
- RainbowKit for wallet connectivity
- OpenZeppelin contracts for secure smart contract standards

**Database & Storage**
- Neon serverless PostgreSQL for database hosting
- Drizzle ORM for database schema management and queries
- IPFS network for decentralized file storage

**AI & External APIs**
- OpenAI API for dataset summarization and content analysis
- IPFS HTTP gateways for metadata retrieval

**Development & Build Tools**
- Next.js framework for production deployment
- Vite for fast development builds and HMR
- Hardhat for smart contract development and testing
- Vercel for frontend deployment (configured)

**UI & Styling**
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible component foundation
- Lucide React for consistent iconography
- Custom shadcn/ui component system

**Monitoring & Error Handling**
- Request logging middleware for API monitoring
- Comprehensive error handling with proper HTTP status codes
- Transaction status tracking for blockchain operations
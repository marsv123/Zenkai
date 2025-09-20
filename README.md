Zenkai: Powering the Intelligence Economy


#Links

GitHub Repository: https://github.com/marsv123/Zenkai/

Live Website: https://zenkai-dapp.onrender.com/

Akindo Community Page: https://app.akindo.io/communities/o64z2qLARfMzaxdA/products/jaZkAnQQ3ulvA7X83



#What is Zenkai?

Zenkai is a decentralized, end-to-end marketplace for data and intelligence.

For Data Providers
Upload datasets to 0G Storage with optional zero-knowledge privacy. Retain full ownership and earn recurring revenue as your data powers AI models. Every contribution is transparently tracked and monetized on-chain.

For AI Builders
Discover curated, high-quality datasets. Run inference jobs live on 0G Compute without costly GPUs. Train models (simulation today, full training soon). Tokenize your models as Intelligence NFTs (INFTs)—dynamic, tradeable assets with royalties and verifiable metadata.

Composability at Its Core
Datasets can power multiple models. Models can be linked into pipelines. Every asset becomes a composable building block with built-in ownership, reputation, and monetization.

With each dataset uploaded, model trained, or INFT minted, Zenkai compounds value. The ecosystem grows stronger, faster, and more rewarding — a virtuous cycle of decentralized innovation.



#The Problem It Solves

AI today is bottlenecked by closed data silos and centralized Big Tech platforms.

Data providers rarely earn fair rewards.

AI builders face high costs and steep barriers to training and monetization.

Enterprises waste millions refurbishing legacy data lakes just to make fragmented datasets usable, only to then pay even more for workloads on vendor-locked GPUs.

Zenkai replaces this broken model with a trustless, open marketplace for data and intelligence:

Cost Efficiency → Reduce data prep and compute costs by 60–70% vs AWS or OpenAI.

True Ownership → Every dataset and model is an on-chain asset with recurring income and reputation tracking.

Accessibility → Anyone, regardless of technical background, can upload, train, and monetize AI models through a simple, modular toolset.

No Vendor Lock-In → Datasets and models are reusable, composable, and powered by 0G’s decentralized infrastructure.

Instead of sinking millions into closed ecosystems, users can simply upload, train, and tokenize — creating new value streams at a fraction of the cost.



#Technical Architecture

Smart Contracts (0G Galileo Testnet, Chain ID: 16601)

ZAI Token (ERC-20) — Utility and payments
0x23C9593BBaC9207c9E360cbF7A64E0808374B43E

DatasetRegistry — On-chain dataset marketplace
0x521E29d7F8dfC78c017B1E93c8DB5f3ff808425d

ZenkaiINFT (ERC-721) — INFTs with royalties, dynamic metadata, ZK flags
0x97d84c9fc99E58F3261CA9bd91455b4138740039


Backend

Node.js + Express API

PostgreSQL + Drizzle ORM

Authentication via wallet signatures

Storage integration: 0G Storage + IPFS fallback


Frontend

Next.js (App Router) + TypeScript

wagmi v2 + RainbowKit (wallet integration)

Tailwind + shadcn/ui (cyberpunk glass morphism)


0G Integrations

0G Storage → Decentralized, ZK-enabled dataset storage

0G Compute → Decentralized inference (live) + training simulation

0G Chain → Ownership, reputation, and monetization

Data Availability → Transparent, reusable datasets and models


#Features

Upload datasets with privacy and ownership guarantees

Run decentralized inference with 0G Compute

Simulate training and generate artifacts for tokenization

Mint Intelligence NFTs (INFTs) with royalties and dynamic metadata

Explore datasets and INFTs in the marketplace

Track revenue, reputation, and ownership in the dashboard


#Manual Testing Guide

Connect wallet (0G Galileo Testnet, Chain ID: 16601)

Upload dataset (0G Storage, optional ZK toggle)

Run inference (Train → Inference tab)

Simulate training (Train → Training tab) → get model URI

Mint INFT (Tokenize page) → confirm Token ID

Verify asset appears in Marketplace and Dashboard

Explorer: https://chainscan-galileo.0g.ai


#License

MIT License

PatentPending: concepts and designs under protection

# Pointify Loyalty System - Backend

A clean, scalable NestJS backend with PostgreSQL + Prisma for a Web3-style loyalty reward system, integrated with smart contracts for tokenized loyalty points.

## 🚀 Features

- **Wallet-based Authentication**: Secure login using wallet signatures
- **Loyalty Points Management**: Off-chain points with on-chain verification
- **Smart Contract Integration**: Direct blockchain interaction for token operations
- **Reward System**: Create, manage, and redeem rewards
- **Redemption Process**: QR code-based redemption with claim codes
- **Merchant Dashboard**: Balance management and transaction history
- **User Dashboard**: Point balance and redemption history
- **Swap Functionality**: PLT token swapping with other tokens
- **API Documentation**: Auto-generated Swagger docs

## 🛠 Tech Stack

### Backend
- **NestJS** - Modular backend framework
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe database ORM
- **JWT** - Authentication tokens
- **Swagger** - API documentation
- **Ethers.js** - Wallet signature verification and blockchain interaction

### Smart Contracts
- **Solidity** - Smart contract language
- **LoyaltyToken** - ERC20 token with IDRX backing
- **RewardManager** - Merchant quota and point issuance
- **RedemptionRouter** - Point redemption with IDRX payout
- **SwapRouter** - Token swapping functionality

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Local blockchain network (Hardhat/Ganache) or testnet
- npm or yarn

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```

3. **Configure blockchain addresses**
   ```env
   # Update these with your deployed contract addresses
   LOYALTY_TOKEN_ADDRESS="0x..."
   REWARD_MANAGER_ADDRESS="0x..."
   REDEMPTION_ROUTER_ADDRESS="0x..."
   SWAP_ROUTER_ADDRESS="0x..."
   BLOCKCHAIN_RPC_URL="http://localhost:8545"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

6. **Access the API**
   - API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api

## 📚 API Endpoints

### Authentication
- `POST /auth/login` - Login with wallet signature
- `POST /auth/register/user` - Register new user
- `POST /auth/register/merchant` - Register new merchant

### Rewards
- `GET /rewards` - Get all active rewards
- `GET /rewards/merchant` - Get merchant rewards
- `POST /rewards` - Create new reward
- `PUT /rewards/:id` - Update reward
- `DELETE /rewards/:id` - Delete reward

### Redemptions
- `POST /redemptions/redeem` - Redeem a reward
- `POST /redemptions/verify` - Verify claim code
- `PUT /redemptions/confirm` - Confirm claim
- `GET /redemptions/user` - Get user redemptions
- `GET /redemptions/merchant` - Get merchant redemptions

### Points
- `POST /points/issue` - Issue points to user
- `GET /points/balance/user` - Get user balance
- `GET /points/balance/merchant` - Get merchant balance
- `GET /points/transactions/user` - Get user transactions
- `GET /points/transactions/merchant` - Get merchant transactions

### Blockchain Integration
- `GET /blockchain/network` - Get network information
- `GET /blockchain/loyalty-token/supply` - Get total token supply
- `GET /blockchain/loyalty-token/backing-ratio` - Get backing ratio
- `GET /blockchain/loyalty-token/balance/:address` - Get token balance
- `GET /blockchain/merchant/quota/:address` - Get merchant quota
- `POST /blockchain/merchant/reward-user` - Reward user with points
- `POST /blockchain/user/redeem-points` - Redeem points for IDRX
- `POST /blockchain/merchant/manual-redeem` - Manual redemption
- `GET /blockchain/swap/exchange-rate/:tokenAddress` - Get exchange rate
- `POST /blockchain/swap/plt-for-token` - Swap PLT for token
- `POST /blockchain/swap/token-for-plt` - Swap token for PLT
- `POST /blockchain/validate-signature` - Validate wallet signature

## 🗄 Database Schema

The system uses the following main entities:

- **Users**: Store wallet addresses and loyalty points
- **Merchants**: Store merchant info and balance quotas
- **Rewards**: Define available rewards with point costs
- **Redemptions**: Track reward redemption process
- **PointTransactions**: Audit trail for all point movements

## 🔐 Authentication

The system uses JWT tokens with wallet signature verification:

1. User signs a message with their wallet
2. Backend verifies the signature using ethers.js
3. JWT token is issued for subsequent requests

## ⛓ Smart Contract Integration

### LoyaltyToken Contract
- ERC20 token with IDRX backing
- 1:1 backing ratio maintained
- Mint/burn functionality for authorized contracts
- Transfer functions for regular ERC20 operations

### RewardManager Contract
- Manages merchant approval and quotas
- Handles IDRX top-up and withdrawal
- Issues loyalty points to users
- Tracks total rewards distributed

### RedemptionRouter Contract
- Processes point redemption for IDRX
- Handles manual redemption for physical items
- Calculates and distributes platform fees
- Burns tokens during redemption

### SwapRouter Contract
- Enables PLT swapping with other tokens
- Uses constant product formula (x * y = k)
- Supports liquidity provision and removal
- Handles swap fees and routing

## 🏗 Architecture

- **Modular Design**: Separate modules for auth, rewards, redemptions, points, blockchain
- **DTO Validation**: Class-validator for request validation
- **Swagger Documentation**: Auto-generated API docs
- **Type Safety**: Full TypeScript support with Prisma
- **Blockchain Integration**: Direct smart contract interaction
- **Off-chain/On-chain Hybrid**: Smooth UX with blockchain verification

## 🔄 User Flow

### Merchant Flow
1. Register as merchant with wallet
2. Get approved by admin
3. Top up IDRX for quota
4. Issue loyalty points to users
5. Create and manage rewards
6. Process redemptions

### User Flow
1. Register with wallet
2. Receive loyalty points from merchants
3. Browse available rewards
4. Redeem rewards for physical items
5. Swap PLT for other tokens
6. Redeem PLT for IDRX

## 🚀 Deployment

1. **Deploy smart contracts**
   ```bash
   npx hardhat deploy --network <network>
   ```

2. **Update environment variables**
   ```env
   LOYALTY_TOKEN_ADDRESS="deployed_address"
   REWARD_MANAGER_ADDRESS="deployed_address"
   REDEMPTION_ROUTER_ADDRESS="deployed_address"
   SWAP_ROUTER_ADDRESS="deployed_address"
   BLOCKCHAIN_RPC_URL="https://your-rpc-url"
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start production server**
   ```bash
   npm run start:prod
   ```

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty_system"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=production

# Blockchain
BLOCKCHAIN_RPC_URL="https://your-rpc-url"
LOYALTY_TOKEN_ADDRESS="0x..."
REWARD_MANAGER_ADDRESS="0x..."
REDEMPTION_ROUTER_ADDRESS="0x..."
SWAP_ROUTER_ADDRESS="0x..."
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
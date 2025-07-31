# Pointify Loyalty System - Backend

A clean, scalable NestJS backend with PostgreSQL + Prisma for a Web3-style loyalty reward system.

## 🚀 Features

- **Wallet-based Authentication**: Secure login using wallet signatures
- **Loyalty Points Management**: Off-chain points with on-chain verification
- **Reward System**: Create, manage, and redeem rewards
- **Redemption Process**: QR code-based redemption with claim codes
- **Merchant Dashboard**: Balance management and transaction history
- **User Dashboard**: Point balance and redemption history
- **API Documentation**: Auto-generated Swagger docs

## 🛠 Tech Stack

- **NestJS** - Modular backend framework
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe database ORM
- **JWT** - Authentication tokens
- **Swagger** - API documentation
- **Ethers.js** - Wallet signature verification

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

5. **Access the API**
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
2. Backend verifies the signature
3. JWT token is issued for subsequent requests

## 🏗 Architecture

- **Modular Design**: Separate modules for auth, rewards, redemptions, points
- **DTO Validation**: Class-validator for request validation
- **Swagger Documentation**: Auto-generated API docs
- **Type Safety**: Full TypeScript support with Prisma

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start:prod
   ```

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/loyalty_system"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
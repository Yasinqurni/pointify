# Pointify - Web3 Loyalty Reward System

A comprehensive blockchain-powered loyalty reward system built with NestJS, Next.js, and smart contracts.

## 🏗️ Architecture

- **Backend**: NestJS API with Prisma ORM and PostgreSQL
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Blockchain**: Smart contracts on Lisk network
- **Database**: PostgreSQL with Prisma migrations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Lisk wallet for blockchain interactions

### 1. Clone and Setup

```bash
git clone <repository-url>
cd pointify
npm run setup
```

### 2. Environment Configuration

#### Server Environment
```bash
cd server
cp env.template .env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/loyalty_system?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
BLOCKCHAIN_RPC_URL="https://rpc.sepolia-api.lisk.com"
NETWORK="lisk-sepolia"
CHAIN_ID=4202
LOYALTY_TOKEN_ADDRESS="0xe316A3c04d6aAb4432Be1330dbc13B4Ff1616c54"
REWARD_MANAGER_ADDRESS="0x1E0F4ADf27F9100e99fdc0e8e5bAeF456292B465"
REDEMPTION_ROUTER_ADDRESS="0x937085C7567e340A4100EEC7cD62788C17f8C1DD"
SWAP_ROUTER_ADDRESS="0x7C9e6c4B8c8B8B8B8B8B8B8B8B8B8B8B8B8B8B8B"
IDRX_TOKEN_ADDRESS="0x4c5A172D31e96D4EA6Dc008feAd9C0ba59159299"
PORT=3001
NODE_ENV=development
```

#### Client Environment
```bash
cd client
```

The client environment is already configured to connect to the server at `http://localhost:3001`.

### 3. Database Setup

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development

```bash
# Start both server and client
npm run dev

# Or start individually:
npm run dev:server  # Server on http://localhost:3001
npm run dev:client  # Client on http://localhost:3000
```

## 📁 Project Structure

```
pointify/
├── server/                 # NestJS Backend API
│   ├── src/
│   │   ├── modules/       # API modules (auth, rewards, etc.)
│   │   ├── common/        # Shared utilities
│   │   └── dto/          # Data transfer objects
│   ├── prisma/           # Database schema and migrations
│   └── package.json
├── client/                # Next.js Frontend
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/             # Utilities and API calls
│   └── package.json
├── contracts/            # Smart contracts
├── scripts/             # Deployment scripts
└── package.json         # Root workspace config
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Rewards
- `GET /rewards` - Get all active rewards
- `POST /rewards` - Create new reward (merchant only)
- `GET /rewards/merchant/:id` - Get merchant data
- `GET /rewards/user/:address` - Get user rewards

### Redemptions
- `POST /redemptions` - Redeem a reward
- `GET /redemptions/verify/:code` - Verify claim code
- `PUT /redemptions/:id/confirm` - Confirm claim
- `GET /redemptions/user/:userId` - Get user redemptions

### Points
- `POST /points/issue` - Issue points to user
- `GET /points/user/:userId` - Get user point logs
- `GET /points/user/:address/merchant/:address` - Get user loyalty details

### Blockchain
- `GET /blockchain/balance/:address` - Get LOYAL balance
- `POST /blockchain/merchant/reward-user` - Reward user with points

## 🎯 Features

### For Users
- Connect wallet and view LOYAL balance
- Browse available rewards from merchants
- Redeem rewards with loyalty points
- View redemption history and point logs
- Swap LOYAL tokens for other tokens

### For Merchants
- Create and manage loyalty rewards
- Issue points to customers
- Verify and confirm reward redemptions
- View customer analytics and loyalty program stats
- Manage merchant settings and quotas

## 🔐 Security

- JWT-based authentication
- Wallet signature validation
- Role-based access control (User/Merchant)
- Input validation and sanitization
- CORS configuration

## 🧪 Testing

```bash
# Test smart contracts
npm run test

# Test server API
cd server && npm run test

# Test client (if configured)
cd client && npm run test
```

## 🚀 Deployment

### Smart Contracts
```bash
npm run deploy
```

### Server
```bash
cd server
npm run build
npm run start:prod
```

### Client
```bash
cd client
npm run build
npm run start
```

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api`
- Review the smart contract tests
- Open an issue on GitHub

---

**Pointify** - Rewarding loyalty with blockchain technology 🎁 
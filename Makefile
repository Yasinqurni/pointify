# Loyalty Point DApp Makefile

.PHONY: help install compile test deploy-testnet deploy-mainnet clean verify-testnet verify-mainnet

# Default target
help:
	@echo "Available commands:"
	@echo "  install         - Install dependencies"
	@echo "  compile         - Compile smart contracts"
	@echo "  test            - Run tests"
	@echo "  deploy-testnet  - Deploy to Lisk testnet"
	@echo "  deploy-mainnet  - Deploy to Lisk mainnet"
	@echo "  verify-testnet  - Verify contract on Lisk testnet explorer"
	@echo "  verify-mainnet  - Verify contract on Lisk mainnet explorer"
	@echo "  clean           - Clean build artifacts"
	@echo "  node            - Start local Hardhat node"
	@echo "  deploy-local    - Deploy to local Hardhat node"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cd frontend && npm install

# Compile smart contracts
compile:
	@echo "Compiling smart contracts..."
	npx hardhat compile

# Run tests
test:
	@echo "Running tests..."
	npx hardhat test

# Deploy to Lisk testnet
deploy-testnet:
	@echo "Deploying to Lisk testnet..."
	npx hardhat run scripts/deploy.js --network liskTestnet

# Deploy to Lisk mainnet
deploy-mainnet:
	@echo "Deploying to Lisk mainnet..."
	npx hardhat run scripts/deploy.js --network liskMainnet

# Verify contract on Lisk testnet explorer
verify-testnet:
	@echo "Verifying contract on Lisk testnet explorer..."
	npx hardhat verify --network liskTestnet $(CONTRACT_ADDRESS) $(IDRX_TOKEN_ADDRESS) $(PLATFORM_FEE) $(FEE_RECIPIENT)

# Verify contract on Lisk mainnet explorer
verify-mainnet:
	@echo "Verifying contract on Lisk mainnet explorer..."
	npx hardhat verify --network liskMainnet $(CONTRACT_ADDRESS) $(IDRX_TOKEN_ADDRESS) $(PLATFORM_FEE) $(FEE_RECIPIENT)

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	npx hardhat clean
	rm -rf cache artifacts

# Start local Hardhat node
node:
	@echo "Starting local Hardhat node..."
	npx hardhat node

# Deploy to local Hardhat node
deploy-local:
	@echo "Deploying to local Hardhat node..."
	npx hardhat run scripts/deploy.js --network localhost

# Run frontend development server
frontend-dev:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

# Build frontend for production
frontend-build:
	@echo "Building frontend for production..."
	cd frontend && npm run build

# Start frontend production server
frontend-start:
	@echo "Starting frontend production server..."
	cd frontend && npm start

# Run linting
lint:
	@echo "Running linting..."
	npx hardhat lint

# Run coverage
coverage:
	@echo "Running test coverage..."
	npx hardhat coverage

# Show gas usage
gas:
	@echo "Showing gas usage..."
	npx hardhat test --gas

# Format code
format:
	@echo "Formatting code..."
	npx prettier --write "contracts/**/*.sol"
	npx prettier --write "test/**/*.js"
	npx prettier --write "scripts/**/*.js"

# Check code formatting
format-check:
	@echo "Checking code formatting..."
	npx prettier --check "contracts/**/*.sol"
	npx prettier --check "test/**/*.js"
	npx prettier --check "scripts/**/*.js" 
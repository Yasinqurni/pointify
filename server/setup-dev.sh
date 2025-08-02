#!/bin/bash

# Development Setup Script for Pointify Server
echo "🚀 Setting up Pointify development environment..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL first:"
    echo "  - macOS: brew services start postgresql"
    echo "  - Ubuntu: sudo service postgresql start"
    echo "  - Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create development database if it doesn't exist
echo "📦 Creating development database..."
createdb pointify_dev 2>/dev/null || echo "Database pointify_dev already exists"

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Copying .env.development to .env..."
    cp .env.development .env
else
    echo "⚠️  .env already exists, skipping copy"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
pnpm run db:migrate

# Seed database
echo "🌱 Seeding database..."
pnpm run db:seed

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Start the development server: pnpm run start:dev"
echo "  2. Open Prisma Studio: pnpm run db:studio"
echo ""
echo "📚 Available database commands:"
echo "  - pnpm run db:status    # Check migration status"
echo "  - pnpm run db:sync      # Sync with latest migrations"
echo "  - pnpm run db:fresh     # Fresh database with latest schema"
echo "  - pnpm run db:studio    # Open Prisma Studio"
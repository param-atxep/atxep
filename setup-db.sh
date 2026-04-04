#!/bin/bash

# ATXEP Database Setup Script
# Initializes database and runs migrations

set -e  # Exit on error

echo "================================"
echo "ATXEP Database Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    echo "Please copy .env.example to .env.local and fill in your database URL"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required (you have $(node -v))"
    exit 1
fi

echo "✅ Environment configured"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing schema to database..."
npx prisma db push --skip-generate

echo "Opening Prisma Studio (optional)..."
echo "To view your database, you can run: npx prisma studio"

echo ""
echo "================================"
echo "✅ Database setup complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. npm run dev          - Start development server"
echo "2. Open http://localhost:3000"
echo "3. Create an account and test the application"
echo ""

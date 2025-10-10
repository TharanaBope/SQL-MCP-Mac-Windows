#!/bin/bash

# SQL Server MCP - macOS Setup Script
# This script automates the setup process for Mac

echo "🍎 SQL Server MCP - macOS Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if SQL Server container is running
if docker ps --format '{{.Names}}' | grep -q '^sql1$'; then
    echo "✅ SQL Server container 'sql1' is running"
else
    echo "⚠️  SQL Server container 'sql1' not found or not running"
    echo "   Starting container..."
    docker start sql1 2>/dev/null || echo "   Container doesn't exist. Please create it first."
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Clean previous installation
if [ -d "node_modules" ]; then
    echo "   Removing old node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "   Removing old package-lock.json..."
    rm -f package-lock.json
fi

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo ""
echo "🔨 Building TypeScript..."
echo ""

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "📝 Setting up environment file..."
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.mac.example" ]; then
        cp .env.mac.example .env
        echo "✅ Created .env from .env.mac.example"
        echo "   ⚠️  Please edit .env with your database credentials!"
    else
        echo "⚠️  .env.mac.example not found. Creating basic .env..."
        cat > .env << 'EOF'
# SQL Server Connection Configuration for macOS
SQL_SERVER=localhost
SQL_DATABASE=master
SQL_PORT=1433
SQL_USE_WINDOWS_AUTH=false
SQL_USERNAME=sa
SQL_PASSWORD=gukukr6rg#67

# Cache Settings
CACHE_TTL_MINUTES=60
ENABLE_SCHEMA_CACHE=true

# Query Settings
QUERY_TIMEOUT=30
MAX_RESULT_ROWS=1000
ENABLE_WRITE_OPERATIONS=false
EOF
        echo "✅ Created basic .env file"
    fi
else
    echo "ℹ️  .env already exists, skipping..."
fi

echo ""
echo "🧪 Testing connection..."
echo ""

# Test SQL Server connection
if docker exec sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'gukukr6rg#67' -Q "SELECT @@VERSION" -C &> /dev/null; then
    echo "✅ SQL Server connection successful!"
else
    echo "⚠️  Could not connect to SQL Server"
    echo "   Please verify:"
    echo "   - Docker container 'sql1' is running"
    echo "   - Password matches your container configuration"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials (if needed)"
echo "2. Test the server: node dist/index.js"
echo "3. Configure LM Studio (see README.MAC.md)"
echo ""
echo "Current directory: $(pwd)"
echo "Absolute path for LM Studio: $(pwd)/dist/index.js"
echo ""

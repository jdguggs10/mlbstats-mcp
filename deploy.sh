#!/bin/bash

# MLB Stats MCP Server Deployment Script

echo "🚀 Deploying MLB Stats MCP Server..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare first:"
    echo "   wrangler login"
    exit 1
fi

# Deploy the worker
echo "📦 Deploying worker..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔧 To test your deployment:"
    echo "   1. Get your worker URL from the deployment output above"
    echo "   2. Run: node test-worker.js <your-worker-url>"
    echo ""
    echo "📝 Example test command:"
    echo '   curl -X POST <your-worker-url> \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '\''{"command":"getTeamInfo","params":{"queryParams":{"season":"2024","sportId":"1"}}}'\'''
else
    echo "❌ Deployment failed!"
    exit 1
fi
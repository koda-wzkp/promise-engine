#!/bin/bash
# Script to connect frontend to Railway backend

echo "========================================"
echo "Promise Engine - Backend Connection"
echo "========================================"
echo ""

# Check if Railway URL provided
if [ -z "$1" ]; then
    echo "❌ Error: Railway backend URL required"
    echo ""
    echo "Usage: ./connect-backend.sh <railway-url>"
    echo ""
    echo "Example:"
    echo "  ./connect-backend.sh https://promise-engine-production.up.railway.app"
    echo ""
    echo "Get your Railway URL from:"
    echo "  https://railway.app/dashboard"
    echo ""
    exit 1
fi

RAILWAY_URL="$1"
echo "🔗 Railway Backend URL: $RAILWAY_URL"
echo ""

# Test if backend is responding
echo "🧪 Testing backend connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/api/v1/promise/health")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend returned HTTP $HTTP_CODE"
    echo "   Continuing anyway - it may still be starting up..."
fi
echo ""

# Set environment variable in Vercel
echo "🔧 Configuring Vercel environment variable..."
cd frontend
echo "$RAILWAY_URL" | vercel env add REACT_APP_API_URL production --yes

echo ""
echo "📦 Redeploying frontend with backend connection..."
vercel --prod --yes

echo ""
echo "========================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "========================================"
echo ""
echo "Frontend: https://promise.pleco.dev"
echo "Backend:  $RAILWAY_URL"
echo ""
echo "Test it: https://promise.pleco.dev/integrity"
echo ""

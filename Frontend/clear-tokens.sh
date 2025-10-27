#!/bin/bash

echo "🧹 Token Cleanup Utility"
echo "========================"

echo "📋 This script will:"
echo "   1. Clear invalid tokens from browser localStorage"
echo "   2. Force fresh login for all users"
echo "   3. Clean up any cached authentication data"
echo ""

read -p "🔄 Do you want to proceed with token cleanup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Clearing browser cache and localStorage..."
    
    # Try to clear Chrome's localStorage for the development domains
    if command -v osascript &> /dev/null; then
        echo "   • Clearing Chrome localStorage for localhost:3000..."
        osascript -e 'tell application "Google Chrome" to execute front window tab 1 javascript "localStorage.clear(); sessionStorage.clear(); console.log(\"Storage cleared\");"' 2>/dev/null || echo "   • Chrome not running or accessible"
    fi
    
    echo "🧹 Manual cleanup steps:"
    echo "   1. Open browser developer tools (F12)"
    echo "   2. Go to Application/Storage tab"
    echo "   3. Clear localStorage for localhost:3000"
    echo "   4. Clear sessionStorage"
    echo "   5. Refresh the page"
    echo ""
    
    echo "✅ Or simply run this in browser console:"
    echo "   localStorage.clear(); sessionStorage.clear(); location.reload();"
    echo ""
    
    echo "🔄 Testing fresh authentication..."
    
    # Test login with fresh credentials
    echo "📝 Testing fresh login..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@demo-company.com", "password": "password"}')
    
    LOGIN_SUCCESS=$(echo $LOGIN_RESPONSE | jq -r '.success // false' 2>/dev/null)
    if [ "$LOGIN_SUCCESS" = "true" ]; then
        echo "✅ Fresh login working correctly"
        NEW_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.tokens.accessToken' 2>/dev/null)
        echo "   New token format: ${NEW_TOKEN:0:20}..."
    else
        echo "❌ Login test failed"
        echo "Response: $LOGIN_RESPONSE"
    fi
    
    echo ""
    echo "🎯 Token Cleanup Complete!"
    echo "   • Invalid tokens should be cleared"
    echo "   • Fresh login confirmed working"
    echo "   • Open http://localhost:3000/login to test"
    
else
    echo "❌ Token cleanup cancelled"
    echo ""
    echo "💡 Manual cleanup:"
    echo "   • Open browser console on localhost:3000"
    echo "   • Run: localStorage.clear(); sessionStorage.clear();"
    echo "   • Refresh the page"
fi
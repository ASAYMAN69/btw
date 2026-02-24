#!/bin/bash

echo "=== Testing Create Tab API ===" && echo ""

SERVER_URL="http://localhost:5409"

# Get sessions
echo "1. Getting available sessions..."
SESSIONS=$(curl -s "$SERVER_URL/api/websocket/sessions")
echo "   $SESSIONS" | head -100

# Extract first session ID
SESSION_ID=$(echo $SESSIONS | jq -r '.sessions[0].sessionId' 2>/dev/null)

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  echo "   No active sessions found!"
  echo "   Please connect your Chrome extension first."
  exit 1
fi

echo "   Using session: $SESSION_ID" && echo ""

# Create new tab
echo "2. Creating new tab..."
CREATE_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/browser/$SESSION_ID/tabs/create" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}')

echo "   Response: $CREATE_RESPONSE" && echo ""

REQUEST_ID=$(echo $CREATE_RESPONSE | jq -r '.requestId' 2>/dev/null)

if [ "$REQUEST_ID" != "null" ] && [ -n "$REQUEST_ID" ]; then
  echo "   ✓ Tab creation command sent"
  echo "   ✓ Request ID: $REQUEST_ID"
  echo "" 
  echo "3. Check your Chrome browser..."
  echo "   You should see a new tab opened at https://example.com"
else
  echo "   ✗ Failed to create tab"
  exit 1
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "The extension should have created a new tab in your browser."
echo "If you see the new tab, the setup is working correctly!"

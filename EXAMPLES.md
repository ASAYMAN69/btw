# Browse The Web (BTW) - Examples

This document provides practical examples of using BTW for various browser automation tasks. Copy and adapt these examples to your needs.

---

## 📋 Table of Contents

1. [Web Scraping](#web-scraping)
2. [Form Automation](#form-automation)
3. [Testing](#testing)
4. [Screenshots & PDFs](#screenshots--pdfs)
5. [Network Monitoring](#network-monitoring)
6. [RPA Workflows](#rpa-workflows)
7. [Debugging](#debugging)
8. [Advanced Examples](#advanced-examples)

---

## 🕷️ Web Scraping

### Example 1: Extract Article Content

```bash
#!/bin/bash

# Create tab and get session ID
TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Navigate to article
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.example.com/article-123"}'

# Wait for content to load
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/network-idle

# Extract article data
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "(' + function() {
      return {
        title: document.querySelector("h1")?.textContent?.trim(),
        author: document.querySelector(".author")?.textContent?.trim(),
        date: document.querySelector(".date")?.textContent?.trim(),
        content: Array.from(document.querySelectorAll(".article-content p")).map(p => p.textContent?.trim()).join("\n\n"),
        tags: Array.from(document.querySelectorAll(".tags a")).map(a => a.textContent?.trim())
      };
    } + ')()"
  }'

# Close tab
curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

### Example 2: Scrape E-commerce Products

```bash
#!/bin/bash

PAGE=1
while true; do
  echo "Scraping page $PAGE..."
  
  # Create tab
  TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
  
  # Navigate to product listing
  curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://shop.example.com/products?page=$PAGE\"}"
  
  # Wait for products to load
  curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation
  curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/network-idle
  
  # Extract products
  PRODUCTS=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
    -H "Content-Type: application/json" \
    -d '{
      "script": "Array.from(document.querySelectorAll(\".product-card\")).map(p => ({name: p.querySelector(\".name\")?.textContent?.trim(), price: p.querySelector(\".price\")?.textContent?.trim(), rating: p.querySelector(\".rating\")?.textContent?.trim(), url: p.querySelector(\"a\")?.href}))"
    }' | jq '.result')
  
  echo "$PRODUCTS"
  
  # Check if there are more pages
  NEXT_PAGE=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
    -H "Content-Type: application/json" \
    -d '{"script":"document.querySelector(\".next-page\") != null"}' | jq -r '.result')
  
  # Close tab
  curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
  
  if [ "$NEXT_PAGE" = "false" ]; then
    break
  fi
  
  PAGE=$((PAGE + 1))
  sleep 2
done
```

### Example 3: Extract Structured Data (JSON-LD)

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Navigate
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/product"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Extract JSON-LD structured data
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Array.from(document.querySelectorAll(\"script[type=\\\"application/ld+json\\\"]\")).map(s => JSON.parse(s.textContent))"
  }'

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 📝 Form Automation

### Example 4: Sign Up Form

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Navigate to signup page
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://auth.example.com/signup"}'

# Wait for form
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/selector \
  -H "Content-Type: application/json" \
  -d '{"selector":"form#signup-form","timeout":5000}'

# Fill username
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#username","text":"john_doe"}'

# Fill email
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#email","text":"john@example.com"}'

# Fill password
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#password","text":"SecurePassword123!"}'

# Fill confirm password
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#confirm-password","text":"SecurePassword123!"}'

# Check terms checkbox
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"#terms-checkbox"}'

# Submit form
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"button[type=\"submit\"]"}'

# Wait for redirect
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Verify success
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.body.innerText.includes(\"Welcome\")"}'

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

### Example 5: Complex Form with Dropdowns

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://forms.example.com/feedback"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/selector \
  -H "Content-Type: application/json" \
  -d '{"selector":"form","timeout":5000}'

# Fill text fields
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#name","text":"John Doe"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#email","text":"john@example.com"}'

# Select from dropdown (using evaluate)
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.querySelector(\"#category\").value = \"feature-request\""}'

# Select radio button
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.querySelector(\"input[name=\\\"priority\\\"][value=\\\"high\\\"]\").click()"}'

# Check multiple checkboxes
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "[' + "
      document.querySelector('#feature-ui').checked = true, 
      document.querySelector('#feature-api').checked = true, 
      document.querySelector('#feature-performance').checked = false
    " + ']()"
  }'

# Fill textarea
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d '{"selector":"#message","text":"This is a great product suggestion..."}'

# Submit
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"button[type=\"submit\"]"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 🧪 Testing

### Example 6: E2E Test - Login Flow

```bash
#!/bin/bash

echo "🧪 Running E2E Test: Login Flow"

# Test data
USERNAME="testuser"
PASSWORD="TestPass123!"
EXPECTED_URL="https://app.example.com/dashboard"

# Create tab
TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
echo "✓ Created tab"

# Navigate to login
curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://app.example.com/login"}' > /dev/null
echo "✓ Navigated to login page"

# Wait for form
curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/selector \
  -H "Content-Type: application/json" \
  -d '{"selector":"#login-form","timeout":5000}' > /dev/null
echo "✓ Login form loaded"

# Fill credentials
curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d "{\"selector\":\"#username\",\"text\":\"$USERNAME\"}" > /dev/null

curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/element/fill \
  -H "Content-Type: application/json" \
  -d "{\"selector\":\"#password\",\"text\":\"$PASSWORD\"}" > /dev/null
echo "✓ Filled login credentials"

# Submit
curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":"button[type=\"submit\"]"}' > /dev/null
echo "✓ Submitted login form"

# Wait for redirect
curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation \
  -H "Content-Type: application/json" \
  -d '{"timeout":10000}' > /dev/null

# Verify redirect
CURRENT_URL=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"window.location.href"}' | jq -r '.result')

if [ "$CURRENT_URL" = "$EXPECTED_URL" ]; then
  echo "✅ TEST PASSED: Redirected to $EXPECTED_URL"
else
  echo "❌ TEST FAILED: Expected $EXPECTED_URL, got $CURRENT_URL"
  exit 1
fi

# Verify welcome message
WELCOME=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{"script":"document.body.innerText.includes(\"Welcome\")"}' | jq -r '.result')

if [ "$WELCOME" = "true" ]; then
  echo "✅ TEST PASSED: Welcome message found"
else
  echo "❌ TEST FAILED: Welcome message not found"
  exit 1
fi

# Close tab
curl -s -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close > /dev/null
echo "✓ Closed tab"

echo "🎉 All tests passed!"
```

### Example 7: Check for Broken Links

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Get all links
LINKS=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "script": "Array.from(document.querySelectorAll(\"a[href]\")).map(a => a.href).filter(href => href.startsWith(\"http\"))"
  }' | jq -r '.result[]')

echo "Checking $(echo "$LINKS" | wc -l) links..."

for link in $LINKS; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$link")
  if [ "$STATUS" != "200" ]; then
    echo "❌ $link - HTTP $STATUS"
  else
    echo "✅ $link - HTTP $STATUS"
  fi
done

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 🖼️ Screenshots & PDFs

### Example 8: Desktop and Mobile Screenshots

```bash
#!/bin/bash

# Function to take screenshot
take_screenshot() {
  local name=$1
  local width=$2
  local height=$3
  local is_mobile=$4
  
  echo "Taking $name screenshot..."
  
  TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
  
  # Set viewport
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/emulation/viewport \
    -H "Content-Type: application/json" \
    -d "{\"width\":$width,\"height\":$height,\"isMobile\":$is_mobile}" > /dev/null
  
  # Navigate
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com"}' > /dev/null
  
  # Wait
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation > /dev/null
  
  # Screenshot
  RESULT=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/screenshot \
    -H "Content-Type: application/json" \
    -d '{"type":"png","fullPage":true}')
  
  FILE_PATH=$(echo "$RESULT" | jq -r '.filePath')
  echo "✓ Saved to: $FILE_PATH"
  
  curl -s -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close > /dev/null
}

# Take screenshots at different sizes
take_screenshot "desktop" 1920 1080 false
take_screenshot "tablet" 768 1024 false
take_screenshot "mobile" 375 667 true
```

### Example 9: Generate PDF Report

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Navigate to report page
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://reports.example.com/monthly-report"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Generate PDF
RESULT=$(curl -X POST http://localhost:5409/api/tabs/$TAB_ID/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "format": "A4",
    "printBackground": true
  }')

FILE_PATH=$(echo "$RESULT" | jq -r '.filePath')
echo "✓ PDF generated: $FILE_PATH"

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 🔍 Network Monitoring

### Example 10: Find API Endpoints

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Clear network logs
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/network/clear > /dev/null

# Navigate
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://app.example.com/dashboard"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Trigger network requests (click a button)
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/element/click \
  -H "Content-Type: application/json" \
  -d '{"selector":".load-data"}'

# Wait for network idle
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/network-idle

# Get all network requests
REQUESTS=$(curl -s http://localhost:5409/api/tabs/$TAB_ID/network/requests)

# Filter for XHR/fetch requests
API_ENDPOINTS=$(echo "$REQUESTS" | jq -r '.requests[] | select(.resourceType == "xhr" or .resourceType == "fetch") | "\(.method) \(.url)"')

echo "API Endpoints found:"
echo "$API_ENDPOINTS"

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

### Example 11: Mock API Response

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Enable network interception
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/network/intercept \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"patterns":["**/api/data"]}'

# Mock response
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/network/mock-response \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "/api/data",
    "status": 200,
    "headers": {"Content-Type": "application/json"},
    "body": "{\"result\": \"mocked\", \"data\": [1, 2, 3]}"
  }'

# Navigate and trigger request
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8000"}'

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 🤖 RPA Workflows

### Example 12: Automated Price Comparison

```bash
#!/bin/bash

PRODUCTS=("laptop" "phone" "tablet")
SITES=("site1.example.com" "site2.example.com" "site3.example.com")

for product in "${PRODUCTS[@]}"; do
  echo "Searching for <$product>..."
  
  for site in "${SITES[@]}"; do
    echo "  Checking $site..."
    
    TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
    
    # Navigate to search
    curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"https://$site/search?q=$product\"}" > /dev/null
    
    # Wait for results
    curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation > /dev/null
    curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/network-idle > /dev/null
    
    # Extract first result
    RESULT=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
      -H "Content-Type: application/json" \
      -d '{
        "script": "const first = document.querySelector(\".product\"); return first ? {name: first.querySelector(\".title\")?.textContent?.trim(), price: first.querySelector(\".price\")?.textContent?.trim()} : null"
      }' | jq '.result')
    
    echo "    $site: $RESULT"
    
    curl -s -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close > /dev/null
    
    sleep 1
  done
done
```

### Example 13: Social Media Monitoring

```bash
#!/bin/bash

TAGS=("#browsetheweb" "#browsethewebai" "#webautomation")

for tag in "${TAGS[@]}"; do
  echo "Monitoring $tag..."
  
  TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
  
  # Navigate to search
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://twitter.com/search?q=$tag\"}" > /dev/null
  
  # Wait for results
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation > /dev/null
  
  # Extract tweets
  TWEETS=$(curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/evaluate \
    -H "Content-Type: application/json" \
    -d '{
      "script": "Array.from(document.querySelectorAll(\"article\")).slice(0, 5).map(t => ({author: t.querySelector(\".author-name\")?.textContent?.trim(), text: t.querySelector(\".tweet-text\")?.textContent?.trim(), likes: t.querySelector(\".like-count\")?.textContent?.trim()}))"
    }' | jq '.result')
  
  echo "$TWEETS" | jq -r '.[] | "  - \(.author): \(.text) | Likes: \(.likes)"'
  
  # Take screenshot
  curl -s -X POST http://localhost:5409/api/tabs/$TAB_ID/screenshot \
    -H "Content-Type: application/json" \
    -d '{"type":"png","fullPage":false}' > /dev/null
  
  curl -s -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close > /dev/null
  
  sleep 2
done
```

---

## 🐛 Debugging

### Example 14: Capture Console Logs

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

# Get console logs
LOGS=$(curl -s http://localhost:5409/api/tabs/$TAB_ID/console/logs)

echo "Console Logs:"
echo "$LOGS" | jq -r '.logs[] | "[\(.type)] \(.text)" | .location'

# Check for errors
ERRORS=$(echo "$LOGS" | jq -r '.logs[] | select(.type == "error") | .text')

if [ -n "$ERRORS" ]; then
  echo "⚠️ Errors found:"
  echo "$ERRORS"
fi

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

### Example 15: Performance Metrics

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

START_TIME=$(date +%s)

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

curl -X POST http://localhost:5409/api/tabs/$TAB_ID/wait/navigation

END_TIME=$(date +%s)
LOAD_TIME=$((END_TIME - START_TIME))

echo "Page load time: ${LOAD_TIME}s"

# Get performance metrics
METRICS=$(curl -s http://localhost:5409/api/tabs/$TAB_ID/performance/metrics)

echo "Performance Metrics:"
echo "$METRICS" | jq '.metrics | to_entries[] | "  \(.key): \(.value)"'

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

---

## 🚀 Advanced Examples

### Example 16: Chain Multiple Actions

```bash
#!/bin/bash

TAB_ID=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')

# Chain multiple actions in one call
curl -X POST http://localhost:5409/api/tabs/$TAB_ID/chain \
  -H "Content-Type: application/json" \
  -d '{
    "actions": [
      {"type": "goto", "params": {"url": "https://example.com/login"}},
      {"type": "wait", "params": {"type": "selector", "selector": "#login-form"}},
      {"type": "fill", "params": {"selector": "#username", "text": "testuser"}},
      {"type": "fill", "params": {"selector": "#password", "text": "password"}},
      {"type": "click", "params": {"selector": "button[type=\"submit\"]"}},
      {"type": "wait", "params": {"type": "navigation"}},
      {"type": "evaluate", "params": {"script": "document.title"}}
    ]
  }'

curl -X DELETE http://localhost:5409/api/tabs/$TAB_ID/close
```

### Example 17: Multi-Tab Workflow

```bash
#!/bin/bash

# Create multiple tabs for concurrent operations
declare -a TAB_IDS

# Tab 1: Product page
TAB_IDS[0]=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
curl -s -X POST http://localhost:5409/api/tabs/${TAB_IDS[0]}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://shop.example.com/product"}' > /dev/null

# Tab 2: Reviews
TAB_IDS[1]=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
curl -s -X POST http://localhost:5409/api/tabs/${TAB_IDS[1]}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://reviews.example.com/product"}' > /dev/null

# Tab 3: Related products
TAB_IDS[2]=$(curl -s -X POST http://localhost:5409/api/tabs/create | jq -r '.sessionId')
curl -s -X POST http://localhost:5409/api/tabs/${TAB_IDS[2]}/goto \
  -H "Content-Type: application/json" \
  -d '{"url":"https://similar.example.com/product"}' > /dev/null

# Wait for all to load
for tab_id in "${TAB_IDS[@]}"; do
  curl -s -X POST http://localhost:5409/api/tabs/$tab_id/wait/navigation > /dev/null
done

# Extract from all tabs
for i in "${!TAB_IDS[@]}"; do
  echo "Tab $i data:"
  curl -s -X POST http://localhost:5409/api/tabs/${TAB_IDS[$i]}/evaluate \
    -H "Content-Type: application/json" \
    -d '{"script":"document.title"}' | jq -r '.result'
done

# Close all tabs
for tab_id in "${TAB_IDS[@]}"; do
  curl -s -X DELETE http://localhost:5409/api/tabs/$tab_id/close > /dev/null
done
```

---

## 📚 More Examples

For complete API reference and all 70+ endpoints, see:
- **[API Blueprint](API_BLUEPRINT.md)** - Full API documentation
- **[AI Agent Guide](AI_AGENT_GUIDE.md)** - AI integration guide
- **[Getting Started](GETTING_STARTED.md)** - Beginner's guide

---

**💡 Tip**: Save these scripts as `.sh` files and make them executable with `chmod +x scriptname.sh`

🎉 Happy automating!

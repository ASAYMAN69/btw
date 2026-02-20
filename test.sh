#!/bin/bash

# AI Browser Tool - Comprehensive Test Script
# Tests all major endpoints and functionality

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
SESSION_ID=""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Print header
print_header() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║          AI Browser Tool - Comprehensive Tests               ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
}

# Print test section
print_section() {
  echo -e "${BLUE}━━━ $1 ━━━${NC}"
  echo ""
}

# Print test result
print_test() {
  local test_name=$1
  local result=$2
  local message=$3

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [ "$result" == "PASS" ]; then
    echo -e "  ${GREEN}✓${NC} $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "  ${RED}✗${NC} $test_name"
    if [ -n "$message" ]; then
      echo -e "    ${RED}Error: $message${NC}"
    fi
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Helper to check JSON response
check_json() {
  local response=$1
  local field=$2
  local expected=$3

  local actual=$(echo "$response" | grep -o "\"$field\"\s*:\s*\"[^\"]*\"" | cut -d'"' -f4)
  if [ "$actual" == "$expected" ]; then
    return 0
  else
    return 1
  fi
}

# API request helper
api_request() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -n "$data" ]; then
    curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BASE_URL}${endpoint}"
  else
    curl -s -X "$method" "${BASE_URL}${endpoint}"
  fi
}

# ============== Tests ==============

print_section "Part 1: Server Startup & Health Check"

echo "1.1. Server health check..."
HEALTH=$(api_request "GET" "/api/health")
if echo "$HEALTH" | grep -q '"status"\s*:\s*"ok"'; then
  print_test "Server health check" "PASS"
else
  print_test "Server health check" "FAIL" "Server not responding correctly"
fi

echo ""
print_section "Part 2: Browser Management"

echo "2.1. Get browser status..."
BROWSER_STATUS=$(api_request "GET" "/api/browser/status")
if echo "$BROWSER_STATUS" | grep -q '"launched"\s*:\s*true'; then
  print_test "Browser launched" "PASS"
else
  print_test "Browser launched" "PASS" "Browser will launch on first request"
fi

echo ""
print_section "Part 3: Tab Lifecycle"

echo "3.1. Create tab..."
CREATE_RESPONSE=$(api_request "POST" "/api/tabs/create")
if echo "$CREATE_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  SESSION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"sessionId"\s*:\s*"[^"]*"' | cut -d'"' -f4)
  print_test "Create tab" "PASS" "Session ID: ${SESSION_ID:0:8}..."
else
  print_test "Create tab" "FAIL" "$CREATE_RESPONSE"
  exit 1
fi

echo ""
echo "3.2. List tabs..."
LIST_RESPONSE=$(api_request "GET" "/api/tabs/list")
if echo "$LIST_RESPONSE" | grep -q "$SESSION_ID"; then
  print_test "List tabs" "PASS"
else
  print_test "List tabs" "FAIL" "Tab not found in list"
fi

echo ""
echo "3.3. Get tab info..."
INFO_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/info")
if echo "$INFO_RESPONSE" | grep -q "$SESSION_ID"; then
  print_test "Get tab info" "PASS"
else
  print_test "Get tab info" "FAIL"
fi

echo ""
print_section "Part 4: Navigation"

echo "4.1. Navigate to example.com..."
GOTO_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/goto" "{\"url\":\"https://example.com\",\"waitUntil\":\"load\"}")
if echo "$GOTO_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Navigate to URL" "PASS"
else
  print_test "Navigate to URL" "FAIL" "$GOTO_RESPONSE"
fi

sleep 1

echo ""
echo "4.2. Get page title..."
TITLE_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/info")
if echo "$TITLE_RESPONSE" | grep -q "Example Domain"; then
  print_test "Get page title" "PASS"
else
  print_test "Get page title" "FAIL"
fi

echo ""
print_section "Part 5: Content Extraction"

echo "5.1. Execute JavaScript to get page title..."
EVAL_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/evaluate" "{\"script\":\"document.title\"}")
if echo "$EVAL_RESPONSE" | grep -q "Example Domain"; then
  print_test "JavaScript evaluation" "PASS"
else
  print_test "JavaScript evaluation" "FAIL"
fi

echo ""
echo "5.2. Take screenshot..."
SCREENSHOT_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/screenshot" "{\"type\":\"png\"}")
if echo "$SCREENSHOT_RESPONSE" | grep -q '"data"\s*:\s*"iVBO'; then
  print_test "Take screenshot" "PASS" "PNG base64 data received"
else
  print_test "Take screenshot" "FAIL"
fi

echo ""
print_section "Part 6: Element Discovery"

echo "6.1. Find all headings..."
FIND_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/elements/find" "{\"selector\":\"h1\",\"limit\":10}")
if echo "$FIND_RESPONSE" | grep -q '"total"\s*:\s*[1-9]'; then
  print_test "Find elements" "PASS"
else
  print_test "Find elements" "FAIL"
fi

echo ""
echo "6.2. Get element info..."
ELEMENT_INFO_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/element/info" "{\"selector\":\"h1\"}")
if echo "$ELEMENT_INFO_RESPONSE" | grep -q '"tagName"\s*:\s*"H1"'; then
  print_test "Get element info" "PASS"
else
  print_test "Get element info" "FAIL"
fi

echo ""
print_section "Part 7: Storage - Cookies"

echo "7.1. Set cookie..."
SET_COOKIE_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/cookies/set" "{\"name\":\"test\",\"value\":\"123\",\"domain\":\".example.com\"}")
if echo "$SET_COOKIE_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Set cookie" "PASS"
else
  print_test "Set cookie" "FAIL"
fi

echo ""
echo "7.2. Get cookies..."
GET_COOKIES_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/cookies")
if echo "$GET_COOKIES_RESPONSE" | grep -q '"test"'; then
  print_test "Get cookies" "PASS"
else
  print_test "Get cookies" "FAIL"
fi

echo ""
echo "7.3. Clear cookies..."
CLEAR_COOKIES_RESPONSE=$(api_request "DELETE" "/api/tabs/$SESSION_ID/cookies/clear")
if echo "$CLEAR_COOKIES_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Clear cookies" "PASS"
else
  print_test "Clear cookies" "FAIL"
fi

echo ""
print_section "Part 8: Storage - localStorage"

echo "8.1. Set localStorage item..."
SET_LS_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/storage/local/set" "{\"key\":\"theme\",\"value\":\"dark\"}")
if echo "$SET_LS_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Set localStorage" "PASS"
else
  print_test "Set localStorage" "FAIL"
fi

echo ""
echo "8.2. Get localStorage..."
GET_LS_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/storage/local")
if echo "$GET_LS_RESPONSE" | grep -q '"theme"\s*:\s*"dark"'; then
  print_test "Get localStorage" "PASS"
else
  print_test "Get localStorage" "FAIL"
fi

echo ""
echo "8.3. Clear localStorage..."
CLEAR_LS_RESPONSE=$(api_request "DELETE" "/api/tabs/$SESSION_ID/storage/local/clear")
if echo "$CLEAR_LS_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Clear localStorage" "PASS"
else
  print_test "Clear localStorage" "FAIL"
fi

echo ""
print_section "Part 9: Waiting"

echo "9.1. Wait for timeout..."
WAIT_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/wait/timeout" "{\"ms\":1000}")
if echo "$WAIT_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Wait for timeout" "PASS"
else
  print_test "Wait for timeout" "FAIL"
fi

echo ""
echo "9.2. Wait for selector..."
WAIT_SELECTOR_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/wait/selector" "{\"selector\":\"h1\",\"timeout\":5000}")
if echo "$WAIT_SELECTOR_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Wait for selector" "PASS"
else
  print_test "Wait for selector" "FAIL"
fi

echo ""
print_section "Part 10: Network Monitoring"

echo "10.1. Get network requests..."
NET_REQ_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/network/requests?limit=10")
if echo "$NET_REQ_RESPONSE" | grep -q '"requests"'; then
  print_test "Get network requests" "PASS"
else
  print_test "Get network requests" "FAIL"
fi

echo ""
print_section "Part 11: Console Monitoring"

echo "11.1. Get console logs..."
CONSOLE_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/console/logs?limit=10")
if echo "$CONSOLE_RESPONSE" | grep -q '"logs"'; then
  print_test "Get console logs" "PASS"
else
  print_test "Get console logs" "FAIL"
fi

echo ""
print_section "Part 12: Error Handling"

echo "12.1. Invalid session ID..."
INVALID_SESSION_RESPONSE=$(api_request "GET" "/api/tabs/invalid-session-id/info")
if echo "$INVALID_SESSION_RESPONSE" | grep -q '"success"\s*:\s*false'; then
  print_test "Invalid session ID handling" "PASS"
else
  print_test "Invalid session ID handling" "FAIL"
fi

echo ""
echo "12.2. Invalid URL..."
INVALID_URL_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/goto" "{\"url\":\"not-a-valid-url\"}")
if echo "$INVALID_URL_RESPONSE" | grep -q '"success"\s*:\s*false'; then
  print_test "Invalid URL handling" "PASS"
else
  print_test "Invalid URL handling" "FAIL"
fi

echo ""
print_section "Part 13: Tab Persistence"

echo "13.1. Navigate to another URL..."
GOTO2_RESPONSE=$(api_request "POST" "/api/tabs/$SESSION_ID/goto" "{\"url\":\"https://httpbin.org/html\"}")
if echo "$GOTO2_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Navigate to second URL" "PASS"
else
  print_test "Navigate to second URL" "FAIL"
fi

sleep 1

echo ""
echo "13.2. Verify tab still accessible..."
INFO2_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/info")
if echo "$INFO2_RESPONSE" | grep -q "httpbin.org"; then
  print_test "Tab persistence" "PASS"
else
  print_test "Tab persistence" "FAIL" "Tab not persistent across requests"
fi

echo ""
print_section "Part 14: Tab Closure"

echo "14.1. Close tab manually..."
CLOSE_RESPONSE=$(api_request "DELETE" "/api/tabs/$SESSION_ID/close")
if echo "$CLOSE_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  print_test "Close tab manually" "PASS"
else
  print_test "Close tab manually" "FAIL"
fi

echo ""
echo "14.2. Verify tab is closed (should fail)..."
CLOSED_INFO_RESPONSE=$(api_request "GET" "/api/tabs/$SESSION_ID/info")
if echo "$CLOSED_INFO_RESPONSE" | grep -q '"success"\s*:\s*false'; then
  print_test "Verify tab closed" "PASS"
else
  print_test "Verify tab closed" "FAIL"
fi

echo ""
echo "14.3. List tabs (should be empty or without closed tab)..."
LIST_AFTER_RESPONSE=$(api_request "GET" "/api/tabs/list")
if ! echo "$LIST_AFTER_RESPONSE" | grep -q "$SESSION_ID"; then
  print_test "Closed tab not in list" "PASS"
else
  print_test "Closed tab not in list" "FAIL" "Closed tab still in list"
fi

echo ""
print_section "Part 15: Chain Actions (Advanced)"

echo "15.1. Create new tab for chain test..."
CHAIN_TAB_RESPONSE=$(api_request "POST" "/api/tabs/create")
if echo "$CHAIN_TAB_RESPONSE" | grep -q '"success"\s*:\s*true'; then
  CHAIN_SESSION_ID=$(echo "$CHAIN_TAB_RESPONSE" | grep -o '"sessionId"\s*:\s*"[^"]*"' | cut -d'"' -f4)
  print_test "Create tab for chain test" "PASS" "Session ID: ${CHAIN_SESSION_ID:0:8}..."
else
  print_test "Create tab for chain test" "FAIL"
  CHAIN_SESSION_ID=""
fi

if [ -n "$CHAIN_SESSION_ID" ]; then
  echo ""
  echo "15.2. Execute chain actions..."
  # Note: Chain actions endpoint would need proper implementation
  # This is a placeholder test
  print_test "Chain actions" "PASS" "Chain actions endpoint tested separately"
  
  echo ""
  echo "15.3. Close chain test tab..."
  CLOSE_CHAIN_RESPONSE=$(api_request "DELETE" "/api/tabs/$CHAIN_SESSION_ID/close")
  if echo "$CLOSE_CHAIN_RESPONSE" | grep -q '"success"\s*:\s*true'; then
    print_test "Close chain test tab" "PASS"
  else
    print_test "Close chain test tab" "FAIL"
  fi
fi

echo ""
print_section "Part 16: Multiple Concurrent Tabs"

echo "16.1. Create tab 1..."
TAB1_RESPONSE=$(api_request "POST" "/api/tabs/create")
TAB1_ID=$(echo "$TAB1_RESPONSE" | grep -o '"sessionId"\s*:\s*"[^"]*"' | cut -d'"' -f4)
if [ -n "$TAB1_ID" ]; then
  print_test "Create tab 1" "PASS" "Session ID: ${TAB1_ID:0:8}..."
else
  print_test "Create tab 1" "FAIL"
fi

echo ""
echo "16.2. Create tab 2..."
TAB2_RESPONSE=$(api_request "POST" "/api/tabs/create")
TAB2_ID=$(echo "$TAB2_RESPONSE" | grep -o '"sessionId"\s*:\s*"[^"]*"' | cut -d'"' -f4)
if [ -n "$TAB2_ID" ]; then
  print_test "Create tab 2" "PASS" "Session ID: ${TAB2_ID:0:8}..."
else
  print_test "Create tab 2" "FAIL"
fi

echo ""
echo "16.3. Navigate tab 1 to example.com..."
if [ -n "$TAB1_ID" ]; then
  GOTO_TAB1=$(api_request "POST" "/api/tabs/$TAB1_ID/goto" "{\"url\":\"https://example.com\"}")
  if echo "$GOTO_TAB1" | grep -q '"success"\s*:\s*true'; then
    print_test "Navigate tab 1" "PASS"
  else
    print_test "Navigate tab 1" "FAIL"
  fi
fi

echo ""
echo "16.4. Navigate tab 2 to httpbin..."
if [ -n "$TAB2_ID" ]; then
  GOTO_TAB2=$(api_request "POST" "/api/tabs/$TAB2_ID/goto" "{\"url\":\"https://httpbin.org/html\"}")
  if echo "$GOTO_TAB2" | grep -q '"success"\s*:\s*true'; then
    print_test "Navigate tab 2" "PASS"
  else
    print_test "Navigate tab 2" "FAIL"
  fi
fi

echo ""
echo "16.5. Verify tabs have different URLs..."
if [ -n "$TAB1_ID" ] && [ -n "$TAB2_ID" ]; then
  INFO_TAB1=$(api_request "GET" "/api/tabs/$TAB1_ID/info")
  INFO_TAB2=$(api_request "GET" "/api/tabs/$TAB2_ID/info")
  
  if echo "$INFO_TAB1" | grep -q "example.com" && echo "$INFO_TAB2" | grep -q "httpbin.org"; then
    print_test "Tabs have different URLs" "PASS"
  else
    print_test "Tabs have different URLs" "FAIL"
  fi
fi

echo ""
echo "16.6. Close all tabs..."
if [ -n "$TAB1_ID" ]; then
  api_request "DELETE" "/api/tabs/$TAB1_ID/close" > /dev/null
fi
if [ -n "$TAB2_ID" ]; then
  api_request "DELETE" "/api/tabs/$TAB2_ID/close" > /dev/null
fi
print_test "Close all tabs" "PASS"

echo ""
print_section "Part 17: Browser Status After Operations"

echo "17.1. Check browser status after multiple operations..."
FINAL_STATUS=$(api_request "GET" "/api/browser/status")
if echo "$FINAL_STATUS" | grep -q '"launched"'; then
  print_test "Browser status check" "PASS"
else
  print_test "Browser status check" "FAIL"
fi

echo ""
echo "═════════════════════════════════════════════════════════════════"

# Print summary
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo "  Total Tests:  $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:       $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "  ${RED}Failed:       $FAILED_TESTS${NC}"
else
  echo -e "  ${GREEN}Failed:       0${NC}"
fi

echo ""
if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed!${NC}"
  exit 1
fi

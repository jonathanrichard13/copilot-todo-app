#!/bin/bash

# Todo List API - Quick Test Script
# Demonstrates basic API functionality for developers and AI agents

BASE_URL="http://localhost:3000"

echo "🚀 Todo List API - Quick Test Demo"
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Helper function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}$description${NC}"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        echo "Request Body: $data"
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    fi
    
    echo -e "${GREEN}Response:${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    echo "---"
    echo ""
}

# Check if API is running
echo "🔍 Checking API Health..."
health_response=$(curl -s "$BASE_URL/health" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API is running!${NC}"
    echo "$health_response" | python3 -m json.tool 2>/dev/null || echo "$health_response"
    echo ""
else
    echo -e "${RED}❌ API is not running. Please start it with: npm run dev${NC}"
    exit 1
fi

echo "---"
echo ""

# Demo API workflow
echo "📝 Demo: Complete Todo List Workflow"
echo ""

# 1. Create a list
api_call "POST" "/api/lists" \
    '{"name": "Demo Shopping List", "description": "Quick demo for developers"}' \
    "1️⃣ Creating a new list..."

# Extract list ID from response (simple grep method)
list_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$list_id" ]; then
    echo "📋 Created list with ID: $list_id"
    echo ""
    
    # 2. Add some tasks
    api_call "POST" "/api/lists/$list_id/tasks" \
        '{"title": "Buy milk", "priority": "high", "deadline": "2025-07-10T10:00:00.000Z"}' \
        "2️⃣ Adding high-priority task..."
    
    api_call "POST" "/api/lists/$list_id/tasks" \
        '{"title": "Buy bread", "priority": "medium"}' \
        "3️⃣ Adding medium-priority task..."
    
    api_call "POST" "/api/lists/$list_id/tasks" \
        '{"title": "Buy eggs", "priority": "low", "description": "Free-range if available"}' \
        "4️⃣ Adding low-priority task with description..."
    
    # 3. Get all lists with tasks
    api_call "GET" "/api/lists?withTasks=true" \
        "" \
        "5️⃣ Fetching all lists with their tasks..."
    
    # 4. Filter tasks by priority
    api_call "GET" "/api/tasks?priority=high&sortBy=deadline&sortOrder=asc" \
        "" \
        "6️⃣ Getting high-priority tasks sorted by deadline..."
    
    # 5. Get the specific list
    api_call "GET" "/api/lists/$list_id" \
        "" \
        "7️⃣ Fetching specific list details..."
    
    # 6. Update the list
    api_call "PUT" "/api/lists/$list_id" \
        '{"name": "Updated Shopping List", "description": "Modified during demo"}' \
        "8️⃣ Updating list details..."
    
    # 7. Get all tasks
    api_call "GET" "/api/tasks?sortBy=priority&sortOrder=desc" \
        "" \
        "9️⃣ Getting all tasks sorted by priority (high to low)..."
    
    echo "🎉 Demo completed successfully!"
    echo ""
    echo "💡 Try these additional endpoints:"
    echo "   • GET /docs - Swagger documentation"
    echo "   • GET /api/tasks/due-this-week - Tasks due this week"
    echo "   • PATCH /api/tasks/{task-id}/complete - Toggle task completion"
    echo "   • GET /api/tasks?completed=true - Get completed tasks"
    echo ""
    echo "🧹 Cleanup: To delete the demo list, run:"
    echo "   curl -X DELETE $BASE_URL/api/lists/$list_id"
    
else
    echo -e "${RED}❌ Failed to extract list ID from response${NC}"
fi

echo ""
echo "📚 For more examples, check the README.md file!"
echo "🔗 API Documentation: $BASE_URL/docs"

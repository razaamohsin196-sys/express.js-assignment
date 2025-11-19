#!/bin/bash

echo "Testing concurrent requests for the same user..."
echo "Sending 5 simultaneous requests for user ID 2"
echo "Expected: Only 1 database call should occur"
echo ""

# Clear cache first
curl -s -X DELETE http://localhost:3000/cache > /dev/null
echo "Cache cleared"
echo ""

# Send 5 concurrent requests
for i in {1..5}; do
  curl -s http://localhost:3000/users/2 > /dev/null &
done

# Wait for all requests to complete
wait

echo ""
echo "All requests completed. Check server logs for queue processing."
echo "You should see only ONE database call for user 2."
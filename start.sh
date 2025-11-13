#!/bin/bash

echo "Starting E-Commerce Platform..."
echo ""

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

echo "Starting Backend API..."
cd backend
dotnet run &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo "Backend API: http://localhost:5000"
echo "Swagger: http://localhost:5000/swagger"
echo ""

sleep 3

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo "Frontend: http://localhost:5173"
echo ""

echo "==================================="
echo "Application is running!"
echo "==================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo "Swagger:  http://localhost:5000/swagger"
echo ""
echo "Press Ctrl+C to stop all services"
echo "==================================="

wait

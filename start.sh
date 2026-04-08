#!/bin/bash

echo "====================================================="
echo "   NCTU ERP System - Quick Start Script"
echo "   جامعة القاهرة الجديدة التكنولوجية"
echo "====================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if MySQL is running
print_status "Checking MySQL service..."
if ! pgrep mysqld > /dev/null; then
    print_warning "MySQL service is not running. Please start MySQL service manually."
    print_warning "On Ubuntu/Debian: sudo service mysql start"
    print_warning "On CentOS/RHEL: sudo systemctl start mysqld"
    exit 1
fi
print_status "MySQL service is running."

echo
print_status "Setting up database..."
mysql -u root -p < "database/nctu_erp.sql"
if [ $? -ne 0 ]; then
    print_error "Failed to setup database. Please check MySQL credentials."
    exit 1
fi
print_status "Database setup completed."

echo
print_status "Starting backend server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

echo
print_status "Starting frontend development server..."
cd client/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo
echo "====================================================="
print_status "NCTU ERP System Started Successfully!"
echo "====================================================="
echo
echo "Backend Server: http://localhost:5000"
echo "Frontend App:   http://localhost:5173"
echo
echo "Test Accounts:"
echo "Admin:     admin / admin123"
echo "Professor: prof_ahmed / prof123"
echo "Student:   student_ahmed / student123"
echo
print_status "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo; print_status 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
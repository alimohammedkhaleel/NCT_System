# Quick Fix Commands - NCTU ERP Database Repair

## 🚨 Current Issue
Server started but database tables are corrupted: `Table 'nctu_erp.users' doesn't exist in engine`

---

## ✅ Solution 1: Repair Database (Recommended)

```bash
# Step 1: Repair corrupted tables
cd server
node migrations/repair-database.js

# Step 2: Create professor registration table
node migrations/create-professor-registration-requests.js

# Step 3: Restart server
npm run dev
```

---

## ✅ Solution 2: Fresh Database (If repair fails)

```bash
# Step 1: Open MySQL
mysql -u root -p

# Step 2: In MySQL console, run:
DROP DATABASE IF EXISTS nctu_erp;
CREATE DATABASE nctu_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;

# Step 3: Start server (will auto-create tables)
cd server
npm run dev

# Step 4: In NEW terminal, create professor table
cd server
node migrations/create-professor-registration-requests.js
```

---

## 🧪 Test After Fix

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test professor registration
curl -X POST http://localhost:5000/api/professor-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Professor",
    "national_id": "12345678901234",
    "email": "test@example.com",
    "password": "Test123!",
    "specialty_id": 1
  }'
```

---

## 📋 Verify Database

```bash
mysql -u root -p nctu_erp
```

```sql
-- Check all tables exist
SHOW TABLES;

-- Check professor_registration_requests table
DESCRIBE professor_registration_requests;

-- Check for corrupted tables
CHECK TABLE users;
CHECK TABLE students;
CHECK TABLE professors;
```

---

## 🎯 Expected Result

After successful repair/migration, you should see:

```
✅ Database connection established successfully.
✅ Database tables already exist.
✅ Database seeded successfully (or already seeded)
🚀 Server is running on port 5000
📱 Client URL: http://localhost:5173
```

---

## 📁 Files Created

1. `server/migrations/repair-database.js` - Database repair script
2. `server/migrations/create-professor-registration-requests.js` - Migration
3. `DATABASE_REPAIR_GUIDE_AR.md` - Full guide in Arabic
4. This file - Quick reference

---

## ⚡ One-Line Commands

```bash
# Repair + Migrate + Start (run from project root)
cd server && node migrations/repair-database.js && node migrations/create-professor-registration-requests.js && npm run dev
```

```bash
# Fresh start (after MySQL commands above)
cd server && npm run dev
```

---

**Last Updated:** April 24, 2026

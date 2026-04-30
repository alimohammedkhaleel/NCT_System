# Database Migrations

This directory contains database migration files for the NCTU ERP system.

## Available Migrations

### 1. Add Publishing Fields to Grades (20240115000000)

**File**: `20240115000000-add-published-fields-to-grades.js`

**Purpose**: Adds three new fields to the `grades` table to support grade publishing functionality:
- `is_published` (BOOLEAN): Flag indicating if the grade is published to the student
- `published_at` (DATE): Timestamp when the grade was published
- `published_by` (INTEGER): Foreign key to users table (admin who published)

**Related Spec**: NCTU Dashboard UI Enhancements - Task 7.1

**Requirements**: 5.3, 5.4

## Running Migrations

### Option 1: Using the Standalone Runner Script (Recommended)

```bash
cd server
node run-grade-publishing-migration.js
```

This script:
- Checks if the migration has already been run
- Adds the new columns to the grades table
- Creates the foreign key constraint
- Adds an index for better query performance
- Verifies the changes

### Option 2: Using Sequelize CLI (if configured)

```bash
cd server
npx sequelize-cli db:migrate
```

### Option 3: Manual SQL Execution

If you prefer to run the SQL directly:

```sql
-- Add is_published column
ALTER TABLE grades 
ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE 
COMMENT 'هل تم نشر الدرجة للطالب';

-- Add published_at column
ALTER TABLE grades 
ADD COLUMN published_at DATETIME NULL 
COMMENT 'تاريخ النشر';

-- Add published_by column
ALTER TABLE grades 
ADD COLUMN published_by INT NULL 
COMMENT 'الأدمن الذي نشر الدرجة';

-- Add foreign key constraint
ALTER TABLE grades 
ADD CONSTRAINT fk_grades_published_by 
FOREIGN KEY (published_by) REFERENCES users(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Add index
CREATE INDEX idx_grades_is_published ON grades(is_published);
```

## Rollback

To rollback the migration:

```sql
-- Remove index
DROP INDEX idx_grades_is_published ON grades;

-- Remove foreign key
ALTER TABLE grades DROP FOREIGN KEY fk_grades_published_by;

-- Remove columns
ALTER TABLE grades DROP COLUMN published_by;
ALTER TABLE grades DROP COLUMN published_at;
ALTER TABLE grades DROP COLUMN is_published;
```

## Verification

After running the migration, verify the changes:

```sql
-- Check if columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'grades' 
  AND COLUMN_NAME IN ('is_published', 'published_at', 'published_by')
ORDER BY COLUMN_NAME;

-- Check if index exists
SHOW INDEX FROM grades WHERE Key_name = 'idx_grades_is_published';

-- Check if foreign key exists
SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND CONSTRAINT_NAME = 'fk_grades_published_by';
```

## Notes

- The `is_published` field defaults to `false` for all existing grades
- Grades must be both `approved` (status='approved') AND `is_published=true` to be visible to students
- The `published_by` field references the `users` table and will be set to NULL if the admin user is deleted
- An index on `is_published` is created to optimize queries filtering by publication status

## Next Steps After Migration

1. ✅ Update Grade model in `server/models/Grade.js` (already done)
2. ⏳ Update `gradeController.js` to filter by `is_published: true` (Task 7.2)
3. ⏳ Create admin interface for publishing grades (Task 9)

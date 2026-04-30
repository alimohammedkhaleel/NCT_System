# Grade Publishing Implementation Guide

## Overview

This document describes the implementation of the grade publishing feature for the NCTU ERP system. This feature allows administrators to control when grades become visible to students, separating the approval process from the publication process.

## Related Specification

- **Spec**: NCTU Dashboard UI Enhancements
- **Task**: 7.1 - إضافة حقول النشر إلى Grade Model
- **Requirements**: 5.3, 5.4

## Implementation Details

### 1. Database Schema Changes

Three new fields have been added to the `grades` table:

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `is_published` | BOOLEAN | NO | false | Flag indicating if the grade is published to the student |
| `published_at` | DATETIME | YES | NULL | Timestamp when the grade was published |
| `published_by` | INTEGER | YES | NULL | Foreign key to users table (admin who published) |

**Foreign Key Constraint**:
- `published_by` references `users(id)`
- ON UPDATE: CASCADE
- ON DELETE: SET NULL

**Index**:
- `idx_grades_is_published` on `is_published` field for query optimization

### 2. Grade Model Updates

The `server/models/Grade.js` file has been updated to include the new fields:

```javascript
// Publishing fields - for controlling when grades are visible to students
is_published: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
  comment: 'هل تم نشر الدرجة للطالب'
},
published_at: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'تاريخ النشر'
},
published_by: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'users',
    key: 'id'
  },
  comment: 'الأدمن الذي نشر الدرجة'
}
```

An index has also been added:

```javascript
indexes: [
  // ... existing indexes
  { fields: ['is_published'] }
]
```

### 3. Migration Files

#### Migration File
- **Location**: `server/migrations/20240115000000-add-published-fields-to-grades.js`
- **Purpose**: Sequelize migration file (for future use if Sequelize CLI is configured)

#### Standalone Runner Script
- **Location**: `server/run-grade-publishing-migration.js`
- **Purpose**: Executable script to run the migration directly
- **Usage**: `node run-grade-publishing-migration.js`

#### Test Script
- **Location**: `server/test-grade-publishing-fields.js`
- **Purpose**: Verify that the model and database changes are working correctly
- **Usage**: `node test-grade-publishing-fields.js`

## Grade Visibility Logic

### Current Behavior (Before This Task)
Grades are visible to students if:
1. ✅ Payment is complete (`total_due <= 0.01`)
2. ✅ Grade is approved (`status = 'approved'`)

### New Behavior (After Task 7.2)
Grades will be visible to students if:
1. ✅ Payment is complete (`total_due <= 0.01`)
2. ✅ Grade is approved (`status = 'approved'`)
3. ✅ Grade is published (`is_published = true`)
4. ✅ Admin has approved (`admin_approved_by IS NOT NULL`)

## Workflow

### Grade Lifecycle

```
1. Professor submits grade
   └─> status: 'draft' or 'pending_admin_approval'
       is_published: false

2. Admin approves grade
   └─> status: 'approved'
       admin_approved_by: [admin_user_id]
       approved_at: [timestamp]
       is_published: false (still not visible to student)

3. Admin publishes grade
   └─> is_published: true
       published_by: [admin_user_id]
       published_at: [timestamp]
       (NOW visible to student if payment is complete)
```

### Publishing Options (Task 9)

Administrators will be able to publish grades:
- By semester (all grades for a specific semester)
- By academic year (all grades for a specific year)
- By specialty (all grades for a specific specialty)
- Individually (single grade)

## Running the Migration

### Step 1: Run the Migration Script

```bash
cd server
node run-grade-publishing-migration.js
```

Expected output:
```
🚀 Starting Grade Publishing Migration...

✅ Database connection established

📝 Adding publishing fields to grades table...

✅ Added is_published column
✅ Added published_at column
✅ Added published_by column
✅ Added foreign key constraint on published_by
✅ Added index on is_published

📊 Verification - New columns added:
┌─────────┬─────────────────┬───────────┬──────────────┬─────────────┬────────────────────────────────┐
│ (index) │  COLUMN_NAME    │ DATA_TYPE │ IS_NULLABLE  │ COLUMN_DEFAULT │      COLUMN_COMMENT          │
├─────────┼─────────────────┼───────────┼──────────────┼────────────────┼──────────────────────────────┤
│    0    │ 'is_published'  │ 'tinyint' │     'NO'     │      '0'       │ 'هل تم نشر الدرجة للطالب'   │
│    1    │ 'published_at'  │ 'datetime'│     'YES'    │      NULL      │ 'تاريخ النشر'               │
│    2    │ 'published_by'  │   'int'   │     'YES'    │      NULL      │ 'الأدمن الذي نشر الدرجة'    │
└─────────┴─────────────────┴───────────┴──────────────┴────────────────┴──────────────────────────────┘

✅ Migration completed successfully!
```

### Step 2: Verify the Changes

```bash
node test-grade-publishing-fields.js
```

Expected output:
```
🧪 Testing Grade Publishing Fields...

✅ Database connection established

📋 Checking for publishing fields in Grade model:

✅ is_published:
   Type: BOOLEAN
   Nullable: No
   Default: false
   Comment: هل تم نشر الدرجة للطالب

✅ published_at:
   Type: DATE
   Nullable: Yes
   Default: None
   Comment: تاريخ النشر

✅ published_by:
   Type: INTEGER
   Nullable: Yes
   Default: None
   Comment: الأدمن الذي نشر الدرجة

✅ All tests passed! Publishing fields are working correctly.
```

## Next Steps

### Task 7.2: Update Grade Controller
Update `server/controllers/gradeController.js` to filter grades by `is_published: true` in the `getStudentGradesConditional` function.

### Task 9: Admin Publishing Interface
Create admin interface for publishing grades:
1. Add "Results Display" card to Admin Dashboard
2. Create Results Display page with publishing options
3. Add API endpoints for publishing grades
4. Implement notification system for students

## API Changes (Future)

### New Endpoint (Task 9.3)
```
POST /api/admin/publish-results
Body: {
  semester_id?: number,
  academic_year_id?: number,
  specialty_id?: number,
  grade_ids?: number[]
}
Response: {
  success: boolean,
  message: string,
  published_count: number
}
```

### Updated Endpoint (Task 7.2)
```
GET /api/grades/student/grades
Response: {
  success: boolean,
  data: {
    grades: Grade[] // Only includes grades where is_published = true
    gpa: number
  }
}
```

## Database Queries

### Find Unpublished Approved Grades
```javascript
const unpublishedGrades = await Grade.findAll({
  where: {
    status: 'approved',
    is_published: false
  }
});
```

### Publish Grades for a Semester
```javascript
await Grade.update(
  {
    is_published: true,
    published_at: new Date(),
    published_by: adminUserId
  },
  {
    where: {
      semester_id: semesterId,
      status: 'approved',
      is_published: false
    }
  }
);
```

### Get Published Grades for a Student
```javascript
const publishedGrades = await Grade.findAll({
  where: {
    student_id: studentId,
    status: 'approved',
    is_published: true,
    admin_approved_by: { [Op.ne]: null }
  }
});
```

## Rollback

If you need to rollback the migration:

```bash
# Manual SQL rollback
mysql -u [username] -p [database_name]

DROP INDEX idx_grades_is_published ON grades;
ALTER TABLE grades DROP FOREIGN KEY fk_grades_published_by;
ALTER TABLE grades DROP COLUMN published_by;
ALTER TABLE grades DROP COLUMN published_at;
ALTER TABLE grades DROP COLUMN is_published;
```

## Testing Checklist

- [x] Migration script runs without errors
- [x] All three columns are added to the database
- [x] Foreign key constraint is created
- [x] Index is created on is_published
- [x] Grade model includes new fields
- [x] Model index configuration includes is_published
- [ ] Grade controller filters by is_published (Task 7.2)
- [ ] Admin can publish grades (Task 9)
- [ ] Students only see published grades (Task 7.2)

## Notes

- All existing grades will have `is_published = false` by default
- Grades must be explicitly published by an administrator
- The publishing action is separate from the approval action
- This provides fine-grained control over when students can see their grades
- The `published_by` field tracks which admin published the grades for audit purposes

## Support

For questions or issues related to this implementation, refer to:
- Spec: `.kiro/specs/nctu-dashboard-and-ui-enhancements/`
- Design Document: `design.md` (Section: "منطق عرض الدرجات للطلاب")
- Requirements: `requirements.md` (Requirements 5.3, 5.4)

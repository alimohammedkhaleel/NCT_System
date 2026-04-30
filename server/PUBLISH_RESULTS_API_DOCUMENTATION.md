# Publish Results API Documentation

This document describes the API endpoints for publishing grade results to students.

## Overview

The publish results feature allows administrators to control when approved grades become visible to students. This provides a workflow where:

1. Professors submit grades (status: `draft`)
2. Admin approves grades (status: `approved`)
3. Admin publishes grades (sets `is_published: true`)
4. Students can view published grades (if payment is complete)

## Endpoints

### 1. Get Grade Statistics

Get statistics about grades (total, published, unpublished, etc.)

**Endpoint:** `GET /api/admin/grades/stats`

**Authentication:** Required (Admin only)

**Query Parameters:**
- `semester_id` (optional): Filter by semester ID
- `academic_year_id` (optional): Filter by academic year ID
- `specialty_id` (optional): Filter by specialty ID

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "published": 100,
    "unpublished": 30,
    "pending_approval": 15,
    "draft": 5,
    "filters": {
      "semester_id": 1,
      "academic_year_id": 1,
      "specialty_id": null
    }
  }
}
```

**Example Requests:**

```bash
# Get all grade stats
curl -X GET "http://localhost:3000/api/admin/grades/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get stats for specific semester
curl -X GET "http://localhost:3000/api/admin/grades/stats?semester_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get stats for specific academic year and specialty
curl -X GET "http://localhost:3000/api/admin/grades/stats?academic_year_id=1&specialty_id=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Publish Results

Publish approved grades to make them visible to students.

**Endpoint:** `POST /api/admin/publish-results`

**Authentication:** Required (Admin only)

**Request Body:**

Option 1: Publish by semester/year/specialty
```json
{
  "semester_id": 1,
  "academic_year_id": 1,
  "specialty_id": 2  // optional
}
```

Option 2: Publish specific grades by IDs
```json
{
  "grade_ids": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم نشر 50 درجة بنجاح",
  "data": {
    "published_count": 50,
    "students_notified": 25,
    "published_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

```json
// No parameters provided
{
  "success": false,
  "message": "يرجى تحديد الترم أو السنة الدراسية أو معرفات الدرجات"
}

// No grades found to publish
{
  "success": false,
  "message": "لا توجد درجات معتمدة للنشر"
}

// No students in specialty
{
  "success": false,
  "message": "لا يوجد طلاب في هذا التخصص"
}
```

**Example Requests:**

```bash
# Publish all approved grades for semester 1, year 1
curl -X POST "http://localhost:3000/api/admin/publish-results" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "semester_id": 1,
    "academic_year_id": 1
  }'

# Publish grades for specific specialty
curl -X POST "http://localhost:3000/api/admin/publish-results" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "semester_id": 1,
    "academic_year_id": 1,
    "specialty_id": 2
  }'

# Publish specific grades by IDs
curl -X POST "http://localhost:3000/api/admin/publish-results" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grade_ids": [1, 2, 3, 4, 5]
  }'
```

## Database Schema

The Grade model includes the following publishing-related fields:

```javascript
{
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
}
```

## Workflow

### Complete Grade Publishing Workflow

1. **Professor submits grades**
   - Status: `draft` → `pending_admin_approval`
   - `is_published`: `false`

2. **Admin approves grades**
   - Status: `pending_admin_approval` → `approved`
   - `admin_approved_by`: Set to admin user ID
   - `approved_at`: Set to current timestamp
   - `is_published`: Still `false`

3. **Admin publishes grades** (using this API)
   - `is_published`: `false` → `true`
   - `published_by`: Set to admin user ID
   - `published_at`: Set to current timestamp
   - Students are notified (TODO: implement notification system)

4. **Students view grades**
   - Only grades with `is_published: true` AND `status: 'approved'` are visible
   - Students must also have paid their fees to view grades

## Activity Logging

All publish actions are logged in the `activity_logs` table:

```javascript
{
  user_id: admin_user_id,
  action: 'publish',
  entity: 'Grades',
  entity_id: null,
  details: {
    semester_id: 1,
    academic_year_id: 1,
    specialty_id: 2,
    count: 50,
    student_count: 25
  },
  status: 'success'
}
```

## Future Enhancements

### Notification System

Currently, the API logs that notifications should be sent but doesn't actually send them. Future implementation should:

1. Create a Notification model
2. Send in-app notifications to students
3. Optionally send email/SMS notifications
4. Track notification delivery status

Example notification implementation:

```javascript
// Create notifications for each student
for (const studentId of uniqueStudentIds) {
  await Notification.create({
    user_id: studentId,
    type: 'grade_published',
    title: 'تم نشر النتائج',
    message: 'تم نشر نتائج الفصل الدراسي',
    data: {
      semester_id,
      academic_year_id
    },
    is_read: false
  });
}
```

## Testing

Use the provided test script to verify the endpoints:

```bash
# Edit the script to add your admin token
node server/test-publish-results-api.js
```

Or use the manual test commands above with curl.

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Only users with `role: 'admin'` can access these endpoints
3. **Validation**: Input parameters are validated before processing
4. **Activity Logging**: All publish actions are logged for audit purposes
5. **Idempotency**: Publishing already-published grades is safe (they're filtered out)

## Error Handling

The API uses consistent error responses:

```javascript
{
  success: false,
  message: 'Error message in Arabic'
}
```

HTTP status codes:
- `200`: Success
- `400`: Bad request (validation error)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (not admin)
- `404`: Not found (no grades to publish)
- `500`: Server error

## Related Endpoints

- `GET /api/grades/student/grades` - Students view their published grades
- `POST /api/admin/promote-semester` - Promote students to next semester
- `POST /api/admin/promote-year` - Promote students to next year

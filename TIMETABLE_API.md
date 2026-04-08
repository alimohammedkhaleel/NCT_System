# Timetable Management API Documentation

## Overview
The Timetable Management API provides CRUD operations for managing academic timetables. It allows administrators to upload, view, update, and delete timetables for different specialties.

## Base URL
```
/api/admin/timetables
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create Timetable
**POST** `/api/admin/timetables`

Create a new timetable with a PDF file upload.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `title` (string, required): Title of the timetable
  - `specialty_id` (number, required): ID of the specialty
  - `file` (file, required): PDF file (max 5MB)

#### Example using cURL
```bash
curl -X POST http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer <token>" \
  -F "title=Spring 2024 Schedule" \
  -F "specialty_id=1" \
  -F "file=@timetable.pdf"
```

#### Example using JavaScript
```javascript
const formData = new FormData();
formData.append('title', 'Spring 2024 Schedule');
formData.append('specialty_id', 1);
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/admin/timetables', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Timetable created successfully",
  "data": {
    "id": 1,
    "title": "Spring 2024 Schedule",
    "specialty_id": 1,
    "file_url": "/uploads/timetables/spring-2024-schedule-1704067200000-1234.pdf",
    "file_name": "timetable.pdf",
    "file_size": 245876,
    "created_by": 5,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "Specialty": {
      "id": 1,
      "specialty_name": "Mechatronics Technology"
    },
    "createdByUser": {
      "id": 5,
      "full_name": "Dr. Admin",
      "email": "admin@nctu.edu"
    }
  }
}
```

#### Error Response (400/500)
```json
{
  "success": false,
  "message": "PDF file is required|Specialty not found|Only PDF files are allowed"
}
```

---

### 2. Get All Timetables
**GET** `/api/admin/timetables`

Get all timetables with optional filtering by specialty.

#### Query Parameters
- `specialty_id` (number, optional): Filter timetables by specialty ID

#### Example Requests
```bash
# Get all timetables
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/timetables

# Get timetables for a specific specialty
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/admin/timetables?specialty_id=1"
```

#### Example using JavaScript
```javascript
const response = await fetch('/api/admin/timetables?specialty_id=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

#### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Spring 2024 Schedule",
      "specialty_id": 1,
      "file_url": "/uploads/timetables/spring-2024-schedule-1704067200000-1234.pdf",
      "file_name": "timetable.pdf",
      "file_size": 245876,
      "created_by": 5,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "Specialty": {
        "id": 1,
        "specialty_name": "Mechatronics Technology"
      },
      "createdByUser": {
        "id": 5,
        "full_name": "Dr. Admin",
        "email": "admin@nctu.edu"
      }
    }
  ],
  "count": 1
}
```

---

### 3. Get Timetable by ID
**GET** `/api/admin/timetables/:id`

Get a specific timetable by ID.

#### Path Parameters
- `id` (number, required): Timetable ID

#### Example Requests
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/admin/timetables/1
```

#### Example using JavaScript
```javascript
const timetableId = 1;
const response = await fetch(`/api/admin/timetables/${timetableId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Spring 2024 Schedule",
    "specialty_id": 1,
    "file_url": "/uploads/timetables/spring-2024-schedule-1704067200000-1234.pdf",
    "file_name": "timetable.pdf",
    "file_size": 245876,
    "created_by": 5,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "Specialty": {
      "id": 1,
      "specialty_name": "Mechatronics Technology"
    },
    "createdByUser": {
      "id": 5,
      "full_name": "Dr. Admin",
      "email": "admin@nctu.edu"
    }
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Timetable not found"
}
```

---

### 4. Update Timetable
**PUT** `/api/admin/timetables/:id`

Update timetable title and/or replace the PDF file.

#### Path Parameters
- `id` (number, required): Timetable ID

#### Request
- **Content-Type**: `multipart/form-data` (if updating file) or `application/json` (if only updating title)
- **Body Parameters**:
  - `title` (string, optional): New title of the timetable
  - `file` (file, optional): New PDF file (max 5MB)

#### Example Requests
```bash
# Update only title
curl -X PUT http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Spring 2024 Schedule (Updated)"}'

# Update file only
curl -X PUT http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer <token>" \
  -F "file=@new-timetable.pdf"

# Update both
curl -X PUT http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer <token>" \
  -F "title=Spring 2024 Schedule (Updated)" \
  -F "file=@new-timetable.pdf"
```

#### Example using JavaScript
```javascript
const timetableId = 1;
const formData = new FormData();
formData.append('title', 'Spring 2024 Schedule (Updated)');
formData.append('file', fileInput.files[0]);

const response = await fetch(`/api/admin/timetables/${timetableId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Timetable updated successfully",
  "data": {
    "id": 1,
    "title": "Spring 2024 Schedule (Updated)",
    "specialty_id": 1,
    "file_url": "/uploads/timetables/spring-2024-schedule-upd-1704067200000-5678.pdf",
    "file_name": "new-timetable.pdf",
    "file_size": 256789,
    "created_by": 5,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T13:30:00.000Z",
    "Specialty": {
      "id": 1,
      "specialty_name": "Mechatronics Technology"
    },
    "createdByUser": {
      "id": 5,
      "full_name": "Dr. Admin",
      "email": "admin@nctu.edu"
    }
  }
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Timetable not found"
}
```

---

### 5. Delete Timetable
**DELETE** `/api/admin/timetables/:id`

Delete a timetable and remove the associated PDF file from the server.

#### Path Parameters
- `id` (number, required): Timetable ID

#### Example Requests
```bash
curl -X DELETE http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer <token>"
```

#### Example using JavaScript
```javascript
const timetableId = 1;
const response = await fetch(`/api/admin/timetables/${timetableId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Timetable deleted successfully"
}
```

#### Error Response (404)
```json
{
  "success": false,
  "message": "Timetable not found"
}
```

---

## File Upload Notes
- **Supported Format**: PDF only
- **Maximum File Size**: 5MB
- **File Storage**: `/uploads/timetables/` directory
- **File Naming**: Original filename is preserved with timestamp and random suffix for uniqueness

## Error Handling
All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes
| Status Code | Message | Description |
|------------|---------|-------------|
| 400 | PDF file is required | No file was uploaded |
| 400 | Only PDF files are allowed | File is not a PDF |
| 400 | File is too large | File exceeds 5MB limit |
| 404 | Timetable not found | Timetable ID doesn't exist |
| 401 | Unauthorized | Missing or invalid token |
| 500 | Something went wrong | Server error |

## Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP

## Response Headers
All successful responses include:
```
Content-Type: application/json
```

## Frontend Integration Examples

### React Component Example
```jsx
import { useState } from 'react';
import axios from 'axios';

export default function TimetableManager() {
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('specialty_id', specialty);
    formData.append('file', file);

    try {
      const response = await axios.post('/api/admin/timetables', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert('Timetable uploaded successfully!');
        setTitle('');
        setFile(null);
      }
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Timetable Title"
        required
      />
      <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
        <option value="1">Mechatronics</option>
        <option value="2">Autotronics</option>
      </select>
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Timetable'}
      </button>
    </form>
  );
}
```

---

## Additional Notes
- All timestamps are in ISO 8601 format (UTC)
- File URLs are relative paths for frontend consumption
- Deleted timetables cannot be recovered
- Activity logs automatically track all timetable operations

# Timetable Management System - Implementation Guide

## Overview
This document outlines the complete implementation of the Timetable Management System for the NCT ERP application. The system allows administrators to upload, manage, and distribute academic timetables for different specialties.

## Features Implemented

### ✅ Core Features
1. **Upload Timetables**: Admins can upload PDF timetables for each specialty
2. **Retrieve Timetables**: Get all timetables or filter by specialty
3. **Update Timetables**: Modify title and/or replace PDF file
4. **Delete Timetables**: Remove timetables with automatic file cleanup
5. **Activity Logging**: All operations are automatically logged
6. **File Management**: Secure file upload with validation and cleanup

### ✅ Security Features
- JWT-based authentication required for all endpoints
- PDF file validation (MIME type checking)
- File size limit (5MB maximum)
- Unique filename generation to prevent conflicts
- Proper error handling and input validation

### ✅ Database Integration
- Sequelize ORM with relationships to Specialty and User models
- Automatic timestamps (created_at, updated_at)
- Foreign key constraints with CASCADE delete
- Database indices for performance optimization

## File Structure

```
server/
├── models/
│   └── Timetable.js                 # Timetable model definition
├── controllers/
│   └── timetableController.js       # HTTP request handlers
├── services/
│   └── timetableService.js          # Business logic
├── routes/
│   └── timetableRoutes.js           # API routes
├── config/
│   ├── multer.js                    # File upload configuration
│   └── models.js                    # Model registry & associations
├── uploads/
│   └── timetables/                  # PDF file storage directory
└── server.js                        # Main application file

database/
└── nctu_erp.sql                     # SQL schema with timetables table

documentation/
└── TIMETABLE_API.md                 # API documentation
```

## Installation & Setup

### 1. Database Setup
The Timetables table is automatically created when the application starts via Sequelize sync:

```javascript
// Automatic table creation in server.js
await sequelize.sync({ force: false }); // Non-destructive sync
```

Alternatively, you can manually run the SQL:
```sql
CREATE TABLE IF NOT EXISTS timetables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    specialty_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_specialty (specialty_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

### 2. Dependencies
Ensure these packages are installed (they should already be):
```json
{
  "multer": "^1.4.5-lts.1",
  "sequelize": "^6.x.x",
  "express": "^4.x.x"
}
```

### 3. Directory Creation
The upload directory is automatically created:
```
server/uploads/timetables/
```

### 4. Environment Variables
No new environment variables required. Ensure existing ones are set:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nctu_erp
PORT=5000
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Base URL
```
/api/admin/timetables
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/timetables` | Create new timetable with PDF |
| GET | `/api/admin/timetables` | Get all timetables |
| GET | `/api/admin/timetables/:id` | Get specific timetable |
| PUT | `/api/admin/timetables/:id` | Update timetable |
| DELETE | `/api/admin/timetables/:id` | Delete timetable |

## Quick Start Examples

### Using cURL

#### Create Timetable
```bash
curl -X POST http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer your_jwt_token" \
  -F "title=Spring 2024 Timetable" \
  -F "specialty_id=1" \
  -F "file=@/path/to/timetable.pdf"
```

#### Get All Timetables
```bash
curl http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer your_jwt_token"
```

#### Get Specific Timetable
```bash
curl http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer your_jwt_token"
```

#### Update Timetable
```bash
curl -X PUT http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer your_jwt_token" \
  -F "title=Spring 2024 Updated" \
  -F "file=@/path/to/new-timetable.pdf"
```

#### Delete Timetable
```bash
curl -X DELETE http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer your_jwt_token"
```

### Using JavaScript/Fetch

```javascript
const token = localStorage.getItem('token');

// Create timetable
const formData = new FormData();
formData.append('title', 'Spring 2024 Timetable');
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
console.log(data);
```

## Frontend Integration

### React Component Example
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function TimetableManager() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const response = await axios.get('/api/admin/timetables', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTimetables(response.data.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const response = await axios.post('/api/admin/timetables', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert('Timetable uploaded successfully!');
        await fetchTimetables();
        e.target.reset();
      }
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Timetable Management</h2>
      
      <form onSubmit={handleUpload}>
        <input
          type="text"
          name="title"
          placeholder="Timetable Title"
          required
        />
        <select name="specialty_id" required>
          <option value="">Select Specialty</option>
          <option value="1">Mechatronics</option>
          <option value="2">Autotronics</option>
          <option value="3">Information Technology</option>
        </select>
        <input
          type="file"
          name="file"
          accept=".pdf"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Timetable'}
        </button>
      </form>

      <h3>Uploaded Timetables</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Specialty</th>
            <th>Uploaded By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map(tt => (
            <tr key={tt.id}>
              <td>{tt.title}</td>
              <td>{tt.Specialty?.specialty_name}</td>
              <td>{tt.createdByUser?.full_name}</td>
              <td>{new Date(tt.created_at).toLocaleDateString()}</td>
              <td>
                <a href={tt.file_url} download>Download</a>
                <button onClick={() => handleDelete(tt.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableManager;
```

## Error Handling

The system includes comprehensive error handling:

| Error | HTTP Status | Message |
|-------|------------|---------|
| Missing file | 400 | "PDF file is required" |
| Invalid file type | 400 | "Only PDF files are allowed" |
| File too large | 400 | "File is too large" (>5MB) |
| Invalid specialty | 400 | "Specialty not found" |
| Not found | 404 | "Timetable not found" |
| Unauthorized | 401 | "Unauthorized" |
| Server error | 500 | "Something went wrong!" |

## File Management

### File Storage
- **Location**: `server/uploads/timetables/`
- **Naming**: `{sanitized-title}-{timestamp}-{random}.pdf`
- **Size Limit**: 5MB
- **Format**: PDF only

### File Upload Flow
1. Multer validates file type and size
2. File is written to disk with unique name
3. Database record created with file reference
4. File URL stored for frontend access

### File Deletion
When a timetable is deleted:
1. File is removed from disk
2. Database record is deleted
3. Activity log is recorded

## Database Schema

```sql
CREATE TABLE timetables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    specialty_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_specialty (specialty_id),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);
```

## Model Relationships

```text
Timetable
├── belongsTo Specialty (specialty_id)
└── belongsTo User as createdByUser (created_by)

Specialty
└── hasMany Timetable

User
└── hasMany Timetable as timetablesCreated
```

## Activity Logging

All timetable operations are automatically logged:

```javascript
{
  user_id: <admin_id>,
  action: 'create|update|delete',
  entity_type: 'Timetable',
  entity_id: <timetable_id>,
  description: 'Created/Updated/Deleted timetable: <title>'
}
```

## Performance Considerations

1. **Database Indices**: Created on specialty_id, created_by, and created_at for fast queries
2. **File Limits**: 5MB max to prevent server overload
3. **Pagination**: Can be added in future for large datasets
4. **Caching**: Consider implementing for frequently accessed timetables

## Troubleshooting

### Upload Directory Issues
```bash
# If uploads directory doesn't exist, create manually:
mkdir -p server/uploads/timetables
chmod 755 server/uploads/timetables
```

### PDF Validation Failed
- Ensure file is a valid PDF
- Check file size (max 5MB)
- Verify MIME type is `application/pdf`

### Database Connection Issues
- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check database permissions

### File Not Deleting
- Check file system permissions
- Verify the file path exists
- Check for file locks (Windows)

## Testing

### Unit Testing
```javascript
// Example test case
describe('TimetableService', () => {
  it('should create a timetable', async () => {
    const timetable = await TimetableService.createTimetable(
      { title: 'Test', specialty_id: 1 },
      mockFile,
      1
    );
    expect(timetable.id).toBeDefined();
  });
});
```

### Integration Testing
```bash
# Manual testing with cURL (see examples above)
# Or use Postman collection
```

## Future Enhancements

1. **Batch Upload**: Upload multiple timetables at once
2. **Scheduling**: Automatic timetable distribution on specific dates
3. **Versioning**: Keep history of timetable changes
4. **Email Notifications**: Notify students of new timetables
5. **QR Code Integration**: Generate QR codes to access timetables
6. **Analytics**: Track timetable download statistics
7. **Caching**: Implement Redis caching for frequently accessed files
8. **Compression**: Automatically compress PDF files

## Deployment Checklist

- [ ] Verify database table exists
- [ ] Create `/uploads/timetables/` directory
- [ ] Set proper file permissions (755)
- [ ] Update environment variables
- [ ] Test all endpoints with valid credentials
- [ ] Verify CORS settings for frontend
- [ ] Check file size limits
- [ ] Test file upload with various PDF files
- [ ] Verify activity logging works
- [ ] Test deletion and file cleanup
- [ ] Set up backup strategy for uploads directory
- [ ] Monitor disk space for uploads

## Support & Maintenance

### Regular Maintenance
1. **Disk Cleanup**: Remove old unused timetable files
2. **Database Optimization**: Run OPTIMIZE TABLE on timetables
3. **Backup**: Regular backups of uploads directory
4. **Monitoring**: Track file upload errors and storage usage

### Common Tasks
- **Reset Timetables**: Delete all and re-upload
- **Migration**: Backup and restore timetables
- **Audit**: Check activity logs for changes

## References

- [Sequelize Documentation](https://sequelize.org/)
- [Multer Documentation](https://expressjs.com/en/resources/middleware/multer.html)
- [Express File Upload Best Practices](https://expressjs.com/)

---

**Implementation Date**: 2024
**Status**: Active
**Last Updated**: 2024-01-01

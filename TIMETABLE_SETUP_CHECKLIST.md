# Timetable Management System - Quick Setup Checklist

## ✅ Completed Implementation

### Backend Files
- [x] Model: `server/models/Timetable.js`
- [x] Controller: `server/controllers/timetableController.js`
- [x] Service: `server/services/timetableService.js`
- [x] Routes: `server/routes/timetableRoutes.js`
- [x] Database: Added Timetables table to `database/nctu_erp.sql`
- [x] Config: Updated `server/config/models.js` with Timetable model and associations
- [x] Server: Updated `server/server.js` to register timetable routes

### Documentation
- [x] API Documentation: `TIMETABLE_API.md`
- [x] Implementation Guide: `TIMETABLE_IMPLEMENTATION.md`
- [x] This Checklist: `TIMETABLE_SETUP_CHECKLIST.md`

---

## 🚀 Quick Start

### 1. Prerequisites Check
```bash
# Verify Node.js version (should be 14+)
node --version

# Verify npm packages are installed
npm list multer express sequelize
```

### 2. Database Setup
The table will be created automatically when the server starts, OR manually run:
```bash
# Option 1: Manual SQL execution
mysql -u root -p nctu_erp < database/nctu_erp.sql

# Option 2: Let Sequelize auto-sync on server start
# (already configured in server.js)
```

### 3. Create Upload Directory
```bash
# Windows
mkdir server\uploads\timetables

# Linux/Mac
mkdir -p server/uploads/timetables
chmod 755 server/uploads/timetables
```

### 4. Start Server
```bash
npm start
# or
npm run dev  # with nodemon
```

### 5. Verify Installation
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Response should be:
# {"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

---

## 🧪 Test Endpoints

### Get Sample JWT Token
First, log in and get your JWT token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### Create Test Timetable
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Spring 2024 Schedule" \
  -F "specialty_id=1" \
  -F "file=@path/to/test.pdf"
```

### List All Timetables
```bash
curl http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer $TOKEN"
```

### Get Specific Timetable
```bash
curl http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Timetable
```bash
curl -X PUT http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Spring 2024 Updated" \
  -F "file=@path/to/updated.pdf"
```

### Delete Timetable
```bash
curl -X DELETE http://localhost:5000/api/admin/timetables/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎨 Frontend Integration

### React Example
```jsx
import { useState } from 'react';

function TimetableUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [specialty, setSpecialty] = useState(1);

  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('specialty_id', specialty);
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/timetables', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert('Timetable uploaded successfully!');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
        <option value="1">Mechatronics</option>
        <option value="2">Autotronics</option>
        <option value="3">IT</option>
      </select>
      <input
        type="file"
        accept=".pdf"
        onChange={e => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Upload</button>
    </form>
  );
}

export default TimetableUpload;
```

---

## 🔍 Troubleshooting

### Issue: "File is required" Error
**Solution**: Make sure you're including the file in the form data
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);  // Don't forget this!
```

### Issue: "Only PDF files are allowed"
**Solution**: Ensure file is a valid PDF
```bash
# Check file type
file -i your_file.pdf
# Should output: application/pdf
```

### Issue: "Specialty not found"
**Solution**: Verify specialty_id exists in the database
```sql
SELECT * FROM specialties;
```

### Issue: 401 Unauthorized
**Solution**: Make sure you're sending valid JWT token
```bash
# Token must be in Authorization header
-H "Authorization: Bearer your_token_here"
```

### Issue: Upload directory doesn't exist
**Solution**: Create it manually
```bash
# Linux/Mac
mkdir -p server/uploads/timetables

# Windows
mkdir server\uploads\timetables
```

### Issue: CORS Error
**Solution**: Check CLIENT_URL in .env matches frontend URL
```
CLIENT_URL=http://localhost:5173  # for Vite frontend
```

---

## 📊 File Limits & Validation

| Property | Limit | Value |
|----------|-------|-------|
| File Type | PDF only | `.pdf` extension |
| Max Size | 5 MB | 5242880 bytes |
| MIME Type | PDF | `application/pdf` |
| Title Length | 3-255 chars | String |
| File Storage | `/uploads/timetables/` | Server disk |

---

## 🔐 Security Features Included

✅ JWT Authentication - All endpoints require valid token
✅ File Validation - Only PDF files allowed
✅ Size Limits - Maximum 5MB per file
✅ Input Validation - Title and specialty_id required
✅ CORS Protection - Configured for your frontend URL
✅ Rate Limiting - 100 requests per 15 minutes per IP
✅ SQL Injection Prevention - Sequelize parameterized queries
✅ Activity Logging - All operations logged
✅ File Cleanup - Deleted files removed from disk

---

## 📝 API Response Examples

### Success Response (201)
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

### Error Response (400)
```json
{
  "success": false,
  "message": "PDF file is required"
}
```

---

## 🎯 Next Steps

1. **Restart Server**
   ```bash
   npm start
   ```

2. **Test with Curl**
   ```bash
   # Use examples from Test Endpoints section above
   ```

3. **Integrate Frontend**
   - Use the React example as reference
   - Update your frontend components
   - Test with your actual admin panel

4. **Deploy**
   - Create uploads directory on production server
   - Set proper permissions (755)
   - Update environment variables
   - Test all endpoints
   - Set up backups

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `TIMETABLE_API.md` | Complete API reference with examples |
| `TIMETABLE_IMPLEMENTATION.md` | Implementation details and setup guide |
| `TIMETABLE_SETUP_CHECKLIST.md` | This file - Quick start guide |

---

## ✉️ Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation in `TIMETABLE_API.md`
3. Check server logs for errors
4. Verify all files are in correct locations

---

**Status**: ✅ Ready for Development
**Last Updated**: 2024-01-01
**Version**: 1.0.0

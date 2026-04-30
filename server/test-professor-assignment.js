const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let token = '';
let specialtyId = null;
let academicYearId = null;
let semesterId = null;
let courseId = null;
let professorId = null;

async function runTests() {
  try {
    console.log('🔍 Starting Professor Course Assignment Tests...\n');

    // Step 1: Login as Admin
    console.log('1️⃣ Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    token = loginRes.data.data.token;  // Token is in data.data.token
    console.log('✅ Login successful');
    if (token) {
      console.log(`   Token: ${token.substring(0, 20)}...`);
    } else {
      throw new Error('No token received from login');
    }

    // Set default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Step 2: Get Specialties
    console.log('\n2️⃣ Getting specialties...');
    const specialtiesRes = await axios.get(`${BASE_URL}/specialties`);
    if (specialtiesRes.data.data && specialtiesRes.data.data.length > 0) {
      specialtyId = specialtiesRes.data.data[0].id;
      console.log('✅ Specialty found');
      console.log(`   ID: ${specialtyId}, Code: ${specialtiesRes.data.data[0].code}, Name: ${specialtiesRes.data.data[0].name}`);
    } else {
      throw new Error('No specialties found in database');
    }

    // Step 3: Get or Create Academic Year
    console.log('\n3️⃣ Getting academic years...');
    try {
      const academicYearsRes = await axios.get(`${BASE_URL}/admin/academic-years`, {
        params: { specialty_id: specialtyId }
      });
      
      if (academicYearsRes.data.data && academicYearsRes.data.data.length > 0) {
        academicYearId = academicYearsRes.data.data[0].id;
        console.log('✅ Academic year found');
        console.log(`   ID: ${academicYearId}, Year: ${academicYearsRes.data.data[0].year_number}, Season: ${academicYearsRes.data.data[0].academic_season}`);
      } else {
        console.log('⚠️  No academic years found, creating one...');
        const createYearRes = await axios.post(`${BASE_URL}/admin/academic-years`, {
          specialty_id: specialtyId,
          year_number: 1,
          academic_season: '2024-2025',
          is_active: true
        });
        academicYearId = createYearRes.data.data.id;
        console.log('✅ Academic year created');
        console.log(`   ID: ${academicYearId}`);
      }
    } catch (error) {
      console.error('❌ Error with academic years:', error.response?.data || error.message);
      throw error;
    }

    // Step 4: Get or Create Semester
    console.log('\n4️⃣ Getting semesters...');
    try {
      const semestersRes = await axios.get(`${BASE_URL}/admin/semesters`, {
        params: { academic_year_id: academicYearId }
      });
      
      if (semestersRes.data.data && semestersRes.data.data.length > 0) {
        semesterId = semestersRes.data.data[0].id;
        console.log('✅ Semester found');
        console.log(`   ID: ${semesterId}, Name: ${semestersRes.data.data[0].semester_name}`);
      } else {
        console.log('⚠️  No semesters found, creating one...');
        const createSemesterRes = await axios.post(`${BASE_URL}/admin/semesters`, {
          academic_year_id: academicYearId,
          semester_name: 'Fall',
          start_date: '2024-09-01',
          end_date: '2025-01-31',
          is_active: true
        });
        semesterId = createSemesterRes.data.data.id;
        console.log('✅ Semester created');
        console.log(`   ID: ${semesterId}`);
      }
    } catch (error) {
      console.error('❌ Error with semesters:', error.response?.data || error.message);
      throw error;
    }

    // Step 5: Create Course
    console.log('\n5️⃣ Creating test course...');
    try {
      const createCourseRes = await axios.post(`${BASE_URL}/admin/courses`, {
        specialty_id: specialtyId,
        academic_year_id: academicYearId,
        semester_id: semesterId,
        course_code: `TEST-${Date.now()}`,
        course_name: 'Test Course for Assignment',
        arabic_name: 'مادة اختبار للتعيين',
        credit_hours: 3
      });
      courseId = createCourseRes.data.data.id;
      console.log('✅ Course created');
      console.log(`   ID: ${courseId}, Code: ${createCourseRes.data.data.course_code}, Name: ${createCourseRes.data.data.course_name}`);
    } catch (error) {
      console.error('❌ Error creating course:', error.response?.data || error.message);
      throw error;
    }

    // Step 6: Create Professor
    console.log('\n6️⃣ Creating test professor...');
    try {
      const createProfRes = await axios.post(`${BASE_URL}/admin/professors`, {
        username: `prof_test_${Date.now()}`,
        email: `prof.test.${Date.now()}@nctu.edu`,
        password: 'prof123',
        full_name: 'Dr. Test Professor',
        phone: '+201234567890',  // Valid Egyptian mobile format
        department: 'Computer Science',
        specialization: 'Software Engineering'
      });
      professorId = createProfRes.data.data.id;
      console.log('✅ Professor created');
      console.log(`   ID: ${professorId}, Code: ${createProfRes.data.data.professor_code}`);
      if (createProfRes.data.data.User) {
        console.log(`   Name: ${createProfRes.data.data.User.full_name}`);
      }
    } catch (error) {
      console.error('❌ Error creating professor:', error.response?.data || error.message);
      throw error;
    }

    // Step 7: Assign Course to Professor
    console.log('\n7️⃣ Assigning course to professor...');
    console.log(`   Endpoint: POST ${BASE_URL}/admin/professors/${professorId}/courses`);
    console.log(`   Body: {`);
    console.log(`     course_id: ${courseId},`);
    console.log(`     academic_year_id: ${academicYearId},`);
    console.log(`     semester_id: ${semesterId},`);
    console.log(`     is_primary: true`);
    console.log(`   }`);
    
    try {
      const assignRes = await axios.post(`${BASE_URL}/admin/professors/${professorId}/courses`, {
        course_id: courseId,
        academic_year_id: academicYearId,
        semester_id: semesterId,
        is_primary: true
      });
      console.log('✅ Course assigned successfully!');
      console.log(`   Assignment ID: ${assignRes.data.data.id}`);
      console.log(`   Response:`, JSON.stringify(assignRes.data, null, 2));
    } catch (error) {
      console.error('❌ Error assigning course:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.response?.data?.message || error.message}`);
      console.error(`   Errors:`, error.response?.data?.errors || 'None');
      console.error(`   Full response:`, JSON.stringify(error.response?.data, null, 2));
      throw error;
    }

    // Step 8: Verify Assignment
    console.log('\n8️⃣ Verifying assignment...');
    try {
      const getProfRes = await axios.get(`${BASE_URL}/admin/professors/${professorId}`);
      console.log('✅ Professor details retrieved');
      console.log(`   Assigned Courses: ${getProfRes.data.data.ProfessorCourses?.length || 0}`);
      if (getProfRes.data.data.ProfessorCourses && getProfRes.data.data.ProfessorCourses.length > 0) {
        console.log(`   Course Details:`, JSON.stringify(getProfRes.data.data.ProfessorCourses[0], null, 2));
      }
    } catch (error) {
      console.error('❌ Error verifying assignment:', error.response?.data || error.message);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Specialty ID: ${specialtyId}`);
    console.log(`   Academic Year ID: ${academicYearId}`);
    console.log(`   Semester ID: ${semesterId}`);
    console.log(`   Course ID: ${courseId}`);
    console.log(`   Professor ID: ${professorId}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();

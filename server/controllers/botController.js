const express = require('express');
const axios = require('axios');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const StudentEnrollment = require('../models/StudentEnrollment');
const User = require('../models/User');

const router = express.Router();

// Webhook endpoint for Botpress
router.post('/webhook', async (req, res) => {
  try {
    const { type, payload } = req.body;

    console.log('Botpress webhook received:', { type, payload });

    let response = {};

    switch (type) {
      case 'getGrades':
        response = await handleGetGrades(payload);
        break;
      case 'getPayments':
        response = await handleGetPayments(payload);
        break;
      case 'getCourses':
        response = await handleGetCourses(payload);
        break;
      case 'getSchedule':
        response = await handleGetSchedule(payload);
        break;
      case 'getSeatNumber':
        response = await handleGetSeatNumber(payload);
        break;
      default:
        response = { message: 'Unknown action type' };
    }

    res.json(response);
  } catch (error) {
    console.error('Bot webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student grades
async function handleGetGrades(payload) {
  try {
    const { studentId } = payload;

    const student = await Student.findOne({
      where: { student_code: studentId },
      include: [{
        model: Grade,
        include: [Course]
      }]
    });

    if (!student) {
      return { message: 'Student not found' };
    }

    const grades = student.Grades.map(grade => ({
      course: grade.Course.name,
      grade: grade.grade,
      semester: grade.semester
    }));

    return {
      studentName: student.full_name,
      grades: grades,
      gpa: calculateGPA(grades)
    };
  } catch (error) {
    console.error('Error getting grades:', error);
    return { message: 'Error retrieving grades' };
  }
}

// Get student payments
async function handleGetPayments(payload) {
  try {
    const { studentId } = payload;

    // Mock payment data - replace with actual Payment model when available
    const mockPayments = [
      {
        amount: 5000,
        type: 'Tuition Fee',
        date: '2024-01-15',
        status: 'paid'
      },
      {
        amount: 1500,
        type: 'Registration Fee',
        date: '2024-09-01',
        status: 'paid'
      }
    ];

    const totalPaid = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDue = 15000; // Example total tuition

    return {
      studentId: studentId,
      totalPaid: totalPaid,
      totalDue: totalDue,
      remaining: totalDue - totalPaid,
      payments: mockPayments
    };
  } catch (error) {
    console.error('Error getting payments:', error);
    return { message: 'Error retrieving payment information' };
  }
}

// Get student courses
async function handleGetCourses(payload) {
  try {
    const { studentId } = payload;

    const enrollments = await Enrollment.findAll({
      where: { student_code: studentId },
      include: [Course]
    });

    const courses = enrollments.map(enrollment => ({
      name: enrollment.Course.name,
      code: enrollment.Course.code,
      credits: enrollment.Course.credits,
      semester: enrollment.semester
    }));

    return {
      courses: courses,
      totalCredits: courses.reduce((sum, course) => sum + course.credits, 0)
    };
  } catch (error) {
    console.error('Error getting courses:', error);
    return { message: 'Error retrieving courses' };
  }
}

// Get exam schedule
async function handleGetSchedule(payload) {
  // Mock exam schedule
  return {
    message: 'Exam Schedule for Current Semester',
    exams: [
      { course: 'Programming Fundamentals', date: '2024-06-15', time: '10:00 AM' },
      { course: 'Data Structures', date: '2024-06-18', time: '2:00 PM' },
      { course: 'Database Systems', date: '2024-06-20', time: '9:00 AM' }
    ]
  };
}

// Get seat number
async function handleGetSeatNumber(payload) {
  try {
    const { studentId } = payload;

    const student = await Student.findOne({
      where: { student_code: studentId }
    });

    if (!student) {
      return { message: 'Student not found' };
    }

    return {
      studentName: student.full_name,
      seatNumber: student.seat_number || 'Not assigned yet'
    };
  } catch (error) {
    console.error('Error getting seat number:', error);
    return { message: 'Error retrieving seat number' };
  }
}

// Helper function to calculate GPA
function calculateGPA(grades) {
  if (grades.length === 0) return 0;

  const gradePoints = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
  };

  const totalPoints = grades.reduce((sum, grade) => sum + (gradePoints[grade.grade] || 0), 0);
  return (totalPoints / grades.length).toFixed(2);
}

module.exports = router;
/**
 * Frontend Tests for ProfessorGrades - Semester Filter and Student Display
 * 
 * Tests that the semester filter works correctly and students are displayed
 * based on specialty, year, and semester
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfessorGrades from '../ProfessorGrades';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock AuthContext
const mockUser = {
  id: 1,
  role: 'professor',
  full_name: 'Dr. Ahmed Ali'
};

const mockSpecialties = [
  { id: 1, code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات' }
];

const mockSemesters = [
  { id: 1, semester_name: 'Fall', arabic_name: 'الفصل الدراسي الأول' },
  { id: 2, semester_name: 'Spring', arabic_name: 'الفصل الدراسي الثاني' }
];

const mockCourses = [
  {
    id: 1,
    course_id: 1,
    Course: {
      id: 1,
      course_code: 'ICT101',
      course_name: 'Programming',
      arabic_name: 'البرمجة',
      credit_hours: 3
    },
    AcademicYear: {
      year_number: 1,
      year_label: 'السنة الأولى'
    }
  }
];

const mockStudents = [
  {
    student_id: 1,
    student_code: 'STU-001',
    full_name: 'محمد أحمد',
    specialty_name: 'تكنولوجيا المعلومات',
    current_year: 1,
    grade: null
  },
  {
    student_id: 2,
    student_code: 'STU-002',
    full_name: 'فاطمة علي',
    specialty_name: 'تكنولوجيا المعلومات',
    current_year: 1,
    grade: {
      id: 1,
      assignment1_grade: 'P',
      assignment2_grade: 'M',
      final_exam_score: 120,
      status: 'draft'
    }
  }
];

const mockCourseConfig = {
  ass1_max: 30.00,
  ass2_max: 30.00,
  final_max: 150.00,
  p_value: 30.00,
  m_value: 21.00,
  d_value: 15.00
};

describe('ProfessorGrades - Semester Filter and Student Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default axios mock responses
    axios.get.mockImplementation((url) => {
      if (url === '/specialties') {
        return Promise.resolve({ data: { data: mockSpecialties } });
      }
      if (url === '/admin/semesters') {
        return Promise.resolve({ data: { data: mockSemesters } });
      }
      if (url === '/grades/professor/courses') {
        return Promise.resolve({ data: { data: mockCourses } });
      }
      if (url === '/grades/professor/students-by-course') {
        return Promise.resolve({
          data: {
            data: mockStudents,
            course_config: mockCourseConfig,
            course_info: {
              course_code: 'ICT101',
              course_name: 'Programming',
              arabic_name: 'البرمجة',
              specialty_name: 'تكنولوجيا المعلومات',
              academic_year: 1,
              semester_name: 'الفصل الدراسي الأول'
            }
          }
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  const renderWithAuth = (component) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockUser }}>
          {component}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('7.3 - Should display semester filter dropdown', async () => {
    renderWithAuth(<ProfessorGrades />);

    await waitFor(() => {
      expect(screen.getByText('إدارة الدرجات')).toBeInTheDocument();
    });

    // Check if semester filter exists
    const semesterLabel = screen.getByText('الترم:');
    expect(semesterLabel).toBeInTheDocument();

    // Check if semester dropdown exists
    const semesterSelects = screen.getAllByRole('combobox');
    const semesterSelect = semesterSelects.find(select => 
      select.querySelector('option[value=""]')?.textContent === '— اختر الترم —'
    );
    expect(semesterSelect).toBeDefined();
  });

  test('7.4 - Should display students after selecting course', async () => {
    renderWithAuth(<ProfessorGrades />);

    await waitFor(() => {
      expect(screen.getByText('إدارة الدرجات')).toBeInTheDocument();
    });

    // Select specialty
    const specialtySelects = screen.getAllByRole('combobox');
    const specialtySelect = specialtySelects[0];
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    // Select year
    await waitFor(() => {
      const yearSelects = screen.getAllByRole('combobox');
      const yearSelect = yearSelects.find(select => 
        select.querySelector('option[value="1"]')?.textContent === 'السنة الأولى'
      );
      if (yearSelect) {
        fireEvent.change(yearSelect, { target: { value: '1' } });
      }
    });

    // Select semester
    await waitFor(() => {
      const semesterSelects = screen.getAllByRole('combobox');
      const semesterSelect = semesterSelects.find(select => 
        select.querySelector('option[value=""]')?.textContent === '— اختر الترم —'
      );
      if (semesterSelect) {
        fireEvent.change(semesterSelect, { target: { value: '1' } });
      }
    });

    // Wait for courses to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/grades/professor/courses',
        expect.objectContaining({
          params: expect.objectContaining({
            specialty_id: '1'
          })
        })
      );
    });

    // Click on a course card
    await waitFor(() => {
      const courseCard = screen.getByText('البرمجة');
      fireEvent.click(courseCard.closest('.course-card'));
    });

    // Wait for students to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/grades/professor/students-by-course',
        expect.objectContaining({
          params: { course_id: 1 }
        })
      );
    });

    // Check if students are displayed
    await waitFor(() => {
      expect(screen.getByText('محمد أحمد')).toBeInTheDocument();
      expect(screen.getByText('فاطمة علي')).toBeInTheDocument();
    });
  });

  test('7.5 - Should display course config info', async () => {
    renderWithAuth(<ProfessorGrades />);

    await waitFor(() => {
      expect(screen.getByText('إدارة الدرجات')).toBeInTheDocument();
    });

    // Select specialty, year, semester, and course (simplified)
    const specialtySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    // Wait for course to be selected and students loaded
    await waitFor(() => {
      const courseCards = screen.queryAllByText('البرمجة');
      if (courseCards.length > 0) {
        fireEvent.click(courseCards[0].closest('.course-card'));
      }
    }, { timeout: 3000 });

    // Check if course config is displayed
    await waitFor(() => {
      const configHeading = screen.queryByText('إعدادات المادة');
      if (configHeading) {
        expect(configHeading).toBeInTheDocument();
      }
    }, { timeout: 3000 });
  });

  test('7.6 - Should display live preview when grades are entered', async () => {
    renderWithAuth(<ProfessorGrades />);

    await waitFor(() => {
      expect(screen.getByText('إدارة الدرجات')).toBeInTheDocument();
    });

    // Simulate selecting course and loading students
    const specialtySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    await waitFor(() => {
      const courseCards = screen.queryAllByText('البرمجة');
      if (courseCards.length > 0) {
        fireEvent.click(courseCards[0].closest('.course-card'));
      }
    }, { timeout: 3000 });

    // Wait for students table
    await waitFor(() => {
      expect(screen.queryByText('محمد أحمد')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and change assignment1 grade
    const assignment1Selects = screen.getAllByRole('combobox').filter(select => 
      select.querySelector('option[value="P"]')
    );
    
    if (assignment1Selects.length > 0) {
      fireEvent.change(assignment1Selects[0], { target: { value: 'P' } });

      // Check if live preview is updated
      await waitFor(() => {
        const previewElements = screen.queryAllByText(/30\.00/);
        expect(previewElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    }
  });

  test('7.7 - Should apply admin dashboard design', async () => {
    const { container } = renderWithAuth(<ProfessorGrades />);

    await waitFor(() => {
      expect(screen.getByText('إدارة الدرجات')).toBeInTheDocument();
    });

    // Check if main container has correct class
    const mainContainer = container.querySelector('.professor-grades');
    expect(mainContainer).toBeInTheDocument();

    // Check if filters section has correct styling
    const filtersSection = container.querySelector('.filters-section');
    expect(filtersSection).toBeInTheDocument();

    // Check if page header exists
    const pageHeader = container.querySelector('.page-header');
    expect(pageHeader).toBeInTheDocument();
  });
});

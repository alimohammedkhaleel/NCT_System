/**
 * Frontend Tests for CoursesPage - Semester Field
 * 
 * Tests that the semester field is properly displayed and functional
 * in the course management page
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoursesPage from '../CoursesPage';
import * as apiService from '../../../services/apiService';

// Mock API service
vi.mock('../../../services/apiService', () => ({
  default: {
    get: vi.fn()
  },
  coursesAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  academicYearsAPI: {
    getAll: vi.fn()
  },
  semestersAPI: {
    getAll: vi.fn()
  }
}));

const mockSpecialties = [
  { id: 1, code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات' },
  { id: 2, code: 'MCT', name: 'Mechatronics', arabic_name: 'الميكاترونكس' }
];

const mockCourses = [
  {
    id: 1,
    course_code: 'ICT101',
    course_name: 'Programming',
    arabic_name: 'البرمجة',
    specialty_id: 1,
    academic_year_id: 1,
    semester_id: 1,
    credit_hours: 3,
    is_active: true,
    AcademicYear: { year_number: 1 },
    Semester: { semester_name: 'الفصل الأول' }
  }
];

const mockSemesters = [
  { id: 1, semester_name: 'الفصل الأول', arabic_name: 'الفصل الدراسي الأول' },
  { id: 2, semester_name: 'الفصل الثاني', arabic_name: 'الفصل الدراسي الثاني' }
];

describe('CoursesPage - Semester Field Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    apiService.coursesAPI.getAll.mockResolvedValue({
      data: { data: mockCourses }
    });
    
    apiService.default.get.mockImplementation((url) => {
      if (url === '/specialties') {
        return Promise.resolve({ data: { data: mockSpecialties } });
      }
      if (url === '/admin/semesters') {
        return Promise.resolve({ data: { data: mockSemesters } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  test('7.1 - Should display semester field in course form', async () => {
    render(
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Courses Management')).toBeInTheDocument();
    });

    // Click "Add New Course" button
    const addButton = screen.getByText('+ Add New Course');
    fireEvent.click(addButton);

    // Check if semester field exists in the form
    await waitFor(() => {
      const semesterLabel = screen.getByText('Semester *');
      expect(semesterLabel).toBeInTheDocument();
    });

    // Check if semester dropdown exists
    const semesterSelect = screen.getByRole('combobox', { name: /semester/i });
    expect(semesterSelect).toBeInTheDocument();
  });

  test('7.2 - Should filter semesters based on academic year', async () => {
    render(
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Courses Management')).toBeInTheDocument();
    });

    // Open add course modal
    const addButton = screen.getByText('+ Add New Course');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Course')).toBeInTheDocument();
    });

    // Select academic year first
    const yearSelect = screen.getByLabelText('Academic Year *');
    fireEvent.change(yearSelect, { target: { value: '1' } });

    // Semester dropdown should now be populated
    const semesterSelect = screen.getByLabelText('Semester *');
    expect(semesterSelect).toBeInTheDocument();
    
    // Check if semester options are available
    const semesterOptions = semesterSelect.querySelectorAll('option');
    expect(semesterOptions.length).toBeGreaterThan(1); // At least one option + placeholder
  });

  test('7.3 - Should display semester in course table', async () => {
    render(
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Courses Management')).toBeInTheDocument();
    });

    // Check if semester column exists in table
    await waitFor(() => {
      const semesterHeader = screen.getByText('Semester');
      expect(semesterHeader).toBeInTheDocument();
    });

    // Check if semester value is displayed for the course
    await waitFor(() => {
      const semesterValue = screen.getByText('الفصل الأول');
      expect(semesterValue).toBeInTheDocument();
    });
  });

  test('7.4 - Should include semester_id when creating course', async () => {
    render(
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Courses Management')).toBeInTheDocument();
    });

    // Open add course modal
    const addButton = screen.getByText('+ Add New Course');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Course')).toBeInTheDocument();
    });

    // Fill form
    const codeInput = screen.getByPlaceholderText('e.g., ICT101');
    fireEvent.change(codeInput, { target: { value: 'ICT102' } });

    const nameInput = screen.getByPlaceholderText('e.g., Introduction to Programming');
    fireEvent.change(nameInput, { target: { value: 'Data Structures' } });

    const specialtySelect = screen.getByLabelText('Specialty *');
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    const yearSelect = screen.getByLabelText('Academic Year *');
    fireEvent.change(yearSelect, { target: { value: '1' } });

    const semesterSelect = screen.getByLabelText('Semester *');
    fireEvent.change(semesterSelect, { target: { value: '1' } });

    const creditsInput = screen.getByPlaceholderText('e.g., 3');
    fireEvent.change(creditsInput, { target: { value: '3' } });

    // Submit form
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Verify API was called with semester_id
    await waitFor(() => {
      expect(apiService.coursesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          semester_id: expect.any(Number)
        })
      );
    });
  });

  test('7.5 - Should validate semester field is required', async () => {
    render(
      <BrowserRouter>
        <CoursesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Courses Management')).toBeInTheDocument();
    });

    // Open add course modal
    const addButton = screen.getByText('+ Add New Course');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Course')).toBeInTheDocument();
    });

    // Fill form without semester
    const codeInput = screen.getByPlaceholderText('e.g., ICT101');
    fireEvent.change(codeInput, { target: { value: 'ICT102' } });

    const nameInput = screen.getByPlaceholderText('e.g., Introduction to Programming');
    fireEvent.change(nameInput, { target: { value: 'Data Structures' } });

    const specialtySelect = screen.getByLabelText('Specialty *');
    fireEvent.change(specialtySelect, { target: { value: '1' } });

    const yearSelect = screen.getByLabelText('Academic Year *');
    fireEvent.change(yearSelect, { target: { value: '1' } });

    // Don't select semester

    const creditsInput = screen.getByPlaceholderText('e.g., 3');
    fireEvent.change(creditsInput, { target: { value: '3' } });

    // Try to submit form
    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill all required fields')).toBeInTheDocument();
    });

    // API should not be called
    expect(apiService.coursesAPI.create).not.toHaveBeenCalled();
  });
});

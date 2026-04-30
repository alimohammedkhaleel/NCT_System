/**
 * Student Dashboard Preservation Tests
 * 
 * These tests verify that non-affected features continue to work correctly
 * after implementing the four bug fixes. They should PASS on UNFIXED code.
 * 
 * Test Strategy: Observation-first methodology
 * 1. Observe current behavior on unfixed code
 * 2. Write tests that capture that behavior
 * 3. Verify tests PASS on unfixed code (baseline)
 * 4. After fixes, verify tests still PASS (no regressions)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import StudentDashboard from '../StudentDashboard';
import api from '../../../services/apiService';

// Mock dependencies
vi.mock('../../../services/apiService');
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, loading: false })
}));
vi.mock('../../../components/navComponent/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));
vi.mock('../../../components/BranchSelectionModal/BranchSelectionModal', () => ({
  default: () => <div data-testid="branch-modal">Branch Modal</div>
}));

// Helper to create standard profile mock
const mockProfileResponse = () => ({
  data: {
    data: {
      role: 'student',
      full_name: 'Test Student',
      student: {
        student_code: 'S12345',
        current_year: 2,
        specialty: { code: 'CS', name: 'Computer Science' }
      }
    }
  }
});

// Helper to render component with router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// GPA classification helper (matches implementation)
const getGPAClassification = (gpa) => {
  const g = parseFloat(gpa) || 0;
  if (g >= 3.7) return { label: 'امتياز', cls: 'badge-green' };
  if (g >= 3.0) return { label: 'جيد جداً', cls: 'badge-blue' };
  if (g >= 2.0) return { label: 'جيد', cls: 'badge-yellow' };
  if (g >= 1.5) return { label: 'مقبول', cls: 'badge-orange' };
  return { label: 'ضعيف', cls: 'badge-red' };
};

describe('Task 2.1: Grades Tab Preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up any existing DOM
    document.body.innerHTML = '';
  });

  /**
   * Property 2.1.1: Payment-Required Logic Preservation
   * 
   * Validates: Requirement 3.1 (Grades functionality must remain unchanged)
   * 
   * When grades are blocked due to unpaid fees (403 with payment_required),
   * the system displays a special payment-required UI with:
   * - Lock icon
   * - Appropriate title based on has_invoices flag
   * - Payment details (total invoiced, paid, due)
   * - Hint message
   */
  it('Property 2.1.1: Payment-required logic displays correctly with invoices', async () => {
    const paymentData = {
      has_invoices: true,
      total_invoiced: 10000,
      total_paid: 3000,
      message: 'يجب دفع المصاريف لعرض الدرجات'
    };

    // Mock dashboard data
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345',
                email: 'test@example.com',
                specialty_name: 'Computer Science',
                current_year: 2,
                academic_status: 'Active'
              },
              summary: {
                gpa: 3.5,
                enrolled_courses: 6,
                approved_grades: 24
              }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        // Simulate payment-required error
        return Promise.reject({
          response: {
            status: 403,
            data: {
              payment_required: true,
              message: paymentData.message,
              data: {
                has_invoices: paymentData.has_invoices,
                total_invoiced: paymentData.total_invoiced,
                total_paid: paymentData.total_paid,
                total_due: paymentData.total_invoiced - paymentData.total_paid
              }
            }
          }
        });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Wait for payment-required UI to appear
    await waitFor(() => {
      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    // Verify payment-required message is displayed
    expect(screen.getByText(paymentData.message)).toBeInTheDocument();

    // Verify payment details are shown
    await waitFor(() => {
      expect(screen.getByText('إجمالي المصاريف:')).toBeInTheDocument();
      expect(screen.getByText('المدفوع:')).toBeInTheDocument();
      expect(screen.getByText('المتبقي:')).toBeInTheDocument();
    });

    // Verify amounts are displayed correctly
    const totalDue = paymentData.total_invoiced - paymentData.total_paid;
    expect(screen.getByText(new RegExp(paymentData.total_invoiced.toLocaleString('ar-EG')))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(paymentData.total_paid.toLocaleString('ar-EG')))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(totalDue.toLocaleString('ar-EG')))).toBeInTheDocument();

    // Verify hint message is shown
    expect(screen.getByText('يرجى مراجعة قسم المالية لسداد المصاريف')).toBeInTheDocument();
  });

  /**
   * Property 2.1.2: Semester Summary Cards Preservation
   * 
   * Validates: Requirement 3.1 (Grades functionality must remain unchanged)
   * 
   * When grades are available, semester summary cards display:
   * - Average percentage for Fall/Spring semesters
   * - Course count for each semester
   * - Appropriate icons and labels
   */
  it('Property 2.1.2: Semester summary cards calculate and display correctly', async () => {
    const grades = [
      {
        course_name: 'Math 101',
        semester: 'الفصل الأول',
        academic_year: '2023-2024',
        total_percentage: 85.5,
        assignment1_grade: 18,
        assignment2_grade: 17,
        final_exam_score: 52,
        total_score: 87,
        letter_grade: 'A',
        final_result: 'pass'
      },
      {
        course_name: 'Physics 101',
        semester: 'الفصل الأول',
        academic_year: '2023-2024',
        total_percentage: 78.3,
        assignment1_grade: 16,
        assignment2_grade: 15,
        final_exam_score: 48,
        total_score: 79,
        letter_grade: 'B',
        final_result: 'pass'
      },
      {
        course_name: 'Chemistry 101',
        semester: 'الفصل الثاني',
        academic_year: '2023-2024',
        total_percentage: 92.0,
        assignment1_grade: 20,
        assignment2_grade: 19,
        final_exam_score: 58,
        total_score: 97,
        letter_grade: 'A',
        final_result: 'pass'
      }
    ];

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345',
                specialty_name: 'Computer Science',
                current_year: 2
              },
              summary: { gpa: 3.5, enrolled_courses: 6, approved_grades: grades.length }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        return Promise.resolve({ data: { data: grades } });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    // Wait for grades to load
    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Calculate expected semester averages
    const sem1Grades = grades.filter(g => g.semester?.includes('الأول'));
    const sem2Grades = grades.filter(g => g.semester?.includes('الثاني'));
    
    const sem1Avg = (sem1Grades.reduce((s, g) => s + g.total_percentage, 0) / sem1Grades.length).toFixed(1);
    const sem2Avg = (sem2Grades.reduce((s, g) => s + g.total_percentage, 0) / sem2Grades.length).toFixed(1);

    // Verify semester 1 summary card
    await waitFor(() => {
      expect(screen.getByText('نتيجة الترم الأول')).toBeInTheDocument();
      expect(screen.getByText(`${sem1Avg}%`)).toBeInTheDocument();
      expect(screen.getByText(`${sem1Grades.length} مادة`)).toBeInTheDocument();
    });

    // Verify semester 2 summary card
    await waitFor(() => {
      expect(screen.getByText('نتيجة الترم الثاني')).toBeInTheDocument();
      expect(screen.getByText(`${sem2Avg}%`)).toBeInTheDocument();
      expect(screen.getByText(`${sem2Grades.length} مادة`)).toBeInTheDocument();
    });
  }, 10000);

  /**
   * Property 2.1.3: Grade Display and Grouping Preservation
   * 
   * Validates: Requirement 3.1 (Grades functionality must remain unchanged)
   * 
   * Grades are grouped by academic year and semester, displaying:
   * - Course name, assignment grades, final exam, total score
   * - Percentage, letter grade, final result
   * - Proper styling for pass/fail results
   */
  it('Property 2.1.3: Grades display correctly grouped by year and semester', async () => {
    const grades = [
      {
        course_name: 'Database Systems',
        semester: 'الفصل الأول',
        academic_year: '2023-2024',
        assignment1_grade: 18,
        assignment2_grade: 17,
        final_exam_score: 55,
        total_score: 90,
        total_percentage: 90.0,
        letter_grade: 'A',
        final_result: 'pass'
      },
      {
        course_name: 'Web Development',
        semester: 'الفصل الثاني',
        academic_year: '2023-2024',
        assignment1_grade: 16,
        assignment2_grade: 18,
        final_exam_score: 50,
        total_score: 84,
        total_percentage: 84.0,
        letter_grade: 'B',
        final_result: 'pass'
      }
    ];

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        return Promise.resolve({ data: { data: grades } });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Verify table headers are present
    await waitFor(() => {
      const headers = screen.getAllByText('المادة');
      expect(headers.length).toBeGreaterThan(0);
      expect(screen.getAllByText('أعمال 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('أعمال 2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('نهائي').length).toBeGreaterThan(0);
      expect(screen.getAllByText('المجموع').length).toBeGreaterThan(0);
      expect(screen.getAllByText('النسبة %').length).toBeGreaterThan(0);
      expect(screen.getAllByText('التقدير').length).toBeGreaterThan(0);
      expect(screen.getAllByText('النتيجة').length).toBeGreaterThan(0);
    });

    // Verify each grade is displayed
    for (const grade of grades) {
      await waitFor(() => {
        expect(screen.getByText(grade.course_name)).toBeInTheDocument();
      });
    }

    // Verify academic year grouping header
    await waitFor(() => {
      expect(screen.getByText('العام الدراسي: 2023-2024')).toBeInTheDocument();
    });
  }, 10000);

  /**
   * Property 2.1.4: GPA Classification Badge Preservation
   * 
   * Validates: Requirement 3.1 (Grades functionality must remain unchanged)
   * 
   * GPA classification badges display correctly based on GPA value:
   * - >= 3.7: امتياز (badge-green)
   * - >= 3.0: جيد جداً (badge-blue)
   * - >= 2.0: جيد (badge-yellow)
   * - >= 1.5: مقبول (badge-orange)
   * - < 1.5: ضعيف (badge-red)
   */
  it('Property 2.1.4: GPA classification badge displays correctly for امتياز', async () => {
    const gpa = 3.8;

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: {
                gpa: gpa,
                enrolled_courses: 6,
                approved_grades: 24
              }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Get expected classification
    const classification = getGPAClassification(gpa);

    // Verify GPA is displayed
    await waitFor(() => {
      expect(screen.getByText(gpa.toFixed(2))).toBeInTheDocument();
    });

    // Verify classification badge is displayed
    await waitFor(() => {
      expect(screen.getByText(classification.label)).toBeInTheDocument();
    });

    // Verify badge has correct CSS class
    const badge = screen.getByText(classification.label);
    expect(badge.className).toContain(classification.cls);
  });

  it('Property 2.1.4: GPA classification badge displays correctly for جيد جداً', async () => {
    const gpa = 3.2;

    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: { full_name: 'Test Student', student_code: 'S12345' },
              summary: { gpa: gpa, enrolled_courses: 6, approved_grades: 24 }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    const classification = getGPAClassification(gpa);
    await waitFor(() => {
      expect(screen.getByText(classification.label)).toBeInTheDocument();
    });
    const badge = screen.getByText(classification.label);
    expect(badge.className).toContain(classification.cls);
  });

  /**
   * Property 2.1.5: Empty Grades State Preservation
   * 
   * Validates: Requirement 3.1 (Grades functionality must remain unchanged)
   * 
   * When no grades are available, the system displays:
   * - "لا توجد درجات معتمدة حتى الآن" message
   */
  it('Property 2.1.5: Empty grades state displays correctly', async () => {
    // Mock API responses with empty grades
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 0, enrolled_courses: 0, approved_grades: 0 }
            }
          }
        });
      }
      if (url === '/grades/student/grades') {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Verify empty state message
    await waitFor(() => {
      expect(screen.getByText('لا توجد درجات معتمدة حتى الآن')).toBeInTheDocument();
    });
  });
});

describe('Task 2.2: Invoices Tab Preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  /**
   * Property 2.2.1: Invoice Summary Cards Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * When invoices are loaded, the system displays three summary cards:
   * - إجمالي الفواتير (Total Invoiced)
   * - المدفوع (Total Paid)
   * - المتبقي (Total Due)
   * 
   * Each card displays the amount in Egyptian Pounds (ج.م)
   */
  it('Property 2.2.1: Invoice summary cards display correctly', async () => {
    const invoiceData = {
      total_invoiced: 15000,
      total_paid: 8000,
      total_due: 7000,
      invoices: []
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for invoice data to load
    await waitFor(() => {
      expect(screen.getByText('إجمالي الفواتير')).toBeInTheDocument();
    });

    // Verify summary cards display correct values
    expect(screen.getByText(`${invoiceData.total_invoiced} ج.م`)).toBeInTheDocument();
    expect(screen.getByText(`${invoiceData.total_paid} ج.م`)).toBeInTheDocument();
    expect(screen.getByText(`${invoiceData.total_due} ج.م`)).toBeInTheDocument();

    // Verify card labels
    expect(screen.getByText('المدفوع')).toBeInTheDocument();
    expect(screen.getByText('المتبقي')).toBeInTheDocument();
  });

  /**
   * Property 2.2.2: Invoice Table Display Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * When invoices exist, the system displays a table with columns:
   * - رقم الفاتورة (Invoice Number)
   * - المبلغ الكلي (Total Amount)
   * - المدفوع (Paid Amount)
   * - الحالة (Status)
   * - تاريخ الاستحقاق (Due Date)
   */
  it('Property 2.2.2: Invoice table displays all columns correctly', async () => {
    const invoiceData = {
      total_invoiced: 15000,
      total_paid: 8000,
      total_due: 7000,
      invoices: [
        {
          invoice_number: 'INV-2024-001',
          total_amount: 5000,
          paid_amount: 5000,
          status: 'paid',
          due_date: '2024-01-15'
        },
        {
          invoice_number: 'INV-2024-002',
          total_amount: 10000,
          paid_amount: 3000,
          status: 'partial',
          due_date: '2024-02-15'
        }
      ]
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for invoice table to load
    await waitFor(() => {
      expect(screen.getByText('رقم الفاتورة')).toBeInTheDocument();
    });

    // Verify table headers
    expect(screen.getByText('المبلغ الكلي')).toBeInTheDocument();
    const paidLabels = screen.getAllByText('المدفوع');
    expect(paidLabels.length).toBeGreaterThanOrEqual(2); // One in summary card, one in table header
    expect(screen.getByText('الحالة')).toBeInTheDocument();
    expect(screen.getByText('تاريخ الاستحقاق')).toBeInTheDocument();

    // Verify invoice data is displayed
    expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
    expect(screen.getByText('INV-2024-002')).toBeInTheDocument();
  });

  /**
   * Property 2.2.3: Invoice Status Rendering Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * Invoice status is displayed with Arabic labels:
   * - paid → مدفوع
   * - partial → جزئي
   * - overdue → متأخر
   * - unpaid → غير مدفوع
   * 
   * Each status has a corresponding CSS class for styling
   */
  it('Property 2.2.3: Invoice status renders correctly for all status types', async () => {
    const invoiceData = {
      total_invoiced: 20000,
      total_paid: 5000,
      total_due: 15000,
      invoices: [
        {
          invoice_number: 'INV-001',
          total_amount: 5000,
          paid_amount: 5000,
          status: 'paid',
          due_date: '2024-01-15'
        },
        {
          invoice_number: 'INV-002',
          total_amount: 5000,
          paid_amount: 2000,
          status: 'partial',
          due_date: '2024-02-15'
        },
        {
          invoice_number: 'INV-003',
          total_amount: 5000,
          paid_amount: 0,
          status: 'overdue',
          due_date: '2024-03-15'
        },
        {
          invoice_number: 'INV-004',
          total_amount: 5000,
          paid_amount: 0,
          status: 'unpaid',
          due_date: '2024-04-15'
        }
      ]
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for invoice table to load
    await waitFor(() => {
      expect(screen.getByText('رقم الفاتورة')).toBeInTheDocument();
    });

    // Verify all status labels are displayed correctly
    expect(screen.getByText('مدفوع')).toBeInTheDocument();
    expect(screen.getByText('جزئي')).toBeInTheDocument();
    expect(screen.getByText('متأخر')).toBeInTheDocument();
    expect(screen.getByText('غير مدفوع')).toBeInTheDocument();

    // Verify status elements have correct CSS classes
    const paidStatus = screen.getByText('مدفوع');
    expect(paidStatus.className).toContain('sp-inv-status');
    expect(paidStatus.className).toContain('paid');

    const partialStatus = screen.getByText('جزئي');
    expect(partialStatus.className).toContain('sp-inv-status');
    expect(partialStatus.className).toContain('partial');

    const overdueStatus = screen.getByText('متأخر');
    expect(overdueStatus.className).toContain('sp-inv-status');
    expect(overdueStatus.className).toContain('overdue');

    const unpaidStatus = screen.getByText('غير مدفوع');
    expect(unpaidStatus.className).toContain('sp-inv-status');
    expect(unpaidStatus.className).toContain('unpaid');
  });

  /**
   * Property 2.2.4: Date Formatting Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * Due dates are formatted using Arabic locale (ar-EG)
   * Format: DD/MM/YYYY in Arabic numerals
   */
  it('Property 2.2.4: Due dates are formatted correctly in Arabic locale', async () => {
    const testDate = '2024-03-15';
    const invoiceData = {
      total_invoiced: 5000,
      total_paid: 0,
      total_due: 5000,
      invoices: [
        {
          invoice_number: 'INV-2024-001',
          total_amount: 5000,
          paid_amount: 0,
          status: 'unpaid',
          due_date: testDate
        }
      ]
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for invoice table to load
    await waitFor(() => {
      expect(screen.getByText('INV-2024-001')).toBeInTheDocument();
    });

    // Verify date is formatted using Arabic locale
    const expectedDate = new Date(testDate).toLocaleDateString('ar-EG');
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  /**
   * Property 2.2.5: Amount Calculations Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * Amount calculations are displayed correctly:
   * - Total amounts include "ج.م" suffix
   * - Paid amounts include "ج.م" suffix
   * - Missing values display "—" placeholder
   */
  it('Property 2.2.5: Amount calculations display with correct formatting', async () => {
    const invoiceData = {
      total_invoiced: 15000,
      total_paid: 8000,
      total_due: 7000,
      invoices: [
        {
          invoice_number: 'INV-001',
          total_amount: 5000,
          paid_amount: 5000,
          status: 'paid',
          due_date: '2024-01-15'
        },
        {
          invoice_number: 'INV-002',
          total_amount: 10000,
          paid_amount: 3000,
          status: 'partial',
          due_date: '2024-02-15'
        },
        {
          invoice_number: 'INV-003',
          total_amount: null, // Test null handling
          paid_amount: null,
          status: 'unpaid',
          due_date: '2024-03-15'
        }
      ]
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for invoice table to load
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
    });

    // Verify amounts are displayed with "ج.م" suffix
    const amounts = screen.getAllByText(/5000\s+ج\.م/);
    expect(amounts.length).toBeGreaterThanOrEqual(2); // Multiple 5000 amounts
    expect(screen.getByText(/10000\s+ج\.م/)).toBeInTheDocument();
    expect(screen.getByText(/3000\s+ج\.م/)).toBeInTheDocument();

    // Verify null values display placeholder
    const placeholders = screen.getAllByText(/—\s+ج\.م/);
    expect(placeholders.length).toBeGreaterThanOrEqual(2); // At least 2 for INV-003
  });

  /**
   * Property 2.2.6: Empty Invoices State Preservation
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * When no invoices exist, the system displays:
   * - "لا توجد فواتير حتى الآن" message
   */
  it('Property 2.2.6: Empty invoices state displays correctly', async () => {
    const invoiceData = {
      total_invoiced: 0,
      total_paid: 0,
      total_due: 0,
      invoices: []
    };

    // Mock API responses
    api.get.mockImplementation((url) => {
      if (url === '/grades/student/dashboard') {
        return Promise.resolve({
          data: {
            data: {
              student_info: {
                full_name: 'Test Student',
                student_code: 'S12345'
              },
              summary: { gpa: 3.0 }
            }
          }
        });
      }
      if (url === '/grades/student/invoices') {
        return Promise.resolve({ data: invoiceData });
      }
      if (url === '/auth/profile') {
        return Promise.resolve(mockProfileResponse());
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { container } = renderWithRouter(<StudentDashboard />);

    await waitFor(() => {
      expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
    });

    // Click on Invoices tab
    const invoicesTab = screen.getByText('فواتيري');
    invoicesTab.click();

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('لا توجد فواتير حتى الآن')).toBeInTheDocument();
    });

    // Verify summary cards still display (with zero values)
    expect(screen.getByText('إجمالي الفواتير')).toBeInTheDocument();
    const zeroAmounts = screen.getAllByText(/0\s+ج\.م/);
    expect(zeroAmounts.length).toBeGreaterThanOrEqual(1); // At least one zero amount
  });

  /**
   * Property 2.2.7: Property-Based Test - Invoice Data Scenarios
   * 
   * Validates: Requirement 3.1 (Invoices functionality must remain unchanged)
   * 
   * For all invoice data scenarios (various amounts, statuses, dates),
   * the invoices tab renders correctly without errors
   */
  it('Property 2.2.7: Invoices tab renders correctly for all data scenarios', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate invoice data
        fc.record({
          total_invoiced: fc.integer({ min: 0, max: 100000 }),
          total_paid: fc.integer({ min: 0, max: 100000 }),
          total_due: fc.integer({ min: 0, max: 100000 }),
          invoices: fc.array(
            fc.record({
              invoice_number: fc.string({ minLength: 5, maxLength: 20 }),
              total_amount: fc.integer({ min: 0, max: 50000 }),
              paid_amount: fc.integer({ min: 0, max: 50000 }),
              status: fc.constantFrom('paid', 'partial', 'overdue', 'unpaid'),
              due_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).map(d => d.toISOString().split('T')[0])
            }),
            { minLength: 0, maxLength: 5 }
          )
        }),
        async (invoiceData) => {
          // Clear previous renders
          vi.clearAllMocks();
          document.body.innerHTML = '';

          // Mock API responses
          api.get.mockImplementation((url) => {
            if (url === '/grades/student/dashboard') {
              return Promise.resolve({
                data: {
                  data: {
                    student_info: {
                      full_name: 'Test Student',
                      student_code: 'S12345'
                    },
                    summary: { gpa: 3.0 }
                  }
                }
              });
            }
            if (url === '/grades/student/invoices') {
              return Promise.resolve({ data: invoiceData });
            }
            if (url === '/auth/profile') {
              return Promise.resolve(mockProfileResponse());
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });

          const { container } = renderWithRouter(<StudentDashboard />);

          await waitFor(() => {
            expect(container.querySelector('.sp-profile-info h2')).toHaveTextContent('Test Student');
          });

          // Click on Invoices tab
          const invoicesTab = screen.getByText('فواتيري');
          invoicesTab.click();

          // Wait for invoices tab to load
          await waitFor(() => {
            expect(screen.getByText('إجمالي الفواتير')).toBeInTheDocument();
          });

          // Verify summary cards display
          expect(screen.getByText('إجمالي الفواتير')).toBeInTheDocument();
          const paidLabels = screen.getAllByText('المدفوع');
          expect(paidLabels.length).toBeGreaterThanOrEqual(1); // At least one "المدفوع" label
          expect(screen.getByText('المتبقي')).toBeInTheDocument();

          // If invoices exist, verify table is rendered
          if (invoiceData.invoices.length > 0) {
            await waitFor(() => {
              expect(screen.getByText('رقم الفاتورة')).toBeInTheDocument();
            });
            expect(screen.getByText('المبلغ الكلي')).toBeInTheDocument();
            expect(screen.getByText('الحالة')).toBeInTheDocument();
          } else {
            // If no invoices, verify empty state
            await waitFor(() => {
              expect(screen.getByText('لا توجد فواتير حتى الآن')).toBeInTheDocument();
            });
          }
        }
      ),
      { numRuns: 10 } // Run 10 scenarios
    );
  }, 30000); // Longer timeout for property-based test
});

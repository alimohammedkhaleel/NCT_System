-- =====================================================
-- نظام ERP لجامعة القاهرة الجديدة التكنولوجية
-- New Cairo Technological University (NCTU) ERP System
-- =====================================================

-- حذف قاعدة البيانات إذا وجدت (للتنظيف)
-- DROP DATABASE IF EXISTS nctu_erp;

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS nctu_erp
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE nctu_erp;

-- =====================================================
-- 1. جدول المستخدمين (Users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    national_id VARCHAR(20) UNIQUE,
    role ENUM('admin', 'professor', 'student', 'accountant', 'registrar') NOT NULL,
    profile_picture BLOB,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- 2. جدول التخصصات (Specialties)
-- =====================================================
CREATE TABLE IF NOT EXISTS specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    arabic_name VARCHAR(100) NOT NULL,
    duration_years INT DEFAULT 4,
    total_credits INT DEFAULT 120,
    annual_fee DECIMAL(10,2) DEFAULT 10000.00,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- 3. جدول المواد الدراسية (Courses)
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    arabic_name VARCHAR(100),
    specialty_id INT NOT NULL,
    professor_id INT,  -- الدكتور المسؤول عن المادة
    credit_hours INT DEFAULT 3,
    semester_level INT,  -- المستوى الدراسي (1,2,3,4)
    semester_type ENUM('Fall', 'Spring', 'Summer') DEFAULT 'Fall',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course_code (course_code),
    INDEX idx_specialty (specialty_id),
    INDEX idx_professor (professor_id)
);

-- =====================================================
-- 4. جدول الطلاب (Students)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    specialty_id INT NOT NULL,
    current_year INT DEFAULT 1,
    academic_status ENUM('active', 'graduated', 'suspended', 'transferred', 'dropped') DEFAULT 'active',
    enrollment_date DATE,
    graduation_date DATE,
    qr_code_secret VARCHAR(255),  -- السر الخاص بـ QR Code
    qr_code_data TEXT,  -- بيانات QR Code المشفرة
    profile_picture BLOB,
    total_paid DECIMAL(10,2) DEFAULT 0.00,
    total_due DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id),
    INDEX idx_student_code (student_code),
    INDEX idx_national_id (national_id),
    INDEX idx_academic_status (academic_status),
    INDEX idx_current_year (current_year)
);

-- =====================================================
-- 5. جدول توزيع المواد على الأساتذة (Professor Courses)
-- =====================================================
CREATE TABLE IF NOT EXISTS professor_courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    professor_id INT NOT NULL,
    course_id INT NOT NULL,
    academic_year INT NOT NULL,
    semester ENUM('Fall', 'Spring', 'Summer') NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prof_course (professor_id, course_id, academic_year, semester),
    INDEX idx_professor (professor_id),
    INDEX idx_course (course_id)
);

-- =====================================================
-- 6. جدول تسجيل الطلاب في المواد (Student Enrollments)
-- =====================================================
CREATE TABLE IF NOT EXISTS student_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    academic_year INT NOT NULL,
    semester ENUM('Fall', 'Spring', 'Summer') NOT NULL,
    enrollment_date DATE DEFAULT (CURDATE()),
    status ENUM('enrolled', 'dropped', 'completed', 'failed') DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id, academic_year, semester),
    INDEX idx_student (student_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
);

-- =====================================================
-- 7. جدول الدرجات (Grades) - كل دكتور يضيف درجات مادته فقط
-- =====================================================
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_id INT,  -- رابط لتسجيل الطالب
    academic_year INT NOT NULL,
    semester ENUM('Fall', 'Spring', 'Summer') NOT NULL,

    -- أعمال السنة
    assignment1_score DECIMAL(5,2) DEFAULT 0,
    assignment1_max_score DECIMAL(5,2) DEFAULT 30,
    assignment1_grade ENUM('A', 'B', 'C', 'D', 'F') DEFAULT NULL,

    assignment2_score DECIMAL(5,2) DEFAULT 0,
    assignment2_max_score DECIMAL(5,2) DEFAULT 30,
    assignment2_grade ENUM('A', 'B', 'C', 'D', 'F') DEFAULT NULL,

    -- الامتحان النهائي
    final_exam_score DECIMAL(5,2) DEFAULT 0,
    final_exam_max_score DECIMAL(5,2) DEFAULT 150,

    -- النتائج النهائية
    total_score DECIMAL(5,2) DEFAULT 0,
    total_max_score DECIMAL(5,2) DEFAULT 210,
    total_percentage DECIMAL(5,2) DEFAULT 0,
    grade_point DECIMAL(3,2) DEFAULT 0,
    letter_grade ENUM('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F') DEFAULT NULL,
    result ENUM('Distinction', 'Merit', 'Pass', 'Referral', 'Fail') DEFAULT 'Fail',
    status ENUM('draft', 'submitted', 'approved', 'published') DEFAULT 'draft',

    -- تتبع من قام بإدخال الدرجة
    graded_by INT NOT NULL,  -- ID الدكتور الذي أدخل الدرجة
    approved_by INT DEFAULT NULL,  -- ID المدقق
    approved_at DATETIME DEFAULT NULL,

    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (graded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),

    UNIQUE KEY unique_grade (student_id, course_id, academic_year, semester),
    INDEX idx_student (student_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_graded_by (graded_by),
    INDEX idx_academic_year (academic_year),
    INDEX idx_semester (semester)
);

-- =====================================================
-- 8. جدول الفواتير (Invoices)
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    academic_year INT NOT NULL,
    semester ENUM('Fall', 'Spring', 'Summer') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    due_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    invoice_type ENUM('tuition', 'library', 'lab', 'activities', 'transportation', 'other') DEFAULT 'tuition',
    description TEXT,
    due_date DATE,
    issued_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id),
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
);

-- =====================================================
-- 9. جدول المدفوعات (Payments)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INT NOT NULL,
    invoice_id INT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'check', 'online') NOT NULL,
    semester ENUM('Fall', 'Spring', 'Summer'),
    academic_year INT,
    transaction_id VARCHAR(100),
    bank_name VARCHAR(100),
    check_number VARCHAR(50),
    collected_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (collected_by) REFERENCES users(id),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_student (student_id),
    INDEX idx_payment_date (payment_date)
);

-- =====================================================
-- 10. جدول QR Codes للطلاب
-- =====================================================
CREATE TABLE IF NOT EXISTS student_qr_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT UNIQUE NOT NULL,
    qr_code_secret VARCHAR(255) NOT NULL,
    qr_code_data TEXT NOT NULL,
    qr_code_image BLOB,  -- صورة QR Code
    expires_at DATETIME,
    last_used_at DATETIME,
    use_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_secret (qr_code_secret),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- 11. جدول المستندات (Documents)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    data LONGBLOB NOT NULL,
    file_size INT,
    owner_id INT,
    document_type ENUM('profile', 'certificate', 'transcript', 'id_card', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_owner (owner_id)
);

-- =====================================================
-- 12. جدول سجل النشاطات (Activity Log)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 15. جدول الجداول الدراسية (Timetables)
-- =====================================================
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

-- =====================================================
-- =====================================================
-- إدخال البيانات الأساسية (Seed Data)
-- =====================================================
-- =====================================================

-- -----------------------------------------------------
-- 1. إضافة التخصصات (Specialties) - جامعة القاهرة الجديدة التكنولوجية
-- -----------------------------------------------------
INSERT INTO specialties (code, name, arabic_name, duration_years, total_credits, annual_fee, is_active, description) VALUES
('MCT', 'Mechatronics Technology', 'تكنولوجيا الميكاترونكس', 4, 132, 15000.00, 1, 'برنامج الميكاترونكس يجمع بين الميكانيكا والإلكترونيات والبرمجة'),
('AUT', 'Autotronics Technology', 'تكنولوجيا الأوتوترونكس', 4, 132, 14000.00, 1, 'برنامج متخصص في إلكترونيات السيارات وأنظمتها الحديثة'),
('ICT', 'Information Technology', 'تكنولوجيا المعلومات', 4, 132, 12000.00, 1, 'برنامج تكنولوجيا المعلومات والبرمجيات والشبكات'),
('PRO', 'Prosthetics Technology', 'تكنولوجيا الأطراف الصناعية', 4, 132, 16000.00, 1, 'برنامج الأطراف الصناعية والأجهزة التقويمية'),
('OIL', 'Oil Production Technology', 'تكنولوجيا إنتاج البترول', 4, 132, 18000.00, 1, 'برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول'),
('REN', 'Renewable Energy Technology', 'تكنولوجيا الطاقة المتجددة', 4, 132, 17000.00, 1, 'برنامج تكنولوجيا الطاقة الجديدة والمتجددة');

-- -----------------------------------------------------
-- 2. إضافة المستخدمين (Users) - الأساتذة والإداريين
-- -----------------------------------------------------

-- المدير العام (Admin)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('admin', SHA2('admin123', 256), 'admin@nctu.edu.eg', 'مدير النظام', '01000000000', '11111111111111', 'admin', 1);

-- أساتذة تكنولوجيا المعلومات (IT Professors)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('prof_ahmed', SHA2('prof123', 256), 'ahmed.mohamed@nctu.edu.eg', 'د. أحمد محمد حسن', '01011111111', '22222222222222', 'professor', 1),
('prof_sara', SHA2('prof123', 256), 'sara.ibrahim@nctu.edu.eg', 'د. سارة إبراهيم محمود', '01022222222', '33333333333333', 'professor', 1),
('prof_khaled', SHA2('prof123', 256), 'khaled.ali@nctu.edu.eg', 'د. خالد علي سيد', '01033333333', '44444444444444', 'professor', 1);

-- أساتذة الرياضيات والفيزياء (Math & Physics Professors)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('prof_nadia', SHA2('prof123', 256), 'nadia.hassan@nctu.edu.eg', 'د. نادية حسن محمود', '01044444444', '55555555555555', 'professor', 1),
('prof_tamer', SHA2('prof123', 256), 'tamer.saeed@nctu.edu.eg', 'د. تامر سعيد عبدالله', '01055555555', '66666666666666', 'professor', 1);

-- أساتذة التخصصات المختلفة
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('prof_mohamed_mct', SHA2('prof123', 256), 'mohamed.fathy@nctu.edu.eg', 'د. محمد فتحي عبدالرؤوف', '01066666666', '77777777777777', 'professor', 1),
('prof_eman_aut', SHA2('prof123', 256), 'eman.mostafa@nctu.edu.eg', 'د. إيمان مصطفى كمال', '01077777777', '88888888888888', 'professor', 1),
('prof_hany_pro', SHA2('prof123', 256), 'hany.sherif@nctu.edu.eg', 'د. هاني شريف عبدالحميد', '01088888888', '99999999999999', 'professor', 1),
('prof_walid_oil', SHA2('prof123', 256), 'walid.ragab@nctu.edu.eg', 'د. وليد رجب محمود', '01099999999', '10101010101010', 'professor', 1),
('prof_nour_ren', SHA2('prof123', 256), 'nour.adel@nctu.edu.eg', 'د. نور عادل عبدالرازق', '01010101010', '11111111111112', 'professor', 1);

-- موظف الحسابات (Accountant)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('accountant', SHA2('account123', 256), 'accountant@nctu.edu.eg', 'محمد عبدالرحمن محمود', '02000000000', '12121212121212', 'accountant', 1);

-- موظف شؤون الطلاب (Registrar)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('registrar', SHA2('reg123', 256), 'registrar@nctu.edu.eg', 'أحمد سمير إبراهيم', '03000000000', '13131313131313', 'registrar', 1);

-- -----------------------------------------------------
-- 3. إضافة المواد الدراسية (Courses) حسب التخصصات
-- -----------------------------------------------------

-- الحصول على معرفات التخصصات
-- MCT = 1, AUT = 2, ICT = 3, PRO = 4, OIL = 5, REN = 6

-- المواد المشتركة (Common Courses) - يدرسها طلاب جميع التخصصات
INSERT INTO courses (course_code, course_name, arabic_name, specialty_id, professor_id, credit_hours, semester_level, semester_type, is_active) VALUES
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 1, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 2, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 3, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 4, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 5, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),
('CM101', 'Engineering Mathematics I', 'الرياضيات الهندسية I', 6, (SELECT id FROM users WHERE username = 'prof_nadia'), 3, 1, 'Fall', 1),

('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 1, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),
('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 2, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),
('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 3, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),
('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 4, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),
('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 5, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),
('CM102', 'Physics for Engineers', 'الفيزياء للمهندسين', 6, (SELECT id FROM users WHERE username = 'prof_tamer'), 3, 1, 'Fall', 1),

('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 1, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1),
('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 2, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1),
('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 3, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1),
('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 4, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1),
('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 5, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1),
('CM103', 'English for Engineering', 'اللغة الإنجليزية الهندسية', 6, (SELECT id FROM users WHERE username = 'prof_ahmed'), 2, 1, 'Fall', 1);

-- مواد تخصص تكنولوجيا المعلومات (ICT)
INSERT INTO courses (course_code, course_name, arabic_name, specialty_id, professor_id, credit_hours, semester_level, semester_type, is_active) VALUES
('ICT101', 'Programming Fundamentals', 'أساسيات البرمجة', 3, (SELECT id FROM users WHERE username = 'prof_ahmed'), 3, 1, 'Fall', 1),
('ICT102', 'Database Systems', 'نظم قواعد البيانات', 3, (SELECT id FROM users WHERE username = 'prof_sara'), 3, 2, 'Spring', 1),
('ICT103', 'Web Development', 'تطوير تطبيقات الويب', 3, (SELECT id FROM users WHERE username = 'prof_ahmed'), 3, 2, 'Spring', 1),
('ICT201', 'Data Structures', 'هياكل البيانات', 3, (SELECT id FROM users WHERE username = 'prof_sara'), 3, 3, 'Fall', 1),
('ICT202', 'Operating Systems', 'أنظمة التشغيل', 3, (SELECT id FROM users WHERE username = 'prof_khaled'), 3, 3, 'Fall', 1),
('ICT203', 'Computer Networks', 'شبكات الحاسوب', 3, (SELECT id FROM users WHERE username = 'prof_khaled'), 3, 3, 'Fall', 1),
('ICT301', 'Software Engineering', 'هندسة البرمجيات', 3, (SELECT id FROM users WHERE username = 'prof_ahmed'), 3, 4, 'Spring', 1),
('ICT302', 'Mobile App Development', 'تطوير تطبيقات الموبايل', 3, (SELECT id FROM users WHERE username = 'prof_sara'), 3, 4, 'Spring', 1),
('ICT303', 'Cybersecurity', 'الأمن السيبراني', 3, (SELECT id FROM users WHERE username = 'prof_khaled'), 3, 5, 'Fall', 1),
('ICT401', 'Cloud Computing', 'الحوسبة السحابية', 3, (SELECT id FROM users WHERE username = 'prof_ahmed'), 3, 5, 'Fall', 1),
('ICT402', 'Graduation Project', 'مشروع التخرج', 3, (SELECT id FROM users WHERE username = 'prof_sara'), 6, 6, 'Spring', 1);

-- -----------------------------------------------------
-- 4. توزيع المواد على الأساتذة (Professor Courses)
-- -----------------------------------------------------
INSERT INTO professor_courses (professor_id, course_id, academic_year, semester, is_primary) VALUES
-- د. أحمد محمد - مواد ICT
((SELECT id FROM users WHERE username = 'prof_ahmed'), (SELECT id FROM courses WHERE course_code = 'ICT101' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_ahmed'), (SELECT id FROM courses WHERE course_code = 'ICT103' AND specialty_id = 3), 2024, 'Spring', 1),
((SELECT id FROM users WHERE username = 'prof_ahmed'), (SELECT id FROM courses WHERE course_code = 'ICT301' AND specialty_id = 3), 2024, 'Spring', 1),
((SELECT id FROM users WHERE username = 'prof_ahmed'), (SELECT id FROM courses WHERE course_code = 'ICT401' AND specialty_id = 3), 2024, 'Fall', 1),

-- د. سارة إبراهيم - مواد ICT
((SELECT id FROM users WHERE username = 'prof_sara'), (SELECT id FROM courses WHERE course_code = 'ICT102' AND specialty_id = 3), 2024, 'Spring', 1),
((SELECT id FROM users WHERE username = 'prof_sara'), (SELECT id FROM courses WHERE course_code = 'ICT201' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_sara'), (SELECT id FROM courses WHERE course_code = 'ICT302' AND specialty_id = 3), 2024, 'Spring', 1),
((SELECT id FROM users WHERE username = 'prof_sara'), (SELECT id FROM courses WHERE course_code = 'ICT402' AND specialty_id = 3), 2024, 'Spring', 1),

-- د. خالد علي - مواد ICT
((SELECT id FROM users WHERE username = 'prof_khaled'), (SELECT id FROM courses WHERE course_code = 'ICT202' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_khaled'), (SELECT id FROM courses WHERE course_code = 'ICT203' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_khaled'), (SELECT id FROM courses WHERE course_code = 'ICT303' AND specialty_id = 3), 2024, 'Fall', 1),

-- د. نادية حسن - مواد الرياضيات المشتركة
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 1), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 2), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 4), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 5), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_nadia'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 6), 2024, 'Fall', 1),

-- د. تامر سعيد - مواد الفيزياء المشتركة
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 1), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 2), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 3), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 4), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 5), 2024, 'Fall', 1),
((SELECT id FROM users WHERE username = 'prof_tamer'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 6), 2024, 'Fall', 1);

-- -----------------------------------------------------
-- 5. إضافة طلاب نموذجيين (Demo Students)
-- -----------------------------------------------------

-- طلاب تكنولوجيا المعلومات (ICT)
INSERT INTO users (username, password_hash, email, full_name, phone, national_id, user_type, is_active) VALUES
('student_ahmed', SHA2('student123', 256), 'ahmed.ali@student.nctu.edu.eg', 'أحمد علي محمود', '01111111111', '10000000000001', 'student', 1),
('student_menna', SHA2('student123', 256), 'menna.hassan@student.nctu.edu.eg', 'منى حسن إبراهيم', '01111111112', '10000000000002', 'student', 1),
('student_omar', SHA2('student123', 256), 'omar.khaled@student.nctu.edu.eg', 'عمر خالد سيد', '01111111113', '10000000000003', 'student', 1),
('student_heba', SHA2('student123', 256), 'heba.mohamed@student.nctu.edu.eg', 'هبة محمد عبدالله', '01111111114', '10000000000004', 'student', 1),
('student_mohamed', SHA2('student123', 256), 'mohamed.ahmed@student.nctu.edu.eg', 'محمد أحمد رشاد', '01111111115', '10000000000005', 'student', 1),
('student_nada', SHA2('student123', 256), 'nada.hussein@student.nctu.edu.eg', 'ندى حسين علي', '01111111116', '10000000000006', 'student', 1);

-- ربط الطلاب بجدول students
INSERT INTO students (user_id, student_code, national_id, specialty_id, current_year, academic_status, enrollment_date, qr_code_secret) VALUES
-- طلاب ICT
((SELECT id FROM users WHERE username = 'student_ahmed'), 'NCTU-ICT-001', '10000000000001', (SELECT id FROM specialties WHERE code = 'ICT'), 1, 'active', '2024-09-01', SHA2('NCTU-ICT-001', 256)),
((SELECT id FROM users WHERE username = 'student_menna'), 'NCTU-ICT-002', '10000000000002', (SELECT id FROM specialties WHERE code = 'ICT'), 1, 'active', '2024-09-01', SHA2('NCTU-ICT-002', 256)),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-003'), 'NCTU-ICT-003', '10000000000003', (SELECT id FROM specialties WHERE code = 'ICT'), 2, 'active', '2023-09-01', SHA2('NCTU-ICT-003', 256)),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-004'), 'NCTU-ICT-004', '10000000000004', (SELECT id FROM specialties WHERE code = 'ICT'), 2, 'active', '2023-09-01', SHA2('NCTU-ICT-004', 256)),
((SELECT id FROM students WHERE student_code = 'NCTU-MCT-001'), 'NCTU-MCT-001', '10000000000005', (SELECT id FROM specialties WHERE code = 'MCT'), 1, 'active', '2024-09-01', SHA2('NCTU-MCT-001', 256)),
((SELECT id FROM students WHERE student_code = 'NCTU-AUT-001'), 'NCTU-AUT-001', '10000000000006', (SELECT id FROM specialties WHERE code = 'AUT'), 1, 'active', '2024-09-01', SHA2('NCTU-AUT-001', 256));

-- -----------------------------------------------------
-- 6. إنشاء QR Codes للطلاب
-- -----------------------------------------------------
INSERT INTO student_qr_codes (student_id, qr_code_secret, qr_code_data, is_active) VALUES
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), SHA2('NCTU-ICT-001-secret', 256), '{"student_code":"NCTU-ICT-001","version":"1.0"}', 1),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-002'), SHA2('NCTU-ICT-002-secret', 256), '{"student_code":"NCTU-ICT-002","version":"1.0"}', 1),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-003'), SHA2('NCTU-ICT-003-secret', 256), '{"student_code":"NCTU-ICT-003","version":"1.0"}', 1),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-004'), SHA2('NCTU-ICT-004-secret', 256), '{"student_code":"NCTU-ICT-004","version":"1.0"}', 1),
((SELECT id FROM students WHERE student_code = 'NCTU-MCT-001'), SHA2('NCTU-MCT-001-secret', 256), '{"student_code":"NCTU-MCT-001","version":"1.0"}', 1),
((SELECT id FROM students WHERE student_code = 'NCTU-AUT-001'), SHA2('NCTU-AUT-001-secret', 256), '{"student_code":"NCTU-AUT-001","version":"1.0"}', 1);

-- -----------------------------------------------------
-- 7. تسجيل الطلاب في المواد (Enrollments)
-- -----------------------------------------------------
-- تسجيل طلاب ICT السنة الأولى في المواد الأساسية
INSERT INTO student_enrollments (student_id, course_id, academic_year, semester, status) VALUES
-- الطالب NCTU-ICT-001
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), (SELECT id FROM courses WHERE course_code = 'CM103' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), (SELECT id FROM courses WHERE course_code = 'ICT101' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),

-- الطالب NCTU-ICT-002
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-002'), (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-002'), (SELECT id FROM courses WHERE course_code = 'CM102' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-002'), (SELECT id FROM courses WHERE course_code = 'CM103' AND specialty_id = 3), 2024, 'Fall', 'enrolled'),
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-002'), (SELECT id FROM courses WHERE course_code = 'ICT101' AND specialty_id = 3), 2024, 'Fall', 'enrolled');

-- -----------------------------------------------------
-- 8. إضافة درجات نموذجية (لتوضيح عمل النظام)
-- -----------------------------------------------------
INSERT INTO grades (student_id, course_id, academic_year, semester, 
    assignment1_score, assignment2_score, final_exam_score,
    total_score, total_percentage, graded_by, status) VALUES
-- درجات طالب ICT-001 في مواد الفصل الأول
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), 
 (SELECT id FROM courses WHERE course_code = 'CM101' AND specialty_id = 3), 2024, 'Fall',
 25, 28, 140, 193, 91.90, (SELECT id FROM users WHERE username = 'prof_nadia'), 'published'),
 
((SELECT id FROM students WHERE student_code = 'NCTU-ICT-001'), 
 (SELECT id FROM courses WHERE course_code = 'ICT101' AND specialty_id = 3), 2024, 'Fall',
 28, 27, 145, 200, 95.24, (SELECT id FROM users WHERE username = 'prof_ahmed'), 'published');

-- تحديث النتائج النهائية تلقائياً باستخدام تحديث الحقول
UPDATE grades SET 
    total_max_score = 210,
    total_percentage = (total_score / 210) * 100,
    result = CASE 
        WHEN total_percentage >= 85 THEN 'Distinction'
        WHEN total_percentage >= 70 THEN 'Merit'
        WHEN total_percentage >= 50 THEN 'Pass'
        WHEN total_percentage >= 30 THEN 'Referral'
        ELSE 'Fail'
    END,
    grade_point = CASE
        WHEN total_percentage >= 85 THEN 4.0
        WHEN total_percentage >= 70 THEN 3.0
        WHEN total_percentage >= 50 THEN 2.0
        WHEN total_percentage >= 30 THEN 1.0
        ELSE 0.0
    END,
    letter_grade = CASE
        WHEN total_percentage >= 97 THEN 'A+'
        WHEN total_percentage >= 93 THEN 'A'
        WHEN total_percentage >= 90 THEN 'A-'
        WHEN total_percentage >= 87 THEN 'B+'
        WHEN total_percentage >= 83 THEN 'B'
        WHEN total_percentage >= 80 THEN 'B-'
        WHEN total_percentage >= 77 THEN 'C+'
        WHEN total_percentage >= 73 THEN 'C'
        WHEN total_percentage >= 70 THEN 'C-'
        WHEN total_percentage >= 67 THEN 'D+'
        WHEN total_percentage >= 63 THEN 'D'
        WHEN total_percentage >= 60 THEN 'D-'
        ELSE 'F'
    END
WHERE total_score > 0;

-- -----------------------------------------------------
-- 9. إنشاء الفهارس الإضافية لتحسين الأداء
-- -----------------------------------------------------
CREATE INDEX idx_grades_student_course ON grades(student_id, course_id);
CREATE INDEX idx_grades_academic_semester ON grades(academic_year, semester);
CREATE INDEX idx_enrollments_student_semester ON student_enrollments(student_id, academic_year, semester);
CREATE INDEX idx_payments_student_date ON payments(student_id, payment_date);
CREATE INDEX idx_invoices_student_status ON fee_invoices(student_id, status);
CREATE INDEX idx_professor_courses_lookup ON professor_courses(professor_id, academic_year, semester);

-- -----------------------------------------------------
-- 10. عرض معلومات النظام للتأكيد
-- -----------------------------------------------------
SELECT '===================================================' AS '';
SELECT '🎓 NCTU ERP Database Setup Complete!' AS '';
SELECT '===================================================' AS '';
SELECT CONCAT('📚 Total Specialties: ', COUNT(*)) FROM specialties;
SELECT CONCAT('👥 Total Users: ', COUNT(*)) FROM users;
SELECT CONCAT('👨‍🏫 Professors: ', COUNT(*)) FROM users WHERE user_type = 'professor';
SELECT CONCAT('📖 Total Courses: ', COUNT(*)) FROM courses;
SELECT CONCAT('🧑‍🎓 Total Students: ', COUNT(*)) FROM students;
SELECT CONCAT('📝 Enrollments: ', COUNT(*)) FROM student_enrollments;
SELECT CONCAT('💰 Payments: ', COUNT(*)) FROM payments;
SELECT CONCAT('📄 Invoices: ', COUNT(*)) FROM fee_invoices;
SELECT '===================================================' AS '';

-- عرض معلومات تسجيل الدخول للاختبار
SELECT '🔐 Login Credentials for Testing:' AS '';
SELECT 'Admin:     username=admin, password=admin123' AS '';
SELECT 'Professor: username=prof_ahmed, password=prof123' AS '';
SELECT 'Student:   username=student_ahmed, password=student123' AS '';
SELECT 'Accountant: username=accountant, password=account123' AS '';
SELECT '===================================================' AS '';


-- =====================================================
-- 20. جدول روابط التسجيل (Registration Links)
-- =====================================================
CREATE TABLE IF NOT EXISTS registration_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_used (is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 21. جدول طلبات التسجيل (Registration Requests)
-- =====================================================
CREATE TABLE IF NOT EXISTS registration_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    national_id VARCHAR(14) NOT NULL UNIQUE,
    birth_date DATE,
    gender ENUM('male', 'female'),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    specialty_id INT NOT NULL,
    high_school_certificate VARCHAR(255),
    high_school_grade DECIMAL(5,2),
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(20),
    guardian_relation VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by INT,
    reviewed_at DATETIME,
    created_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE RESTRICT,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (token) REFERENCES registration_links(token) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_national_id (national_id),
    INDEX idx_specialty (specialty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

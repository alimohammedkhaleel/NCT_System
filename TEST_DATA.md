# 📊 بيانات الاختبار - NCTU ERP System

## 🔐 بيانات تسجيل الدخول الجاهزة

### 👤 Admin (المدير)
```json
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@nctu.edu",
  "full_name": "Admin User",
  "role": "admin"
}
```

### 👨‍🏫 Professors (الدكاترة)

#### الدكتور 1
```json
{
  "username": "professor",
  "password": "professor123",
  "email": "professor@nctu.edu",
  "full_name": "Prof. Mohamed Ali",
  "role": "professor",
  "professor_code": "PROF002",
  "department": "Computer Science",
  "specialization": "Database Systems"
}
```

#### الدكتور 2
```json
{
  "username": "professor1",
  "password": "prof123",
  "email": "prof@nctu.edu",
  "full_name": "Prof. Ahmed Hassan",
  "role": "professor",
  "professor_code": "PROF001",
  "department": "Computer Science",
  "specialization": "Software Engineering"
}
```

### 👨‍🎓 Students (الطلاب)

#### طالب موجود
```json
{
  "username": "student1",
  "password": "student123",
  "email": "student@nctu.edu",
  "full_name": "Ali Mohamed",
  "role": "student",
  "student_code": "NCTU-26-001",
  "national_id": "30001011234567",
  "specialty": "Information Technology (ICT)",
  "current_year": 1
}
```

### 💰 Accountant (المحاسب)
```json
{
  "username": "accountant",
  "password": "accountant123",
  "email": "accountant@nctu.edu",
  "full_name": "Accountant User",
  "role": "accountant"
}
```

---

## 🎓 التخصصات المتاحة (Specialties)

### 1. Mechatronics Technology (MCT)
```json
{
  "id": 1,
  "code": "MCT",
  "name": "Mechatronics Technology",
  "arabic_name": "تكنولوجيا الميكاترونكس",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 15000.00,
  "description": "برنامج الميكاترونكس يجمع بين الميكانيكا والإلكترونيات والبرمجة والتحكم الآلي"
}
```

### 2. Autotronics Technology (AUT)
```json
{
  "id": 2,
  "code": "AUT",
  "name": "Autotronics Technology",
  "arabic_name": "تكنولوجيا الأوتوترونكس",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 14000.00,
  "description": "برنامج متخصص في إلكترونيات السيارات وأنظمتها الحديثة والتشخيص الإلكتروني"
}
```

### 3. Information Technology (ICT)
```json
{
  "id": 3,
  "code": "ICT",
  "name": "Information Technology",
  "arabic_name": "تكنولوجيا المعلومات",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 12000.00,
  "description": "برنامج تكنولوجيا المعلومات والبرمجيات والشبكات وأمن المعلومات",
  "branches": ["Software", "Network"]
}
```

### 4. Prosthetics Technology (PRO)
```json
{
  "id": 4,
  "code": "PRO",
  "name": "Prosthetics Technology",
  "arabic_name": "تكنولوجيا الأطراف الصناعية",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 16000.00,
  "description": "برنامج الأطراف الصناعية والأجهزة التقويمية والتأهيل الطبي"
}
```

### 5. Oil Production Technology (OIL)
```json
{
  "id": 5,
  "code": "OIL",
  "name": "Oil Production Technology",
  "arabic_name": "تكنولوجيا إنتاج البترول",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 18000.00,
  "description": "برنامج تكنولوجيا إنتاج ونقل ومعالجة البترول والغاز الطبيعي"
}
```

### 6. Renewable Energy Technology (REN)
```json
{
  "id": 6,
  "code": "REN",
  "name": "Renewable Energy Technology",
  "arabic_name": "تكنولوجيا الطاقة المتجددة",
  "duration_years": 4,
  "total_credits": 132,
  "annual_fee": 17000.00,
  "description": "برنامج تكنولوجيا الطاقة الجديدة والمتجددة والطاقة الشمسية وطاقة الرياح"
}
```

---

## 📚 المقررات الدراسية (Courses)

### ICT Courses

#### السنة الأولى - الفصل الأول
```json
{
  "code": "ICT101",
  "name": "Introduction to Programming",
  "arabic_name": "مقدمة في البرمجة",
  "specialty_id": 3,
  "year_level": 1,
  "semester": 1,
  "credits": 3,
  "course_type": "mandatory"
}
```

#### السنة الثانية - الفصل الأول
```json
{
  "code": "ICT102",
  "name": "Database Systems",
  "arabic_name": "نظم قواعد البيانات",
  "specialty_id": 3,
  "year_level": 2,
  "semester": 1,
  "credits": 3,
  "course_type": "mandatory"
}
```

#### السنة الثانية - الفصل الثاني
```json
{
  "code": "ICT103",
  "name": "Web Development",
  "arabic_name": "تطوير الويب",
  "specialty_id": 3,
  "year_level": 2,
  "semester": 2,
  "credits": 3,
  "course_type": "mandatory"
}
```

#### السنة الثالثة - الفصل الأول
```json
{
  "code": "ICT104",
  "name": "Network Security",
  "arabic_name": "أمن الشبكات",
  "specialty_id": 3,
  "year_level": 3,
  "semester": 1,
  "credits": 3,
  "course_type": "mandatory"
}
```

### MCT Courses

```json
{
  "code": "MCT101",
  "name": "Engineering Mechanics",
  "arabic_name": "الميكانيكا الهندسية",
  "specialty_id": 1,
  "year_level": 1,
  "semester": 1,
  "credits": 3
}
```

```json
{
  "code": "MCT102",
  "name": "Control Systems",
  "arabic_name": "نظم التحكم",
  "specialty_id": 1,
  "year_level": 2,
  "semester": 1,
  "credits": 3
}
```

### AUT Courses

```json
{
  "code": "AUT101",
  "name": "Automotive Electronics",
  "arabic_name": "إلكترونيات السيارات",
  "specialty_id": 2,
  "year_level": 1,
  "semester": 1,
  "credits": 3
}
```

```json
{
  "code": "AUT102",
  "name": "Engine Management Systems",
  "arabic_name": "نظم إدارة المحرك",
  "specialty_id": 2,
  "year_level": 2,
  "semester": 1,
  "credits": 3
}
```

---

## 👥 بيانات طلاب للتسجيل (Registration Data)

### طالب 1 - السنة الأولى ICT
```json
{
  "full_name": "أحمد محمد علي",
  "national_id": "30112011234567",
  "email": "ahmed.mohamed@student.nctu.edu",
  "phone": "+20-10-12345678",
  "specialty_id": 3,
  "birth_date": "2001-01-15",
  "gender": "male",
  "address": "القاهرة، مصر الجديدة",
  "current_year": 1,
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 85.5,
  "guardian_name": "محمد علي حسن",
  "guardian_phone": "+20-10-98765432",
  "guardian_relation": "والد"
}
```

### طالب 2 - السنة الأولى ICT
```json
{
  "full_name": "فاطمة أحمد حسن",
  "national_id": "30203011234568",
  "email": "fatma.ahmed@student.nctu.edu",
  "phone": "+20-11-23456789",
  "specialty_id": 3,
  "birth_date": "2002-03-20",
  "gender": "female",
  "address": "الجيزة، الدقي",
  "current_year": 1,
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 88.0,
  "guardian_name": "أحمد حسن محمود",
  "guardian_phone": "+20-11-87654321",
  "guardian_relation": "والد"
}
```

### طالب 3 - السنة الثانية ICT
```json
{
  "full_name": "محمود خالد سعيد",
  "national_id": "29905151234569",
  "email": "mahmoud.khaled@student.nctu.edu",
  "phone": "+20-12-34567890",
  "specialty_id": 3,
  "birth_date": "1999-05-15",
  "gender": "male",
  "address": "الإسكندرية، سموحة",
  "current_year": 2,
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 82.5,
  "guardian_name": "خالد سعيد أحمد",
  "guardian_phone": "+20-12-76543210",
  "guardian_relation": "والد"
}
```

### طالب 4 - السنة الثالثة ICT (Software Branch)
```json
{
  "full_name": "سارة محمد إبراهيم",
  "national_id": "29807201234570",
  "email": "sara.mohamed@student.nctu.edu",
  "phone": "+20-15-45678901",
  "specialty_id": 3,
  "birth_date": "1998-07-20",
  "gender": "female",
  "address": "القاهرة، المعادي",
  "current_year": 3,
  "branch": "Software",
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 90.0,
  "guardian_name": "محمد إبراهيم علي",
  "guardian_phone": "+20-15-54321098",
  "guardian_relation": "والد"
}
```

### طالب 5 - السنة الثالثة ICT (Network Branch)
```json
{
  "full_name": "عمر حسن عبدالله",
  "national_id": "29809101234571",
  "email": "omar.hassan@student.nctu.edu",
  "phone": "+20-10-56789012",
  "specialty_id": 3,
  "birth_date": "1998-09-10",
  "gender": "male",
  "address": "القاهرة، مدينة نصر",
  "current_year": 3,
  "branch": "Network",
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 87.5,
  "guardian_name": "حسن عبدالله محمد",
  "guardian_phone": "+20-10-65432109",
  "guardian_relation": "والد"
}
```

### طالب 6 - السنة الأولى MCT
```json
{
  "full_name": "يوسف أحمد محمود",
  "national_id": "30104251234572",
  "email": "youssef.ahmed@student.nctu.edu",
  "phone": "+20-11-67890123",
  "specialty_id": 1,
  "birth_date": "2001-04-25",
  "gender": "male",
  "address": "الجيزة، الهرم",
  "current_year": 1,
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 84.0,
  "guardian_name": "أحمد محمود حسن",
  "guardian_phone": "+20-11-76543210",
  "guardian_relation": "والد"
}
```

---

## 💳 بيانات الفواتير والمدفوعات

### فاتورة السنة الأولى
```json
{
  "student_id": 1,
  "amount": 12000.00,
  "description": "رسوم السنة الدراسية الأولى - تكنولوجيا المعلومات",
  "due_date": "2026-09-30",
  "invoice_type": "tuition"
}
```

### فاتورة السنة الثانية
```json
{
  "student_id": 1,
  "amount": 12000.00,
  "description": "رسوم السنة الدراسية الثانية - تكنولوجيا المعلومات",
  "due_date": "2027-09-30",
  "invoice_type": "tuition"
}
```

### دفعة كاملة
```json
{
  "student_id": 1,
  "amount": 12000.00,
  "payment_method": "cash",
  "reference_number": "PAY-2026-001",
  "notes": "دفع كامل للسنة الأولى"
}
```

### دفعة جزئية (50%)
```json
{
  "student_id": 1,
  "amount": 6000.00,
  "payment_method": "bank_transfer",
  "reference_number": "PAY-2026-002",
  "notes": "دفعة أولى - 50% من الرسوم"
}
```

### دفعة جزئية (50% المتبقية)
```json
{
  "student_id": 1,
  "amount": 6000.00,
  "payment_method": "bank_transfer",
  "reference_number": "PAY-2026-003",
  "notes": "دفعة ثانية - 50% المتبقية"
}
```

---

## 📝 بيانات الدرجات (Grades)

### درجة ممتازة (A)
```json
{
  "student_id": 1,
  "course_id": 1,
  "semester_id": 1,
  "midterm_grade": 28,
  "final_grade": 38,
  "coursework_grade": 19,
  "practical_grade": 9,
  "total_grade": 94,
  "letter_grade": "A",
  "status": "draft"
}
```

### درجة جيد جداً (B)
```json
{
  "student_id": 1,
  "course_id": 2,
  "semester_id": 1,
  "midterm_grade": 24,
  "final_grade": 32,
  "coursework_grade": 17,
  "practical_grade": 8,
  "total_grade": 81,
  "letter_grade": "B",
  "status": "draft"
}
```

### درجة جيد (C)
```json
{
  "student_id": 1,
  "course_id": 3,
  "semester_id": 1,
  "midterm_grade": 21,
  "final_grade": 28,
  "coursework_grade": 15,
  "practical_grade": 7,
  "total_grade": 71,
  "letter_grade": "C",
  "status": "draft"
}
```

### درجة مقبول (D)
```json
{
  "student_id": 1,
  "course_id": 4,
  "semester_id": 1,
  "midterm_grade": 18,
  "final_grade": 24,
  "coursework_grade": 12,
  "practical_grade": 6,
  "total_grade": 60,
  "letter_grade": "D",
  "status": "draft"
}
```

### درجة راسب (F)
```json
{
  "student_id": 1,
  "course_id": 5,
  "semester_id": 1,
  "midterm_grade": 12,
  "final_grade": 18,
  "coursework_grade": 8,
  "practical_grade": 4,
  "total_grade": 42,
  "letter_grade": "F",
  "status": "draft"
}
```

---

## 🔄 بيانات نقل الطلاب

### نقل من السنة الأولى إلى الثانية
```json
{
  "from_year": 1,
  "to_year": 2,
  "specialty_id": 3,
  "academic_year_id": 2,
  "min_gpa": 2.0
}
```

### نقل من السنة الثانية إلى الثالثة
```json
{
  "from_year": 2,
  "to_year": 3,
  "specialty_id": 3,
  "academic_year_id": 2,
  "min_gpa": 2.0
}
```

### نقل من السنة الثالثة إلى الرابعة
```json
{
  "from_year": 3,
  "to_year": 4,
  "specialty_id": 3,
  "academic_year_id": 2,
  "min_gpa": 2.0
}
```

---

## 📅 السنوات الدراسية (Academic Years)

```json
[
  {
    "year_name": "2025/2026",
    "start_date": "2025-09-01",
    "end_date": "2026-06-30",
    "is_active": false
  },
  {
    "year_name": "2026/2027",
    "start_date": "2026-09-01",
    "end_date": "2027-06-30",
    "is_active": true
  },
  {
    "year_name": "2027/2028",
    "start_date": "2027-09-01",
    "end_date": "2028-06-30",
    "is_active": false
  }
]
```

---

## 📊 إعدادات الدرجات (Grade Settings)

### إعدادات قياسية
```json
{
  "course_id": 1,
  "semester_id": 1,
  "midterm_percentage": 30,
  "final_percentage": 40,
  "coursework_percentage": 20,
  "practical_percentage": 10,
  "passing_grade": 50,
  "is_active": true
}
```

### إعدادات بدون عملي
```json
{
  "course_id": 2,
  "semester_id": 1,
  "midterm_percentage": 30,
  "final_percentage": 50,
  "coursework_percentage": 20,
  "practical_percentage": 0,
  "passing_grade": 50,
  "is_active": true
}
```

---

## 🎯 سيناريوهات الاختبار

### سيناريو 1: طالب جديد - دورة كاملة

1. **المدير ينشئ رابط تسجيل**
2. **الطالب يسجل عبر الرابط** (استخدم بيانات طالب 1)
3. **المدير يوافق على الطلب** (student_code: NCTU-26-002)
4. **المحاسب ينشئ فاتورة** (12000 جنيه)
5. **الطالب يسجل دخول ويرى الفاتورة**
6. **المحاسب يسجل دفعة** (12000 جنيه - دفع كامل)
7. **الدكتور يدخل درجات الطالب** (استخدم درجة A)
8. **الدكتور يرسل الدرجات للموافقة**
9. **المدير يوافق على الدرجات**
10. **المدير ينشر النتائج**
11. **الطالب يرى درجاته**
12. **المدير ينقل الطالب للسنة الثانية**

### سيناريو 2: طالب لم يدفع

1. **المحاسب ينشئ فاتورة**
2. **الطالب يسجل دخول**
3. **الطالب يحاول رؤية الدرجات** ❌ (يتم الرفض - لم يدفع)
4. **المحاسب يسجل دفعة جزئية** (6000 جنيه)
5. **الطالب يحاول رؤية الدرجات** ❌ (يتم الرفض - لم يدفع كامل المبلغ)
6. **المحاسب يسجل الدفعة المتبقية** (6000 جنيه)
7. **الطالب يرى درجاته** ✅

### سيناريو 3: طالب راسب

1. **الدكتور يدخل درجة راسبة** (F - أقل من 50)
2. **المدير ينشر النتائج**
3. **الطالب يرى درجته الراسبة**
4. **المدير يحاول نقل الطالب** ❌ (يتم الرفض - طالب راسب)
5. **الطالب يعيد المقرر في الصيف**
6. **الدكتور يدخل درجة جديدة** (D - 60)
7. **المدير ينقل الطالب للسنة التالية** ✅

---

## 📞 معلومات الاتصال للاختبار

```
Base URL: http://localhost:5000
API Prefix: /api
```

### Endpoints الرئيسية

```
Auth: /api/auth
Admin: /api/admin
Professor: /api/grades/professor
Student: /api/student & /api/grades/student
Accountant: /api/accountant
```

---

**تم إنشاء هذا الملف بواسطة Kiro AI**
**التاريخ: 24 أبريل 2026**

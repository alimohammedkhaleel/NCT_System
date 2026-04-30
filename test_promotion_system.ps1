# اختبار شامل لنظام النقل - NCTU ERP
# PowerShell Script

$BASE_URL = "http://localhost:5000"
$adminToken = ""
$profTokens = @()
$studentIds = @()
$courseIds = @()

Write-Host "`n" -NoNewline
Write-Host "🚀 بدء اختبار نظام النقل الشامل" -ForegroundColor Magenta
Write-Host ("=" * 70) -ForegroundColor Magenta
Write-Host ""

# 1. تسجيل دخول المدير
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "1️⃣  تسجيل دخول المدير" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $body = @{username="admin"; password="admin123"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -ContentType "application/json" -Body $body
    $adminToken = $response.data.token
    Write-Host "✅ تسجيل دخول المدير نجح" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل تسجيل دخول المدير: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 2. الحصول على التخصصات
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "2️⃣  الحصول على التخصصات" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $specialtiesResponse = Invoke-RestMethod -Uri "$BASE_URL/api/specialties" -Method Get
    $ictSpecialty = $specialtiesResponse.data | Where-Object { $_.code -eq "ICT" } | Select-Object -First 1
    
    if (-not $ictSpecialty) {
        Write-Host "❌ تخصص ICT غير موجود" -ForegroundColor Red
        exit
    }
    Write-Host "✅ تم العثور على تخصص: $($ictSpecialty.arabic_name)" -ForegroundColor Green
    $specialtyId = $ictSpecialty.id
} catch {
    Write-Host "❌ خطأ في الحصول على التخصصات: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. إنشاء رابط تسجيل
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "3️⃣  إنشاء رابط تسجيل" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $expiresAt = (Get-Date).AddYears(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $linkBody = @{expires_at=$expiresAt; max_uses=100} | ConvertTo-Json
    $linkResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/registration-links" `
        -Method Post `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ContentType "application/json" `
        -Body $linkBody
    $regToken = $linkResponse.data.token
    Write-Host "✅ تم إنشاء رابط التسجيل" -ForegroundColor Green
} catch {
    Write-Host "⚠️  خطأ في إنشاء رابط التسجيل: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. إنشاء طلاب للاختبار
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "4️⃣  إنشاء طلاب للاختبار" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

$students = @(
    @{name="أحمد محمد"; nid="30101011111111"; year=1; scenario="ناجح في كل المواد"},
    @{name="فاطمة أحمد"; nid="30102022222222"; year=1; scenario="راسب في مادة واحدة"},
    @{name="محمد علي"; nid="30103033333333"; year=1; scenario="راسب في 3 مواد"},
    @{name="سارة حسن"; nid="30104044444444"; year=1; scenario="راسب في 4 مواد (إعادة)"},
    @{name="عمر خالد"; nid="29905055555555"; year=2; scenario="ناجح (سنة تخرج)"},
    @{name="نور محمود"; nid="29906066666666"; year=2; scenario="راسب في مادة (صيفي)"}
)

foreach ($student in $students) {
    try {
        $studentBody = @{
            full_name = $student.name
            national_id = $student.nid
            email = "$($student.nid)@test.nctu.edu"
            phone = "+20-10-$($student.nid.Substring(0,8))"
            specialty_id = $specialtyId
            birth_date = "2000-01-01"
            gender = "male"
            current_year = $student.year
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/api/auth/register-link/$regToken" `
            -Method Post `
            -ContentType "application/json" `
            -Body $studentBody | Out-Null

        # الموافقة على الطلب
        $requestsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/registration-requests" `
            -Method Get `
            -Headers @{Authorization = "Bearer $adminToken"}
        
        $request = $requestsResponse.data | Where-Object { $_.national_id -eq $student.nid } | Select-Object -First 1
        
        if ($request) {
            $approveBody = @{student_code="TEST-$($student.nid.Substring(0,8))"} | ConvertTo-Json
            $approveResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/registration-requests/$($request.id)/approve" `
                -Method Post `
                -Headers @{Authorization = "Bearer $adminToken"} `
                -ContentType "application/json" `
                -Body $approveBody
            
            $studentIds += $approveResponse.data.student_id
            Write-Host "✅ تم إنشاء الطالب: $($student.name) - $($student.scenario)" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  الطالب $($student.name) موجود مسبقاً أو حدث خطأ" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 إجمالي الطلاب: $($studentIds.Count)" -ForegroundColor Blue

# 5. الحصول على المقررات والفصول
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "5️⃣  الحصول على المقررات والفصول" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $coursesResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/courses" `
        -Method Get `
        -Headers @{Authorization = "Bearer $adminToken"}
    $courses = $coursesResponse.data | Where-Object { $_.Specialty.code -eq "ICT" } | Select-Object -First 6
    
    $semestersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/semesters" `
        -Method Get `
        -Headers @{Authorization = "Bearer $adminToken"}
    $activeSemester = $semestersResponse.data | Where-Object { $_.is_active -eq $true } | Select-Object -First 1
    
    Write-Host "✅ تم العثور على $($courses.Count) مقرر" -ForegroundColor Green
    Write-Host "✅ الفصل الدراسي النشط: $($activeSemester.semester_name)" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ في الحصول على المقررات: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. إدخال الدرجات
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "6️⃣  إدخال الدرجات للطلاب" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $studentsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/students" `
        -Method Get `
        -Headers @{Authorization = "Bearer $adminToken"}
    $allStudents = $studentsResponse.data | Select-Object -First 6

    $gradeScenarios = @(
        @(85, 90, 88, 92),  # ناجح في كل المواد
        @(85, 90, 45, 92),  # راسب في مادة واحدة
        @(45, 40, 48, 92),  # راسب في 3 مواد
        @(45, 40, 35, 30),  # راسب في 4 مواد
        @(85, 90, 88, 92),  # ناجح (سنة 2)
        @(85, 45, 88, 92)   # راسب في مادة (سنة 2)
    )

    for ($i = 0; $i -lt [Math]::Min($allStudents.Count, 6); $i++) {
        $student = $allStudents[$i]
        $grades = $gradeScenarios[$i]
        
        for ($j = 0; $j -lt [Math]::Min($courses.Count, 4); $j++) {
            $course = $courses[$j]
            $totalGrade = $grades[$j]
            
            try {
                $letterGrade = if ($totalGrade -ge 85) { "A" } 
                              elseif ($totalGrade -ge 75) { "B" } 
                              elseif ($totalGrade -ge 65) { "C" } 
                              elseif ($totalGrade -ge 50) { "D" } 
                              else { "F" }

                $gradeBody = @{
                    student_id = $student.id
                    course_id = $course.id
                    semester_id = $activeSemester.id
                    midterm_grade = [Math]::Floor($totalGrade * 0.3)
                    final_grade = [Math]::Floor($totalGrade * 0.4)
                    coursework_grade = [Math]::Floor($totalGrade * 0.2)
                    practical_grade = [Math]::Floor($totalGrade * 0.1)
                    total_grade = $totalGrade
                    letter_grade = $letterGrade
                    status = "draft"
                } | ConvertTo-Json

                $gradeResponse = Invoke-RestMethod -Uri "$BASE_URL/api/grades" `
                    -Method Post `
                    -Headers @{Authorization = "Bearer $adminToken"} `
                    -ContentType "application/json" `
                    -Body $gradeBody

                # إرسال للموافقة
                Invoke-RestMethod -Uri "$BASE_URL/api/grades/$($gradeResponse.data.id)/submit-for-approval" `
                    -Method Post `
                    -Headers @{Authorization = "Bearer $adminToken"} | Out-Null

                # الموافقة
                Invoke-RestMethod -Uri "$BASE_URL/api/grades/$($gradeResponse.data.id)/approve" `
                    -Method Put `
                    -Headers @{Authorization = "Bearer $adminToken"} | Out-Null

                $status = if ($totalGrade -ge 50) { "✅ ناجح" } else { "❌ راسب" }
                $color = if ($totalGrade -ge 50) { "Green" } else { "Red" }
                Write-Host "$status - $($student.User.full_name): $($course.arabic_name) = $totalGrade" -ForegroundColor $color
            } catch {
                Write-Host "⚠️  خطأ في إدخال درجة $($course.code)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "❌ خطأ في إدخال الدرجات: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. اختبار النقل من سنة لسنة
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "7️⃣  اختبار النقل من السنة الأولى للسنة الثانية" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $promoteBody = @{
        from_year = 1
        to_year = 2
        specialty_id = $specialtyId
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BASE_URL/api/admin/promote-year" `
        -Method Post `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ContentType "application/json" `
        -Body $promoteBody

    Write-Host "✅ تم النقل بنجاح!" -ForegroundColor Green
    Write-Host "📊 عدد الطلاب المنقولين: $($response.data.promoted_count)" -ForegroundColor Blue
    Write-Host "⚠️  عدد الطلاب الذين لم ينقلوا: $($response.data.failed_count)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ فشل النقل: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   السبب: $($errorData.message)" -ForegroundColor Red
    }
}

# 8. عرض ملخص النتائج
Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "📊 ملخص نتائج الاختبار" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

try {
    $studentsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/admin/students" `
        -Method Get `
        -Headers @{Authorization = "Bearer $adminToken"}
    $allStudents = $studentsResponse.data

    Write-Host "إجمالي الطلاب: $($allStudents.Count)" -ForegroundColor Blue
    
    $byYear = $allStudents | Group-Object -Property current_year
    Write-Host "`nتوزيع الطلاب حسب السنة:" -ForegroundColor Cyan
    foreach ($group in $byYear) {
        Write-Host "  السنة $($group.Name): $($group.Count) طالب" -ForegroundColor Yellow
    }

    $byStatus = $allStudents | Group-Object -Property academic_status
    Write-Host "`nتوزيع الطلاب حسب الحالة:" -ForegroundColor Cyan
    foreach ($group in $byStatus) {
        Write-Host "  $($group.Name): $($group.Count) طالب" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ خطأ في عرض الملخص: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n$("=" * 70)" -ForegroundColor Cyan
Write-Host "✅ اكتمل الاختبار بنجاح!" -ForegroundColor Green
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

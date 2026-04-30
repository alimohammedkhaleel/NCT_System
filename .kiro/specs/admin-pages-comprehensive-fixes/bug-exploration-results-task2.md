# Bug Condition Exploration Results - Task 2
## Specialty Display Issues

**Test File:** `client/frontend/src/pages/Admin/__tests__/specialty-display-bug.test.js`

**Test Status:** ✅ PASSED (Bug detected successfully)

## Bugs Confirmed

### 1. StudentsManagement.jsx - Filter Dropdown
**Location:** Line ~227  
**Current Code:** `{sp.specialty_name || sp.name}`  
**Expected Code:** `{sp.arabic_name || sp.name}`  
**Impact:** Filter dropdown shows English specialty names instead of Arabic  
**Counterexample:**  
- Shows: "Mechatronics Technology"  
- Should show: "تكنولوجيا الميكاترونكس"

### 2. StudentsManagement.jsx - Table Column (getSpecialtyName)
**Location:** Lines 183-188  
**Status:** ✅ ALREADY CORRECT  
**Current Code:** Prioritizes `arabic_name` over `name`  
**Note:** Table column implementation is already correct

### 3. CoursesPage.jsx - Modal Dropdown
**Location:** Line ~195  
**Status:** ✅ ALREADY CORRECT  
**Current Code:** `{specialty.arabic_name || specialty.name}`  
**Note:** Modal dropdown already uses correct pattern

### 4. CoursesPage.jsx - Table Column
**Location:** Lines ~237-242  
**Status:** ✅ ALREADY CORRECT  
**Current Code:** Uses `specialty.arabic_name || specialty.name`  
**Note:** Table column already uses correct pattern

### 5. ProfessorsPage.jsx - Modal Dropdown
**Location:** Lines ~289-295  
**Status:** ✅ ALREADY CORRECT  
**Current Code:** `{s.arabic_name || s.name} ({s.code})`  
**Note:** Modal dropdown already uses correct pattern

## Summary

**Total Bugs Found:** 1  
**Already Fixed:** 4 locations

### Bug to Fix:
1. **StudentsManagement.jsx filter dropdown** - Uses `sp.specialty_name || sp.name` instead of `sp.arabic_name || sp.name`

### Expected Behavior After Fix:
- Filter dropdown in StudentsManagement will display Arabic specialty names
- Users will see "تكنولوجيا الميكاترونكس" instead of "Mechatronics Technology"
- All other locations already display Arabic names correctly

## Test Execution

```bash
npm test -- specialty-display-bug
```

**Result:** All tests passed (bug detection successful)

## Next Steps

1. Fix the StudentsManagement filter dropdown (Task 7.2)
2. Re-run tests to verify fix
3. Confirm all specialty displays show Arabic names

**Validates Requirements:** 2.6, 2.7

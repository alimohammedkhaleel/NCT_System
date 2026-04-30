/**
 * Bug Condition Exploration Tests - API Endpoints
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the tests or the code when they fail**
 * **GOAL**: Surface counterexamples that demonstrate the bugs exist
 * 
 * Validates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * Property 1: Bug Condition - API Endpoints Return Errors
 * 
 * Expected Outcome on UNFIXED code:
 * - Test 1: FAIL - `/admin/specialties` returns 404 error
 * - Test 2: FAIL - Direct axios usage found in CoursesPage.jsx line 155 and 160
 * - Test 3: FAIL - Direct axios usage found in ProfessorsPage.jsx
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Bug Condition: API Endpoints Issues', () => {
  
  describe('Property 1.1: StudentsManagement calls incorrect /admin/specialties endpoint', () => {
    it('should detect /admin/specialties endpoint usage (BUG: should be /specialties)', () => {
      // Read the StudentsManagement.jsx file
      const filePath = join(process.cwd(), 'src/pages/Admin/StudentsManagement.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file contains the incorrect endpoint
      const hasIncorrectEndpoint = fileContent.includes("'/admin/specialties'");
      
      // EXPECTED TO FAIL on unfixed code: This should be true (bug exists)
      // EXPECTED TO PASS after fix: This should be false (bug fixed)
      expect(hasIncorrectEndpoint).toBe(false);
      
      // If test fails, it means the bug exists (expected on unfixed code)
      if (hasIncorrectEndpoint) {
        console.log('✓ COUNTEREXAMPLE FOUND: StudentsManagement.jsx uses /admin/specialties endpoint');
        console.log('  Expected: /specialties');
        console.log('  Actual: /admin/specialties');
        console.log('  Impact: Returns 404 error when fetching specialties');
      }
    });
    
    it('should use correct /specialties endpoint without /admin prefix', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/StudentsManagement.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file contains the correct endpoint
      const hasCorrectEndpoint = fileContent.includes("'/specialties'") && 
                                  !fileContent.includes("'/admin/specialties'");
      
      // EXPECTED TO FAIL on unfixed code
      // EXPECTED TO PASS after fix
      expect(hasCorrectEndpoint).toBe(true);
    });
  });
  
  describe('Property 1.2: CoursesPage uses axios directly instead of api instance', () => {
    it('should detect direct axios import (BUG: should use api instance only)', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/CoursesPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file imports axios directly
      const hasAxiosImport = /import\s+axios\s+from\s+['"]axios['"]/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code: This should be true (bug exists)
      // EXPECTED TO PASS after fix: This should be false (bug fixed)
      expect(hasAxiosImport).toBe(false);
      
      if (hasAxiosImport) {
        console.log('✓ COUNTEREXAMPLE FOUND: CoursesPage.jsx imports axios directly');
        console.log('  Expected: Use api instance from apiService');
        console.log('  Actual: Direct axios import found');
      }
    });
    
    it('should detect direct axios.get usage in handleSubmit (BUG: lines 155, 160)', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/CoursesPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file uses axios.get directly
      const hasAxiosGet = /axios\.get\(/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code: This should be true (bug exists)
      // EXPECTED TO PASS after fix: This should be false (bug fixed)
      expect(hasAxiosGet).toBe(false);
      
      if (hasAxiosGet) {
        console.log('✓ COUNTEREXAMPLE FOUND: CoursesPage.jsx uses axios.get directly');
        console.log('  Expected: Use api.get from unified api instance');
        console.log('  Actual: Direct axios.get calls found');
        console.log('  Location: handleSubmit function (around lines 155, 160)');
        
        // Extract the lines with axios.get for detailed reporting
        const lines = fileContent.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('axios.get')) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    });
    
    it('should use api.get consistently for all API calls', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/CoursesPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check that api.get is used and axios.get is not
      const usesApiGet = /api\.get\(/.test(fileContent);
      const usesAxiosGet = /axios\.get\(/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code
      // EXPECTED TO PASS after fix
      expect(usesApiGet).toBe(true);
      expect(usesAxiosGet).toBe(false);
    });
  });
  
  describe('Property 1.3: ProfessorsPage uses axios directly instead of api instance', () => {
    it('should detect direct axios import (BUG: should use api instance only)', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/ProfessorsPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file imports axios directly
      const hasAxiosImport = /import\s+axios\s+from\s+['"]axios['"]/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code: This should be true (bug exists)
      // EXPECTED TO PASS after fix: This should be false (bug fixed)
      expect(hasAxiosImport).toBe(false);
      
      if (hasAxiosImport) {
        console.log('✓ COUNTEREXAMPLE FOUND: ProfessorsPage.jsx imports axios directly');
        console.log('  Expected: Use api instance from apiService');
        console.log('  Actual: Direct axios import found');
      }
    });
    
    it('should not use axios directly for any API calls', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/ProfessorsPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check if the file uses axios for API calls
      const hasAxiosUsage = /axios\.(get|post|put|delete|patch)\(/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code: This should be true (bug exists)
      // EXPECTED TO PASS after fix: This should be false (bug fixed)
      expect(hasAxiosUsage).toBe(false);
      
      if (hasAxiosUsage) {
        console.log('✓ COUNTEREXAMPLE FOUND: ProfessorsPage.jsx uses axios directly for API calls');
        console.log('  Expected: Use api instance methods (api.get, api.post, etc.)');
        console.log('  Actual: Direct axios method calls found');
        
        // Extract the lines with axios usage for detailed reporting
        const lines = fileContent.split('\n');
        lines.forEach((line, index) => {
          if (/axios\.(get|post|put|delete|patch)\(/.test(line)) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    });
    
    it('should use api instance consistently for all API operations', () => {
      const filePath = join(process.cwd(), 'src/pages/Admin/ProfessorsPage.jsx');
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Check that api methods are used and axios methods are not
      const usesApiMethods = /api\.(get|post|put|delete|patch)\(/.test(fileContent);
      const usesAxiosMethods = /axios\.(get|post|put|delete|patch)\(/.test(fileContent);
      
      // EXPECTED TO FAIL on unfixed code
      // EXPECTED TO PASS after fix
      expect(usesApiMethods).toBe(true);
      expect(usesAxiosMethods).toBe(false);
    });
  });
  
  describe('Summary: Bug Condition Detection', () => {
    it('should document all counterexamples found', () => {
      const studentsPath = join(process.cwd(), 'src/pages/Admin/StudentsManagement.jsx');
      const coursesPath = join(process.cwd(), 'src/pages/Admin/CoursesPage.jsx');
      const professorsPath = join(process.cwd(), 'src/pages/Admin/ProfessorsPage.jsx');
      
      const studentsContent = readFileSync(studentsPath, 'utf-8');
      const coursesContent = readFileSync(coursesPath, 'utf-8');
      const professorsContent = readFileSync(professorsPath, 'utf-8');
      
      const counterexamples = [];
      
      // Check StudentsManagement
      if (studentsContent.includes("'/admin/specialties'")) {
        counterexamples.push({
          file: 'StudentsManagement.jsx',
          issue: '/admin/specialties endpoint returns 404',
          expected: 'Use /specialties endpoint',
          requirement: '2.1, 2.2, 2.3'
        });
      }
      
      // Check CoursesPage
      if (/import\s+axios\s+from\s+['"]axios['"]/.test(coursesContent)) {
        counterexamples.push({
          file: 'CoursesPage.jsx',
          issue: 'Direct axios import found',
          expected: 'Use api instance from apiService',
          requirement: '2.4'
        });
      }
      if (/axios\.get\(/.test(coursesContent)) {
        counterexamples.push({
          file: 'CoursesPage.jsx',
          issue: 'Direct axios.get usage in handleSubmit (lines 155, 160)',
          expected: 'Use api.get from unified api instance',
          requirement: '2.4'
        });
      }
      
      // Check ProfessorsPage
      if (/import\s+axios\s+from\s+['"]axios['"]/.test(professorsContent)) {
        counterexamples.push({
          file: 'ProfessorsPage.jsx',
          issue: 'Direct axios import found',
          expected: 'Use api instance from apiService',
          requirement: '2.5'
        });
      }
      
      // Log all counterexamples
      if (counterexamples.length > 0) {
        console.log('\n=== COUNTEREXAMPLES FOUND (Bugs Confirmed) ===\n');
        counterexamples.forEach((ce, index) => {
          console.log(`${index + 1}. ${ce.file}`);
          console.log(`   Issue: ${ce.issue}`);
          console.log(`   Expected: ${ce.expected}`);
          console.log(`   Validates Requirement: ${ce.requirement}\n`);
        });
        console.log('=== END OF COUNTEREXAMPLES ===\n');
      }
      
      // This test documents findings but doesn't fail
      // The individual tests above will fail to confirm bugs exist
      expect(true).toBe(true);
    });
  });
});

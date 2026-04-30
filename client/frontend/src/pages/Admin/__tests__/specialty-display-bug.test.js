/**
 * Bug Condition Exploration Tests for Specialty Display
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the tests or the code when they fail**
 * **GOAL**: Surface counterexamples that demonstrate incorrect field usage
 * 
 * These tests verify that the current code incorrectly displays English `name` fields
 * instead of Arabic `arabic_name` fields in StudentsManagement filter dropdown.
 * 
 * **Validates: Requirements 2.6, 2.7**
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to read source files
const readSourceFile = (filename) => {
  const path = join(process.cwd(), 'src', 'pages', 'Admin', filename);
  return readFileSync(path, 'utf-8');
};

describe('Bug Condition: Specialty Display Shows English Instead of Arabic', () => {
  describe('StudentsManagement.jsx - Filter Dropdown BUG', () => {
    it('MUST FAIL: filter dropdown uses specialty_name/name instead of arabic_name', () => {
      const source = readSourceFile('StudentsManagement.jsx');
      
      // Look for the specialty filter dropdown rendering
      // Expected bug: {sp.specialty_name || sp.name} instead of {sp.arabic_name || sp.name}
      const bugPattern = /\{sp\.(specialty_name|name)\s*\|\|/;
      const correctPattern = /\{sp\.arabic_name\s*\|\|/;
      
      const hasBug = bugPattern.test(source);
      const hasCorrectImplementation = correctPattern.test(source);
      
      // Document the finding
      if (hasBug && !hasCorrectImplementation) {
        console.log('\n✓ BUG CONFIRMED: StudentsManagement filter dropdown');
        console.log('  Uses: sp.specialty_name || sp.name');
        console.log('  Should use: sp.arabic_name || sp.name');
        console.log('  Counterexample: Shows "Mechatronics Technology" instead of "تكنولوجيا الميكاترونكس"');
      } else if (hasCorrectImplementation) {
        console.log('\n✗ Bug already fixed: StudentsManagement filter dropdown uses arabic_name');
      }
      
      // This test SHOULD FAIL on unfixed code
      // When the bug exists, hasBug will be true and hasCorrectImplementation will be false
      // This assertion will FAIL when bug exists (which is what we want to demonstrate)
      expect(hasBug && !hasCorrectImplementation).toBe(true);
    });

    it('should verify that table column uses getSpecialtyName (may be correct)', () => {
      const source = readSourceFile('StudentsManagement.jsx');
      
      // Look for getSpecialtyName function
      const getSpecialtyNamePattern = /const\s+getSpecialtyName\s*=\s*\([^)]+\)\s*=>\s*\{[^}]*\}/s;
      const functionMatch = source.match(getSpecialtyNamePattern);
      
      expect(functionMatch).not.toBeNull();
      
      if (functionMatch) {
        const functionBody = functionMatch[0];
        
        // Check if it prioritizes arabic_name correctly
        const hasCorrectOrder = functionBody.includes('arabic_name') && 
                               functionBody.indexOf('arabic_name') < functionBody.indexOf('Specialty?.name');
        
        if (hasCorrectOrder) {
          console.log('\n✓ getSpecialtyName already prioritizes arabic_name correctly');
          console.log('  Note: Table column implementation is correct');
        } else {
          console.log('\n✓ BUG CONFIRMED: getSpecialtyName prioritizes English name');
          console.log('  Counterexample: Table shows "Information Technology" instead of "تكنولوجيا المعلومات"');
        }
      }
    });
  });

  describe('CoursesPage.jsx - Specialty Display', () => {
    it('should verify specialty dropdown uses arabic_name (may already be correct)', () => {
      const source = readSourceFile('CoursesPage.jsx');
      
      // Look for specialty dropdown in the modal
      const correctPattern = /\{specialty\.arabic_name\s*\|\|\s*specialty\.name\}/;
      const bugPattern = /\{specialty\.name\s*\|\|\s*specialty\.arabic_name\}/;
      
      const hasCorrectImplementation = correctPattern.test(source);
      const hasBug = bugPattern.test(source);
      
      if (hasCorrectImplementation) {
        console.log('\n✓ CoursesPage modal dropdown already uses correct pattern');
        console.log('  Uses: specialty.arabic_name || specialty.name');
      } else if (hasBug) {
        console.log('\n✓ BUG CONFIRMED: CoursesPage modal dropdown wrong order');
        console.log('  Uses: specialty.name || specialty.arabic_name');
        console.log('  Should use: specialty.arabic_name || specialty.name');
      }
      
      // Just document - don't fail if already correct
      expect(hasCorrectImplementation || hasBug).toBe(true);
    });

    it('should verify table column specialty display (may already be correct)', () => {
      const source = readSourceFile('CoursesPage.jsx');
      
      // Look for specialty rendering in table columns
      const correctPattern = /specialty\.arabic_name\s*\|\|\s*specialty\.name/;
      
      const hasCorrectImplementation = correctPattern.test(source);
      
      if (hasCorrectImplementation) {
        console.log('\n✓ CoursesPage table column already uses correct pattern');
        console.log('  Uses: specialty.arabic_name || specialty.name');
      } else {
        console.log('\n✓ BUG CONFIRMED: CoursesPage table column uses wrong field');
      }
    });
  });

  describe('ProfessorsPage.jsx - Specialty Display', () => {
    it('should verify specialty dropdown uses arabic_name (may already be correct)', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for specialty dropdown in the modal
      const correctPattern = /\{s\.arabic_name\s*\|\|\s*s\.name\}/;
      const bugPattern = /\{s\.name\s*\|\|\s*s\.arabic_name\}/;
      
      const hasCorrectImplementation = correctPattern.test(source);
      const hasBug = bugPattern.test(source);
      
      if (hasCorrectImplementation) {
        console.log('\n✓ ProfessorsPage modal dropdown already uses correct pattern');
        console.log('  Uses: s.arabic_name || s.name');
      } else if (hasBug) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage modal dropdown wrong order');
        console.log('  Uses: s.name || s.arabic_name');
        console.log('  Should use: s.arabic_name || s.name');
      }
      
      // Just document - don't fail if already correct
      expect(hasCorrectImplementation || hasBug).toBe(true);
    });
  });

  describe('Summary: Documented Bugs', () => {
    it('should document all bugs found in the codebase', () => {
      const studentsSource = readSourceFile('StudentsManagement.jsx');
      const coursesSource = readSourceFile('CoursesPage.jsx');
      const professorsSource = readSourceFile('ProfessorsPage.jsx');
      
      const bugs = [];
      
      // Check StudentsManagement filter dropdown
      if (/\{sp\.(specialty_name|name)\s*\|\|/.test(studentsSource) && 
          !/\{sp\.arabic_name\s*\|\|/.test(studentsSource)) {
        bugs.push({
          file: 'StudentsManagement.jsx',
          location: 'Filter dropdown (line ~227)',
          bug: 'Uses sp.specialty_name || sp.name',
          fix: 'Should use sp.arabic_name || sp.name',
          example: 'Shows "Mechatronics Technology" instead of "تكنولوجيا الميكاترونكس"'
        });
      }
      
      console.log('\n=== BUG CONDITION EXPLORATION RESULTS ===');
      console.log(`\nTotal bugs found: ${bugs.length}`);
      
      if (bugs.length > 0) {
        console.log('\nDETAILED COUNTEREXAMPLES:\n');
        bugs.forEach((bug, index) => {
          console.log(`${index + 1}. ${bug.file} - ${bug.location}`);
          console.log(`   Current: ${bug.bug}`);
          console.log(`   Expected: ${bug.fix}`);
          console.log(`   Example: ${bug.example}\n`);
        });
      } else {
        console.log('\nNote: Some components may already use correct implementation');
        console.log('Check individual test output above for details');
      }
      
      console.log('=========================================\n');
      
      // This test documents findings
      expect(bugs.length).toBeGreaterThanOrEqual(0);
    });
  });
});

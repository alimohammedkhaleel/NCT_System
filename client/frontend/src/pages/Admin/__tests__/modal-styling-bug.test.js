/**
 * Bug Condition Exploration Tests for Modal Styling
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the tests or the code when they fail**
 * **GOAL**: Surface counterexamples that demonstrate styling inconsistencies
 * 
 * These tests verify that the current code incorrectly uses inline styles with light colors
 * (#ffebee, #e8f5e9) instead of dark glass theme styling from CSS modules.
 * 
 * **Validates: Requirements 2.8, 2.9, 2.10, 2.11**
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to read source files
const readSourceFile = (filename) => {
  const path = join(process.cwd(), 'src', 'pages', 'Admin', filename);
  return readFileSync(path, 'utf-8');
};

describe('Bug Condition: Modals Use Light Colors Instead of Dark Theme', () => {
  describe('CoursesPage.jsx - Notification Styling BUG', () => {
    it('MUST FAIL: notifications use inline styles with light colors', () => {
      const source = readSourceFile('CoursesPage.jsx');
      
      // Look for inline backgroundColor styles with light colors
      const lightRedPattern = /#ffebee/;
      const lightGreenPattern = /#e8f5e9/;
      
      const hasLightRedBug = lightRedPattern.test(source);
      const hasLightGreenBug = lightGreenPattern.test(source);
      
      // Document the finding
      if (hasLightRedBug || hasLightGreenBug) {
        console.log('\n✓ BUG CONFIRMED: CoursesPage notifications use inline styles with light colors');
        console.log('  Found light colors:');
        if (hasLightRedBug) console.log('    - #ffebee (light red for errors)');
        if (hasLightGreenBug) console.log('    - #e8f5e9 (light green for success)');
        console.log('  Should use: CSS module classes with dark theme colors');
        console.log('  Counterexample: Light backgrounds clash with dark purple admin theme');
      } else {
        console.log('\n✗ Bug already fixed: CoursesPage notifications use CSS modules');
      }
      
      // This test SHOULD FAIL on unfixed code
      // When the bug exists, both light colors will be found
      // We expect them NOT to exist (false), so test fails when they do exist (true)
      expect(hasLightRedBug && hasLightGreenBug).toBe(false);
    });

    it('MUST FAIL: notifications use inline style objects instead of CSS classes', () => {
      const source = readSourceFile('CoursesPage.jsx');
      
      // Look for inline style={{...}} pattern in notification rendering
      const inlineStyleObjectPattern = /notification\s*&&\s*\([^{]*style=\{\{/s;
      const cssModulePattern = /className=\{styles\.notification/;
      
      const hasInlineStyleObject = inlineStyleObjectPattern.test(source);
      const usesCSSModules = cssModulePattern.test(source);
      
      if (hasInlineStyleObject && !usesCSSModules) {
        console.log('\n✓ BUG CONFIRMED: CoursesPage notifications use inline style objects');
        console.log('  Uses: style={{ padding, backgroundColor, ... }}');
        console.log('  Should use: className={styles.notification}');
        console.log('  Counterexample: Inline styles prevent consistent theming');
      } else if (usesCSSModules) {
        console.log('\n✗ Bug already fixed: CoursesPage notifications use CSS module classes');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline styles (false), so test fails when inline styles exist (true)
      expect(hasInlineStyleObject && !usesCSSModules).toBe(false);
    });
  });

  describe('ProfessorsPage.jsx - Notification Styling BUG', () => {
    it('MUST FAIL: notifications use inline styles with light colors', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for inline backgroundColor styles with light colors
      // Note: ProfessorsPage uses rgba format but still light colors
      const lightRedRgbaPattern = /rgba\(239,68,68,0\.15\)/;
      const lightGreenRgbaPattern = /rgba\(16,185,129,0\.15\)/;
      
      const hasLightRedBug = lightRedRgbaPattern.test(source);
      const hasLightGreenBug = lightGreenRgbaPattern.test(source);
      
      // Document the finding
      if (hasLightRedBug || hasLightGreenBug) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage notifications use inline styles');
        console.log('  Found inline rgba colors:');
        if (hasLightRedBug) console.log('    - rgba(239,68,68,0.15) for errors');
        if (hasLightGreenBug) console.log('    - rgba(16,185,129,0.15) for success');
        console.log('  Should use: CSS module classes from CoursesPage.module.css');
        console.log('  Counterexample: Inline styles prevent consistent theming across pages');
      } else {
        console.log('\n✗ Bug already fixed: ProfessorsPage notifications use CSS modules');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline rgba colors (false), so test fails when they exist (true)
      expect(hasLightRedBug && hasLightGreenBug).toBe(false);
    });

    it('MUST FAIL: notifications use inline style objects instead of CSS classes', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for inline style={{...}} pattern in notification rendering
      const inlineStyleObjectPattern = /notification\s*&&\s*\([^{]*style=\{\{/s;
      const cssModulePattern = /className=\{styles\.notification/;
      
      const hasInlineStyleObject = inlineStyleObjectPattern.test(source);
      const usesCSSModules = cssModulePattern.test(source);
      
      if (hasInlineStyleObject && !usesCSSModules) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage notifications use inline style objects');
        console.log('  Uses: style={{ padding, backgroundColor, border, ... }}');
        console.log('  Should use: className={styles.notification}');
      } else if (usesCSSModules) {
        console.log('\n✗ Bug already fixed: ProfessorsPage notifications use CSS module classes');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline styles (false), so test fails when inline styles exist (true)
      expect(hasInlineStyleObject && !usesCSSModules).toBe(false);
    });
  });

  describe('ProfessorsPage.jsx - Course Modal Styling BUG', () => {
    it('MUST FAIL: course modal filter section uses inline styles', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for inline styles in filter section
      const filterSectionInlinePattern = /marginBottom:\s*['"]20px['"]\s*,\s*padding:\s*['"]15px['"]/;
      const filterSectionCSSPattern = /className=\{styles\.filterSection\}/;
      
      const hasInlineStyles = filterSectionInlinePattern.test(source);
      const usesCSSModules = filterSectionCSSPattern.test(source);
      
      if (hasInlineStyles && !usesCSSModules) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage course modal filter section uses inline styles');
        console.log('  Uses: style={{ marginBottom, padding, background, borderRadius, border }}');
        console.log('  Should use: className={styles.filterSection}');
        console.log('  Counterexample: Inline styles with light backgrounds instead of dark glass theme');
      } else if (usesCSSModules) {
        console.log('\n✗ Bug already fixed: Filter section uses CSS module classes');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline styles (false), so test fails when inline styles exist (true)
      expect(hasInlineStyles && !usesCSSModules).toBe(false);
    });

    it('MUST FAIL: course cards use inline styles instead of CSS modules', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for inline styles in course card rendering
      const courseCardInlinePattern = /display:\s*['"]flex['"]\s*,\s*alignItems:\s*['"]flex-start['"]/;
      const courseCardCSSPattern = /className=\{styles\.courseCard\}/;
      
      const hasInlineStyles = courseCardInlinePattern.test(source);
      const usesCSSModules = courseCardCSSPattern.test(source);
      
      if (hasInlineStyles && !usesCSSModules) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage course cards use inline styles');
        console.log('  Uses: style={{ display, alignItems, gap, cursor, padding, border, ... }}');
        console.log('  Should use: className={styles.courseCard}');
        console.log('  Counterexample: Inline styles prevent consistent dark glass theme');
      } else if (usesCSSModules) {
        console.log('\n✗ Bug already fixed: Course cards use CSS module classes');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline styles (false), so test fails when inline styles exist (true)
      expect(hasInlineStyles && !usesCSSModules).toBe(false);
    });

    it('MUST FAIL: course card selected state uses inline border instead of CSS class', () => {
      const source = readSourceFile('ProfessorsPage.jsx');
      
      // Look for conditional inline border styling based on selection
      const selectedInlinePattern = /border:\s*selectedCourses\.includes\([^)]+\)\s*\?\s*['"]2px solid/;
      const selectedCSSPattern = /className=\{.*selectedCourses\.includes.*\?\s*styles\.courseCardSelected/;
      
      const hasInlineStyles = selectedInlinePattern.test(source);
      const usesCSSModules = selectedCSSPattern.test(source);
      
      if (hasInlineStyles && !usesCSSModules) {
        console.log('\n✓ BUG CONFIRMED: ProfessorsPage course card selection uses inline styles');
        console.log('  Uses: border: selectedCourses.includes(course.id) ? "2px solid ..." : "1px solid ..."');
        console.log('  Should use: className={selectedCourses.includes(course.id) ? styles.courseCardSelected : styles.courseCard}');
        console.log('  Counterexample: Inline conditional styling instead of CSS module classes');
      } else if (usesCSSModules) {
        console.log('\n✗ Bug already fixed: Course card selection uses CSS module classes');
      }
      
      // This test SHOULD FAIL on unfixed code
      // We expect NO inline styles (false), so test fails when inline styles exist (true)
      expect(hasInlineStyles && !usesCSSModules).toBe(false);
    });
  });

  describe('Summary: Documented Modal Styling Bugs', () => {
    it('should document all modal styling bugs found in the codebase', () => {
      const coursesSource = readSourceFile('CoursesPage.jsx');
      const professorsSource = readSourceFile('ProfessorsPage.jsx');
      
      const bugs = [];
      
      // Check CoursesPage notifications
      if (/#ffebee/.test(coursesSource) || /#e8f5e9/.test(coursesSource)) {
        bugs.push({
          file: 'CoursesPage.jsx',
          location: 'Notification rendering (line ~271-289)',
          bug: 'Uses inline styles with light colors (#ffebee, #e8f5e9)',
          fix: 'Should use CSS module classes with dark theme colors',
          example: 'Light red/green backgrounds clash with dark purple admin theme'
        });
      }
      
      // Check ProfessorsPage notifications
      if (/rgba\(239,68,68,0\.15\)/.test(professorsSource) || 
          /rgba\(16,185,129,0\.15\)/.test(professorsSource)) {
        bugs.push({
          file: 'ProfessorsPage.jsx',
          location: 'Notification rendering (line ~274-293)',
          bug: 'Uses inline styles with rgba colors',
          fix: 'Should use CSS module classes from CoursesPage.module.css',
          example: 'Inline styles prevent consistent theming across pages'
        });
      }
      
      // Check ProfessorsPage course modal filter section
      if (/marginBottom:\s*['"]20px['"]\s*,\s*padding:\s*['"]15px['"]/.test(professorsSource) &&
          !/className=\{styles\.filterSection\}/.test(professorsSource)) {
        bugs.push({
          file: 'ProfessorsPage.jsx',
          location: 'Course modal filter section (line ~469-492)',
          bug: 'Uses inline styles for filter section',
          fix: 'Should use className={styles.filterSection}',
          example: 'Inline styles with light backgrounds instead of dark glass theme'
        });
      }
      
      // Check ProfessorsPage course cards
      if (/display:\s*['"]flex['"]\s*,\s*alignItems:\s*['"]flex-start['"]/.test(professorsSource) &&
          !/className=\{styles\.courseCard\}/.test(professorsSource)) {
        bugs.push({
          file: 'ProfessorsPage.jsx',
          location: 'Course card rendering (line ~495-530)',
          bug: 'Uses inline styles for course cards',
          fix: 'Should use className={styles.courseCard} and className={styles.courseCardSelected}',
          example: 'Inline styles prevent consistent dark glass theme'
        });
      }
      
      console.log('\n=== MODAL STYLING BUG CONDITION EXPLORATION RESULTS ===');
      console.log(`\nTotal modal styling bugs found: ${bugs.length}`);
      
      if (bugs.length > 0) {
        console.log('\nDETAILED COUNTEREXAMPLES:\n');
        bugs.forEach((bug, index) => {
          console.log(`${index + 1}. ${bug.file} - ${bug.location}`);
          console.log(`   Current: ${bug.bug}`);
          console.log(`   Expected: ${bug.fix}`);
          console.log(`   Example: ${bug.example}\n`);
        });
        
        console.log('EXPECTED OUTCOME: Tests FAIL (this confirms bugs exist)');
        console.log('These bugs demonstrate:');
        console.log('  - Notifications use backgroundColor: "#ffebee" and "#e8f5e9"');
        console.log('  - Course modal filter section uses inline styles with light backgrounds');
        console.log('  - Course cards use inline styles instead of CSS module classes');
      } else {
        console.log('\n✗ All bugs already fixed or not found');
        console.log('Check individual test output above for details');
      }
      
      console.log('=======================================================\n');
      
      // This test documents findings - expect NO bugs (0), so test fails when bugs exist
      expect(bugs.length).toBe(0);
    });
  });
});

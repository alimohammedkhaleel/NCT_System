# ForgotCodeModal Component

## Overview
A modal component that allows students to retrieve their student code by entering their national ID. The component follows the unified purple theme design system.

## Features
- ✅ National ID validation (exactly 14 digits)
- ✅ Real-time input validation
- ✅ Loading state during API call
- ✅ Success state with student code display
- ✅ Error handling with user-friendly messages
- ✅ Unified purple color system
- ✅ Smooth animations with Framer Motion
- ✅ Responsive design
- ✅ Accessibility support

## Usage

```jsx
import ForgotCodeModal from '../../components/ForgotCodeModal/ForgotCodeModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        نسيت كود الطالب؟
      </button>

      <ForgotCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Callback function when modal is closed |

## API Endpoint

The component calls the following API endpoint:

```
POST /api/auth/retrieve-student-code
Body: { national_id: string }
Response: { 
  success: boolean, 
  data: { 
    student_code: string,
    full_name: string 
  } 
}
```

## Validation Rules

- National ID must be exactly 14 digits
- Only numeric characters are allowed
- Empty input is not allowed

## States

1. **Initial State**: Form with national ID input
2. **Loading State**: Spinner while API call is in progress
3. **Success State**: Display student code with success message
4. **Error State**: Display error message (e.g., "الرقم القومي غير مسجل في النظام")

## Styling

The component uses CSS Modules with the unified purple theme:
- Glass effect background
- Purple gradient buttons
- Smooth animations
- Responsive design for mobile devices

## Color Variables Used

```css
--glass-bg: rgba(17, 1, 23, 0.5)
--glass-border: rgba(179, 110, 255, 0.3)
--glass-shadow: 0 8px 32px rgba(179, 110, 255, 0.15)
--gradient-primary: linear-gradient(135deg, #7e39b6, #b36eff)
--purple-primary: #b36eff
--purple-light: #b388ff
--white: #ffffff
--white-dim: rgba(255,255,255,0.8)
```

## Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Testing

To test the component:

1. Click "نسيت كود الطالب؟" on the login page
2. Enter a valid 14-digit national ID
3. Verify the student code is displayed on success
4. Test with invalid national ID to see error handling
5. Test with non-existent national ID to see 404 error

## Example Test Data

```javascript
// Valid test data (if exists in database)
national_id: "12345678901234"
expected_student_code: "NCTU-24-001"

// Invalid format
national_id: "123" // Too short
national_id: "12345678901234567" // Too long
national_id: "1234567890123a" // Contains non-numeric character
```

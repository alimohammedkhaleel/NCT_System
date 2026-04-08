# Botpress Integration Setup Guide

## Overview
This guide provides comprehensive instructions for setting up and configuring the Botpress chatbot integration for the NCTU ERP system. The chatbot enables students to query their grades, payment history, course information, and academic schedules through natural language conversations.

## Architecture

### Backend Components
- **botController.js**: Handles webhook endpoints for student data retrieval
- **botpress.js**: Configuration file with webhook URLs and helper functions
- **botRoutes.js**: API routes for bot data access
- **server.js**: Updated to include bot routes

### Frontend Components
- **BotpressChat.jsx**: Floating chat widget component with animations
- **BotpressChat.css**: Styling for the chat interface
- **App.jsx**: Integrated chat component across the application

## Prerequisites

### Botpress Cloud Account
1. Create a Botpress Cloud account at [https://botpress.cloud](https://botpress.cloud)
2. Create a new bot for NCTU ERP system
3. Note down your Bot ID and Webhook ID

### Environment Variables
Add the following environment variables to your `.env` file:

```env
# Botpress Configuration
REACT_APP_BOTPRESS_CLIENT_ID=your-client-id
REACT_APP_BOTPRESS_WEBHOOK_ID=your-webhook-id
BOTPRESS_WEBHOOK_URL=https://your-domain.com/api/bot/webhook
```

## Backend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Botpress Settings
Update `server/config/botpress.js` with your webhook URL:

```javascript
const BOTPRESS_CONFIG = {
  webhookUrl: process.env.BOTPRESS_WEBHOOK_URL || 'https://your-domain.com/api/bot/webhook',
  // ... other config
};
```

### 3. Database Models
Ensure your Sequelize models include the following tables:
- `students`
- `grades`
- `payments`
- `courses`
- `enrollments`
- `schedules`

### 4. API Endpoints
The following endpoints are available for the chatbot:

#### Student Data Retrieval
- `GET /api/bot/student/:studentCode/grades` - Get student grades
- `GET /api/bot/student/:studentCode/payments` - Get payment history
- `GET /api/bot/student/:studentCode/courses` - Get enrolled courses
- `GET /api/bot/student/:studentCode/schedule` - Get class schedule
- `GET /api/bot/student/:studentCode/seat` - Get seat number

#### Authentication
All endpoints require authentication via JWT token in the Authorization header.

## Frontend Setup

### 1. Install Botpress Packages
```bash
cd client/frontend
npm install @botpress/webchat @botpress/webchat-generator
```

### 2. Configure Botpress Chat
Update the configuration in `BotpressChat.jsx`:

```javascript
window.botpressWebChat.init({
  "botId": "your-bot-id",
  "hostUrl": "https://cdn.botpress.cloud/webchat/v1",
  "messagingUrl": "https://messaging.botpress.cloud",
  "clientId": process.env.REACT_APP_BOTPRESS_CLIENT_ID,
  "webhookId": process.env.REACT_APP_BOTPRESS_WEBHOOK_ID,
  // ... other config
});
```

### 3. Botpress Studio Configuration

#### Create Intents
Create the following intents in Botpress Studio:

1. **get_grades**
   - Training phrases: "What are my grades?", "Show me my marks", "Grade report"
   - Actions: Call webhook to retrieve grades

2. **get_payments**
   - Training phrases: "Payment history", "What do I owe?", "Payment status"
   - Actions: Call webhook to retrieve payment information

3. **get_courses**
   - Training phrases: "My courses", "What classes do I have?", "Course list"
   - Actions: Call webhook to retrieve enrolled courses

4. **get_schedule**
   - Training phrases: "Class schedule", "When are my classes?", "Timetable"
   - Actions: Call webhook to retrieve schedule

5. **get_seat**
   - Training phrases: "What's my seat number?", "Where do I sit?"
   - Actions: Call webhook to retrieve seat information

#### Configure Webhooks
For each intent, add a webhook action that calls the corresponding backend endpoint:

```
POST https://your-domain.com/api/bot/webhook
Headers:
  Content-Type: application/json
  Authorization: Bearer {{user.jwt}}

Body:
{
  "intent": "get_grades",
  "studentCode": "{{user.studentCode}}"
}
```

## Bot Conversation Flow

### Student Authentication
1. Student logs into the web application
2. JWT token is stored in localStorage
3. When chatbot opens, user context is sent to Botpress
4. Botpress stores student information for subsequent queries

### Query Processing
1. Student asks a question (e.g., "What are my grades?")
2. Botpress identifies intent using NLU
3. Bot calls appropriate webhook endpoint
4. Backend validates JWT and retrieves data
5. Data is returned to bot and formatted for display

### Error Handling
- Invalid JWT: "Please log in to access your information"
- No data found: "No records found for your account"
- Server error: "I'm having trouble accessing your data. Please try again later"

## Testing

### Test Accounts
Use the following test accounts for development:

#### Students
- **Email**: student@nctu.edu | **Password**: student123
- **Email**: john.doe@nctu.edu | **Password**: student123

#### Professors
- **Email**: prof@nctu.edu | **Password**: professor123
- **Email**: dr.smith@nctu.edu | **Password**: professor123

#### Administrators
- **Email**: admin@nctu.edu | **Password**: admin123
- **Email**: superadmin@nctu.edu | **Password**: admin123

### Manual Testing
1. Log in with a student account
2. Open the chatbot (floating button in bottom-right)
3. Test queries:
   - "What are my grades?"
   - "Show my payment history"
   - "What courses am I taking?"
   - "What's my class schedule?"
   - "What's my seat number?"

## Deployment

### Environment Variables
Ensure all environment variables are set in production:

```env
NODE_ENV=production
BOTPRESS_WEBHOOK_URL=https://your-production-domain.com/api/bot/webhook
REACT_APP_BOTPRESS_CLIENT_ID=your-production-client-id
REACT_APP_BOTPRESS_WEBHOOK_ID=your-production-webhook-id
```

### Botpress Cloud Deployment
1. Publish your bot in Botpress Studio
2. Update webhook URLs to production endpoints
3. Test all intents in production environment

## Troubleshooting

### Common Issues

#### Chatbot not loading
- Check Botpress packages are installed
- Verify environment variables are set
- Check browser console for errors

#### Webhook calls failing
- Verify JWT token is valid
- Check backend endpoints are accessible
- Review server logs for errors

#### Authentication issues
- Ensure user is logged in before opening chat
- Check JWT token expiration
- Verify user context is sent to Botpress

### Debug Mode
Enable debug logging in `botController.js`:

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Bot request:', req.body);
}
```

## Security Considerations

1. **JWT Validation**: All webhook endpoints validate JWT tokens
2. **Data Sanitization**: Input data is sanitized before database queries
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **HTTPS Only**: Ensure all communications use HTTPS in production
5. **CORS**: Configure CORS properly for webhook endpoints

## Future Enhancements

- Voice integration
- Multi-language support
- Advanced analytics
- Integration with calendar systems
- Proactive notifications
- File upload capabilities

## Support

For technical support or questions about this integration:
- Check Botpress documentation: [https://botpress.com/docs](https://botpress.com/docs)
- Review server logs for backend issues
- Test with different browsers and devices

---

**Last Updated**: January 2024
**Version**: 1.0.0
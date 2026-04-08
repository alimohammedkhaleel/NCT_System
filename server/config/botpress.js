const axios = require('axios');

const botpressConfig = {
  webhookUrl: process.env.BOTPRESS_WEBHOOK_URL || 'http://localhost:5000/api/bot/webhook',
  apiUrl: process.env.BOTPRESS_API_URL || 'http://localhost:3000',
  clientId: process.env.BOTPRESS_CLIENT_ID,
  clientSecret: process.env.BOTPRESS_CLIENT_SECRET,
  webchatSecret: process.env.BOTPRESS_WEBCHAT_SECRET
};

// Function to send message to Botpress
async function sendToBotpress(action, payload) {
  try {
    const response = await axios.post(botpressConfig.webhookUrl, {
      type: action,
      payload: payload,
      timestamp: new Date().toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('Error sending to Botpress:', error);
    throw error;
  }
}

// Function to get student context for bot
async function getStudentContext(studentId) {
  // This would typically fetch from database
  return {
    studentId: studentId,
    authenticated: true,
    permissions: ['grades', 'payments', 'courses']
  };
}

module.exports = {
  botpressConfig,
  sendToBotpress,
  getStudentContext
};
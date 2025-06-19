const { app } = require('@azure/functions');

app.http('logError', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'log-error',
  handler: async (request, context) => {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }

    try {
      const errorData = await request.json();

      // Log error details
      context.log.error('Frontend Error Logged:', {
        message: errorData.message,
        stack: errorData.stack,
        url: errorData.url,
        userAgent: errorData.userAgent,
        timestamp: errorData.timestamp,
        userId: errorData.userId || 'anonymous'
      });

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Error logged successfully',
          timestamp: new Date().toISOString()
        })
      };

    } catch (error) {
      context.log.error('Error processing log request:', error);

      return {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'Failed to log error'
        })
      };
    }
  }
});

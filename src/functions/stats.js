const { app } = require('@azure/functions');
const { getTaskStats } = require('../lib/sqlClient');

app.http('stats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'stats',
  handler: async (request, context) => {
    try {
      const stats = await getTaskStats();

      return {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        },
        jsonBody: {
          refreshedAtUtc: new Date().toISOString(),
          ...stats
        }
      };
    } catch (error) {
      context.error('Failed to fetch stats', error);

      return {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        jsonBody: {
          error: 'Failed to fetch stats.',
          detail: error.message
        }
      };
    }
  }
});

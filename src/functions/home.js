const { app } = require('@azure/functions');
const { getTasks } = require('../lib/sqlClient');

app.http('home', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (request, context) => {
    try {
      const limitParam = Number.parseInt(request.query.get('limit') ?? '100', 10);
      const rows = await getTasks(limitParam);

      return {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        },
        jsonBody: {
          refreshedAtUtc: new Date().toISOString(),
          rowCount: rows.length,
          rows
        }
      };
    } catch (error) {
      context.error('Failed to fetch tasks', error);

      return {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        jsonBody: {
          error: 'Failed to fetch tasks.',
          detail: error.message
        }
      };
    }
  }
});

const { app } = require('@azure/functions');

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'nmiai task feed API',
    version: '1.0.0',
    description: 'Azure Functions endpoints backed by Azure SQL for tasks and stats.'
  },
  paths: {
    '/tasks': {
      get: {
        summary: 'List tasks',
        operationId: 'getTasks',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of rows to return (1-500).',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 500,
              default: 100
            }
          }
        ],
        responses: {
          '200': {
            description: 'Task rows returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshedAtUtc: {
                      type: 'string',
                      format: 'date-time'
                    },
                    rowCount: {
                      type: 'integer'
                    },
                    rows: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: true
                      }
                    }
                  },
                  required: ['refreshedAtUtc', 'rowCount', 'rows']
                }
              }
            }
          },
          '500': {
            description: 'Failed to fetch tasks.'
          }
        }
      }
    },
    '/stats': {
      get: {
        summary: 'Get task table stats',
        operationId: 'getStats',
        responses: {
          '200': {
            description: 'Stats returned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshedAtUtc: {
                      type: 'string',
                      format: 'date-time'
                    },
                    totalRows: {
                      type: 'integer'
                    }
                  },
                  required: ['refreshedAtUtc', 'totalRows']
                }
              }
            }
          },
          '500': {
            description: 'Failed to fetch stats.'
          }
        }
      }
    }
  }
};

app.http('openapi-json', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'openapi.json',
  handler: async () => ({
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    jsonBody: openApiDocument
  })
});

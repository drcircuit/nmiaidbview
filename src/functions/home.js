const { app } = require('@azure/functions');
const fs = require('node:fs/promises');
const path = require('node:path');

async function getHomePageHtml() {
  const filePath = path.join(__dirname, '..', 'site', 'index.html');

  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read home page at ${filePath}: ${error.message}`);
  }
}

app.http('home', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (request, context) => {
    try {
      const html = await getHomePageHtml();

      return {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store'
        },
        body: html
      };
    } catch (error) {
      context.error('Failed to load home page', error);

      return {
        status: 500,
        headers: {
          'content-type': 'text/plain; charset=utf-8'
        },
        body: 'Failed to load the live task feed page.'
      };
    }
  }
});

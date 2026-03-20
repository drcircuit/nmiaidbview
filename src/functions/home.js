const { app } = require('@azure/functions');
const fs = require('fs/promises');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'site', 'index.html');

app.http('home', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async () => {
    const html = await fs.readFile(htmlPath, 'utf8');

    return {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store'
      },
      body: html
    };
  }
});
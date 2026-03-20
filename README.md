# nmiai tasks live feed

This project is a Node.js Azure Functions app that serves a small web UI and reads the `tasks` table from the `nmiai` Azure SQL database.

## What it does

- `GET /` returns the live web UI that reflects the current rows from the configured SQL table.
- `GET /tasks` returns the task rows from Azure SQL.
- `GET /stats` returns a compact stats payload from Azure SQL.

## Required app settings

Set these in `local.settings.json` for local development and in Azure Function App settings for deployment:

- `DB_CONNECTION_STRING` optional, recommended for Azure deployment
- `DB_SERVER`
- `DB_PORT` default: `1433`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_ENCRYPT` default: `true`
- `DB_TRUST_SERVER_CERTIFICATE` default: `false`
- `DB_SCHEMA` default: `dbo`
- `DB_TABLE` default: `tasks`

Do not commit the real password into source control.

If `DB_CONNECTION_STRING` is present, the app uses it and ignores the individual database settings.

## Local run

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `local.settings.sample.json` to `local.settings.json` and fill in the real password.

   Recommended SQL-auth connection string format:

   ```text
   Server=tcp:nmiai.database.windows.net,1433;Database=nmiai;User Id=nmiai;Password=<your-password>;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
   ```

3. Start the Functions host:

   ```powershell
   npm start
   ```

4. Open `http://localhost:7071` to view the live page.

## Deploy

1. Create a Function App running Node.js 20 on Azure Functions v4.
2. Add the database settings above to the Function App configuration.
3. Publish with Azure Functions Core Tools:

   ```powershell
   func azure functionapp publish <your-function-app-name>
   ```

## GitHub deployment

This repository uses the Azure-portal-generated workflow at `.github/workflows/main_nmiai.yml`.

If you configured Deployment Center in the Azure portal, pushing to `main` triggers deployment automatically.

The workflow uses the Azure login secrets created by the portal integration:

- `AZUREAPPSERVICE_CLIENTID_...`
- `AZUREAPPSERVICE_TENANTID_...`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_...`

You still need to configure the database app settings in the Function App itself. The workflow deploys code, but it does not create or update Azure app settings.

Recommended Azure app setting:

```text
DB_CONNECTION_STRING=Server=tcp:nmiai.database.windows.net,1433;Database=nmiai;User Id=nmiai;Password=<your-password>;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## Notes

- The SQL query is intentionally generic so it works without assuming the `tasks` schema.
- Table and schema names are validated before being included in SQL.
- `/` serves the HTML page, `/tasks` serves the task JSON payload, and `/stats` serves summary stats.
- `Authentication="Active Directory Default"` is not the right match for a SQL username and password. For this app, use SQL authentication through `DB_CONNECTION_STRING` or the separate `DB_*` settings.

# Windows Setup Guide: Connect LM Studio's SQL MCP to SQL Server (End-to-End)

This document provides a complete, step-by-step setup guide to configure and connect **LM Studio**'s **SQL MCP** to a **SQL Server 2022 Developer Edition** instance on Windows. It includes installation, configuration, and verification steps for SQL Server, SSMS, SQL Server Configuration Manager (SSCM), Node.js, and credential management in Zoho Vault.

---

## 1. Prerequisites

- Windows 10 or 11 (local admin access)
- SQL Server 2022 Developer Edition (Database Engine)
- SQL Server Management Studio (SSMS)
- Node.js v18 or higher (tested with v22.14.0)
- LM Studio installed
- MCP project folder (e.g., `/path/to/sql-server-mcp`)

---

## 2. Install SQL Server and SSMS

1. Install **SQL Server 2022 Developer Edition**.
   - Choose **Database Engine Services** during installation.
   - Keep **default instance** (`MSSQLSERVER`).

2. Install **SQL Server Management Studio (SSMS)**.

3. Verify installation:
   ```bash
   sqlcmd -S DESKTOP-<YOURPC> -E
   SELECT @@VERSION;
   GO
   ```
   You should see the SQL Server version and OS details.

---

## 3. Create a Database

1. Open **SSMS** and connect using **Windows Authentication**.
2. Run the following script:
   ```sql
   CREATE DATABASE YourDatabase;
   GO
   USE YourDatabase;
   GO
   ```
   (Optional: run your schema `.sql` file here.)

---

## 4. Enable TCP/IP and Configure Port 1433

1. Open **SQL Server Configuration Manager**.
2. Navigate to:
   `SQL Server Network Configuration → Protocols for MSSQLSERVER`
3. Enable **TCP/IP**.
4. Right-click **TCP/IP → Properties → IP Addresses tab**:
   - **IPAll → TCP Dynamic Ports** → *(clear/empty)*
   - **IPAll → TCP Port** → `1433`
5. Restart the SQL Server service.

### Verify TCP/IP Listener
```bash
netstat -ano | find "1433"
```
Expected: `LISTENING` on port 1433.

---

## 5. Open Firewall Port

Add an inbound rule for SQL Server TCP 1433:
```bash
netsh advfirewall firewall add rule name="SQL Server 1433" dir=in action=allow protocol=TCP localport=1433
```
You should see `Ok.`

---

## 6. Enable Mixed Authentication and Create Login

1. In **SSMS** → Right-click server → **Properties → Security tab**.
2. Select **SQL Server and Windows Authentication mode**.
3. Click **OK**, then restart the SQL Server service in SSCM.

### Create SQL Login and Database User
```sql
USE master;
GO
CREATE LOGIN mcpuser WITH PASSWORD = 'McpStrong!123', CHECK_POLICY = OFF;
GO
USE YourDatabase;
GO
CREATE USER mcpuser FOR LOGIN mcpuser;
EXEC sp_addrolemember 'db_datareader', 'mcpuser';
GO
```

### Test Login in SSMS
- Server: `DESKTOP-<YOURPC>,1433`
- Authentication: **SQL Server Authentication**
- Username: `mcpuser`
- Password: `McpStrong!123`
- Check **Trust server certificate**

---

## 7. Verify Connection via SQLCMD

### Windows Auth
```bash
sqlcmd -S tcp:DESKTOP-<YOURPC>,1433 -E
SELECT DB_NAME();
GO
```

### SQL Auth
```bash
sqlcmd -S tcp:DESKTOP-<YOURPC>,1433 -U mcpuser -P McpStrong!123 -d YourDatabase
SELECT TOP 1 name FROM sys.tables;
GO
```
Expect a valid table name in the result.

---

## 8. Setup Node Environment for MCP

Navigate to your MCP folder:
```bash
cd /path/to/sql-server-mcp
npm install mssql
```

### Test Node-to-SQL Connection
```js
const sql = require("mssql");
(async () => {
  try {
    const pool = await sql.connect({
      server: "YOUR-PC-NAME",
      database: "YourDatabase",
      user: "mcpuser",
      password: "McpStrong!123",
      port: 1433,
      options: { encrypt: true, trustServerCertificate: true }
    });
    const result = await pool.request().query("SELECT TOP 1 name FROM sys.tables");
    console.log("✅ Connected! Example table:", result.recordset[0]);
    await sql.close();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
})();
```
Expected output:
```
✅ Connected! Example table: { name: 'x0152578' }
```

---

## 9. Configure LM Studio MCP (mp.json)

Edit `mp.json` (LM Studio configuration file):

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": [
        "/path/to/sql-server-mcp/dist/index.js"
      ],
      "env": {
        "SQL_SERVER": "YOUR-PC-NAME",
        "SQL_DATABASE": "YourDatabase",
        "SQL_USE_WINDOWS_AUTH": "false",
        "SQL_USERNAME": "mcpuser",
        "SQL_PASSWORD": "McpStrong!123",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30000",
        "MAX_RESULT_ROWS": "5000"
      }
    }
  }
}
```

Restart LM Studio to load the new MCP configuration.

---

## 10. Zoho Vault Credential Setup

Create a **Database** password category with fields:

| Field | Type | Example |
|--------|------|----------|
| Server Name | Text | YOUR-PC-NAME,1433 |
| Authentication | Text | SQL Server Authentication |
| User Name | Text | mcpuser |
| Password | Password | McpStrong!123 |

Add Notes:
```
Database: YourDatabase
Purpose: LM Studio MCP (read-only)
```

Optional: Add a second entry for Windows Authentication (without password).

---

## 11. Troubleshooting

| Issue | Fix |
|-------|------|
| SSL certificate error | Tick **Trust server certificate** or disable *Force Encryption* in SSCM. |
| Database not found | Run `CREATE DATABASE YourDatabase;` before schema import. |
| NULL TCP Port in query | Set static port 1433 in SSCM → IPAll. |
| Port not listening | Restart SQL service; verify `netstat -ano | find "1433"`. |
| Login failed (untrusted domain) | Use SQL Authentication (`mcpuser`). |
| Node error: Cannot find module 'mssql' | Run `npm install mssql`. |
| Firewall block | Add inbound rule for TCP 1433. |

---

## 12. Validation Checklist

- [ ] SQL Server 2022 installed and running
- [ ] SSMS connects via Windows Auth
- [ ] `YourDatabase` database created
- [ ] TCP/IP enabled, static port 1433
- [ ] Firewall allows port 1433
- [ ] Mixed authentication enabled
- [ ] `mcpuser` login created and tested
- [ ] `npm install mssql` done
- [ ] Node test returns a table name
- [ ] LM Studio MCP connected successfully
- [ ] Credentials stored securely in Zoho Vault

---

## 13. Security Notes

- Keep `mcpuser` read-only (`db_datareader`).
- Rotate passwords regularly and store only in Zoho Vault.
- For local setups, `TrustServerCertificate=true` is fine. Use TLS certs for production.

---

**✅ Setup Complete**  
You can now replicate this full configuration on any Windows system to connect LM Studio’s SQL MCP to SQL Server securely and reliably.


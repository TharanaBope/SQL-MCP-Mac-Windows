# Troubleshooting Guide

## Fixed: Windows Authentication Issue

### Problem
Getting authentication error: "The login is from an untrusted domain and cannot be used with Integrated authentication"

### Root Cause
The `tedious` library does NOT support true Windows Authentication (Trusted Connection). It only supports NTLM with explicit credentials.

### Solution ✅
We've replaced `tedious` with `mssql` + `msnodesqlv8` which has native Windows Authentication support through ODBC drivers.

### Changes Made
1. **Dependencies**: Replaced `tedious` with `mssql` and `msnodesqlv8`
2. **Connection Method**: Now uses ConnectionPool with `trustedConnection: true`
3. **API**: Simpler query execution using mssql's high-level API

---

## Prerequisites

### ODBC Driver for SQL Server

The `msnodesqlv8` package requires **ODBC Driver 17 or 18 for SQL Server**.

**Check if installed:**
1. Open "ODBC Data Sources (64-bit)" from Windows Start menu
2. Go to "Drivers" tab
3. Look for "ODBC Driver 17 for SQL Server" or "ODBC Driver 18 for SQL Server"

**If not installed:**

Download from Microsoft:
- [ODBC Driver 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- [ODBC Driver 17 for SQL Server](https://www.microsoft.com/en-us/download/details.aspx?id=56567)

**Note**: If you have SQL Server Management Studio (SSMS) installed, ODBC drivers are likely already installed.

---

## Common Issues

### 1. "Cannot find module 'msnodesqlv8'"

**Solution**: Install dependencies
```bash
cd "C:\path\to\sql-server-mcp"
npm install
```

### 2. "The specified DSN contains an architecture mismatch"

**Cause**: Node.js architecture (32/64-bit) doesn't match ODBC driver architecture.

**Solution**:
- Check Node.js version: `node -p "process.arch"`
- Install matching ODBC driver (64-bit for x64, 32-bit for x86)

### 3. "SQL Server does not exist or access denied"

**Possible causes**:
- SQL Server is not running
- Server name is incorrect
- Firewall is blocking connection
- TCP/IP protocol is disabled

**Solutions**:
1. **Verify SQL Server is running**:
   - Open SQL Server Configuration Manager
   - Check SQL Server service status

2. **Check server name**:
   - For local server, try: `localhost`, `(local)`, or your computer name
   - For named instance: `SERVERNAME\INSTANCENAME`

3. **Enable TCP/IP**:
   - Open SQL Server Configuration Manager
   - Go to "SQL Server Network Configuration" → "Protocols for [Instance]"
   - Enable TCP/IP protocol
   - Restart SQL Server service

4. **Check firewall**:
   - Allow port 1433 through Windows Firewall
   - Or disable firewall temporarily to test

### 4. "Login failed for user 'DOMAIN\username'"

**Cause**: Windows user doesn't have permission to access SQL Server.

**Solution**:
1. Open SQL Server Management Studio (SSMS)
2. Connect as administrator (sa or admin account)
3. Expand Security → Logins
4. Right-click Logins → New Login
5. Add your Windows account: `YOUR-SERVER-NAME\thara`
6. Grant appropriate permissions
7. Map user to databases (User Mapping tab)

### 5. Connection timeout

**Solutions**:
- Increase timeout in config: `"QUERY_TIMEOUT": "60"`
- Check network connectivity
- Verify SQL Server is accepting remote connections

### 6. "Database 'YourDatabase' does not exist"

**Verify database name**:
```sql
-- In SSMS, run:
SELECT name FROM sys.databases;
```

**Check permissions**:
```sql
-- Check if user has access:
SELECT * FROM sys.database_principals WHERE name = 'YOUR-SERVER-NAME\thara';
```

---

## Testing the Connection

### 1. Restart Claude Desktop
- Close Claude Desktop completely
- Wait 5 seconds
- Reopen Claude Desktop

### 2. Test with simple query
Ask Claude:
```
List all databases on the server
```

### 3. Test specific database
```
Show me all tables in the YourDatabase database
```

### 4. Check logs
If something fails, check Claude Desktop logs:
- Help menu → View Logs
- Look for error messages from "sql-server" MCP server

---

## Configuration Verification

Your current config (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["C:\\path\\to\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "YOUR-SERVER-NAME",
        "SQL_DATABASE": "YourDatabase",
        "SQL_USE_WINDOWS_AUTH": "true",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "1000",
        "ENABLE_SCHEMA_CACHE": "true",
        "CACHE_TTL_MINUTES": "60"
      }
    }
  }
}
```

### Key settings:
- `SQL_SERVER`: Should match your server name from SSMS (currently: `YOUR-SERVER-NAME`)
- `SQL_USE_WINDOWS_AUTH`: Should be `"true"` for Windows Authentication
- `SQL_DATABASE`: Target database (currently: `YourDatabase`)

---

## Alternative: SQL Server Authentication

If Windows Authentication continues to have issues, you can use SQL Server Authentication:

### 1. Create SQL Server login (in SSMS):
```sql
CREATE LOGIN mcp_user WITH PASSWORD = 'YourStrongPassword123!';
USE YourDatabase;
CREATE USER mcp_user FOR LOGIN mcp_user;
GRANT SELECT ON SCHEMA::dbo TO mcp_user;
```

### 2. Update config:
```json
"env": {
  "SQL_SERVER": "YOUR-SERVER-NAME",
  "SQL_DATABASE": "YourDatabase",
  "SQL_USE_WINDOWS_AUTH": "false",
  "SQL_USERNAME": "mcp_user",
  "SQL_PASSWORD": "YourStrongPassword123!",
  "SQL_PORT": "1433"
}
```

---

## Success Indicators

When working correctly, you should see:
1. Claude recognizes 12 SQL Server tools (list_databases, list_tables, etc.)
2. Can successfully list databases
3. Can query table structures
4. No authentication errors in logs

## Getting Help

If issues persist:
1. Check ODBC drivers are installed
2. Verify SQL Server accepts Windows Authentication
3. Test connection in SSMS first with same credentials
4. Check Claude Desktop logs for specific error messages
5. Try SQL Server Authentication as fallback

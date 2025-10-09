# Connection Diagnostics

## Current Error: "Login failed for user ''"

This means Windows Authentication is not passing credentials properly.

## Step 1: Check Which ODBC Driver You Have

**Run this PowerShell script:**

1. Open PowerShell as Administrator
2. Navigate to the project folder:
   ```powershell
   cd "D:\Medical Wizard\VFP Entire Codebase\MCP\sql-server-mcp"
   ```
3. Run the diagnostic script:
   ```powershell
   .\check-odbc-drivers.ps1
   ```

This will show you which ODBC drivers are installed and give you the exact connection string to use.

---

## Step 2: Common ODBC Driver Names

The connection string needs the **exact driver name** in curly braces. Common options:

✅ `{ODBC Driver 17 for SQL Server}` - Most common with modern SSMS
✅ `{ODBC Driver 18 for SQL Server}` - Latest version
✅ `{SQL Server Native Client 11.0}` - Older but still works
✅ `{SQL Server}` - Legacy driver

---

## Step 3: Manual ODBC Driver Check

**Alternative way to check (GUI):**

1. Press **Win + R**
2. Type: `odbcad32` and press Enter
3. Go to **"Drivers"** tab
4. Look for drivers with "SQL Server" in the name
5. **Copy the exact name** you see

---

## Step 4: Update Connection String Manually

If the diagnostic script doesn't work, you can manually update the connection code:

**Edit this file:**
`src/database/connection.ts`

**Find line 30** and change the driver to match what you found:

```typescript
const driver = 'ODBC Driver 17 for SQL Server'; // <-- Change this
```

**Possible values based on what you find:**
- `'ODBC Driver 17 for SQL Server'`
- `'ODBC Driver 18 for SQL Server'`
- `'SQL Server Native Client 11.0'`
- `'SQL Server'`

Then rebuild:
```bash
npm run build
```

---

## Step 5: If No ODBC Driver Found

**Download and install:**
- [ODBC Driver 18 for SQL Server](https://go.microsoft.com/fwlink/?linkid=2249004)

**After installation:**
1. Restart your computer (ODBC drivers need system restart)
2. Run the diagnostic script again
3. Rebuild the MCP server: `npm run build`
4. Restart Claude Desktop

---

## Step 6: Alternative - Try SQL Server Authentication

If Windows Authentication continues to fail, we can switch to SQL Server Authentication:

**Create SQL login in SSMS:**
```sql
CREATE LOGIN mcp_user WITH PASSWORD = 'StrongPassword123!';
USE MWVGDB;
CREATE USER mcp_user FOR LOGIN mcp_user;
GRANT SELECT ON SCHEMA::dbo TO mcp_user;
```

**Update Claude Desktop config:**
```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\Medical Wizard\\VFP Entire Codebase\\MCP\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "THARANA",
        "SQL_DATABASE": "MWVGDB",
        "SQL_USE_WINDOWS_AUTH": "false",
        "SQL_USERNAME": "mcp_user",
        "SQL_PASSWORD": "StrongPassword123!",
        "SQL_PORT": "1433"
      }
    }
  }
}
```

---

## Expected Log Output

When you restart Claude Desktop, you should see in the logs:

**Success:**
```
Attempting connection with: Driver={ODBC Driver 17 for SQL Server}; Server=THARANA; Database=MWVGDB; Trusted_Connection=yes; TrustServerCertificate=yes;
Successfully connected to SQL Server
```

**Failure with wrong driver:**
```
Connection failed: [Microsoft][ODBC Driver Manager] Data source name not found and no default driver specified
```

**Failure with auth:**
```
Login failed for user ''
```

---

## Where to Check Logs

**Claude Desktop logs:**
1. Open Claude Desktop
2. Click **Help** → **View Logs**
3. Look for messages from the "sql-server" MCP server
4. The log will show the exact connection string being used

---

## Quick Summary

1. **Run** `check-odbc-drivers.ps1` to find your driver
2. **Update** connection.ts with the correct driver name (line 30)
3. **Rebuild**: `npm run build`
4. **Restart** Claude Desktop
5. **Test**: Ask "List tables in MWVGDB"

If still failing, switch to SQL Server Authentication as a fallback.

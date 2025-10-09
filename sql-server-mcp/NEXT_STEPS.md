# Next Steps to Fix Windows Authentication

## ✅ Confirmed: You Have ODBC Driver 17 for SQL Server

Good news! The diagnostic shows you have the correct driver installed.

## 🔍 Current Issue: "Login failed for user ''"

This error means one of two things:
1. Your Windows user (THARANA\thara) doesn't have SQL Server login access
2. The connection isn't passing Windows credentials correctly

---

## Step 1: Verify SQL Server Permissions

### Run this in SSMS:

1. **Open SQL Server Management Studio (SSMS)**
2. **Connect as you normally do** (Windows Authentication as THARANA\thara)
3. **Open a new query window**
4. **Copy and paste** the contents of `verify-sql-permissions.sql`
5. **Execute** the query (F5)

This will show if your Windows user has proper access to the MWVGDB database.

### Expected Results:

**If you see your username** (`THARANA\thara`) in the results:
- ✅ You have access - the problem is with the MCP connection

**If you DON'T see your username:**
- ❌ You need to grant yourself access to MWVGDB database

---

## Step 2: Grant Database Access (If Needed)

If your user wasn't listed, run this in SSMS:

```sql
USE master;
GO

-- Add Windows login to SQL Server (if not already exists)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'THARANA\thara')
BEGIN
    CREATE LOGIN [THARANA\thara] FROM WINDOWS;
END
GO

-- Grant access to MWVGDB database
USE MWVGDB;
GO

-- Create user in database
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'THARANA\thara')
BEGIN
    CREATE USER [THARANA\thara] FOR LOGIN [THARANA\thara];
END
GO

-- Grant read permissions
ALTER ROLE db_datareader ADD MEMBER [THARANA\thara];
GO

PRINT 'User access granted successfully!';
```

---

## Step 3: Restart Claude Desktop and Test

After verifying/granting permissions:

1. **Restart Claude Desktop completely**
2. **Check the logs** (Help → View Logs)
3. **Look for the connection attempt** - you should see:
   ```
   === SQL Server MCP Connection Attempt ===
   Driver: ODBC Driver 17 for SQL Server
   Server: THARANA
   Database: MWVGDB
   ```

4. **Test with**: "List all tables in MWVGDB"

---

## Step 4: If Still Failing - Check Node.js Architecture

The issue might be Node.js architecture mismatch.

**Check Node.js version:**
```powershell
node -p "process.arch"
```

**Result:**
- `x64` = 64-bit Node.js ✅ (should use 64-bit ODBC driver)
- `x86` or `ia32` = 32-bit Node.js (might have issues)

If you have 32-bit Node.js, consider installing 64-bit Node.js from:
https://nodejs.org/

---

## Option B: Switch to SQL Server Authentication (Simpler)

If Windows Authentication continues to fail, SQL Server Authentication is more reliable:

### 1. Create SQL Login in SSMS:

```sql
USE master;
GO

CREATE LOGIN mcp_user WITH PASSWORD = 'SecurePassword123!';
GO

USE MWVGDB;
GO

CREATE USER mcp_user FOR LOGIN mcp_user;
GO

ALTER ROLE db_datareader ADD MEMBER mcp_user;
GO

PRINT 'SQL Server authentication user created successfully!';
```

### 2. Update Claude Desktop Config:

Edit: `c:\Users\thara\AppData\Roaming\Claude\claude_desktop_config.json`

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
        "SQL_PASSWORD": "SecurePassword123!",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "1000"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

SQL Server Authentication typically works more reliably than Windows Auth with Node.js drivers.

---

## Summary

**Try this order:**

1. ✅ **Verify permissions** with `verify-sql-permissions.sql`
2. ✅ **Grant access** if needed
3. ✅ **Restart Claude Desktop** and test
4. ❌ **If still failing** → Switch to SQL Server Authentication (Option B)

---

## Expected Success

When working, you'll see in Claude Desktop:
- ✅ No authentication errors
- ✅ List of tables from MWVGDB
- ✅ Can describe table structures
- ✅ Can search and explore the database

Let me know which step you're on and what results you see! 🚀

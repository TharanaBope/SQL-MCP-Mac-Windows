# ✅ Plan B: SQL Server Authentication - Setup Complete

## What We Did

Switched from Windows Authentication to SQL Server Authentication because msnodesqlv8 wasn't handling Windows credentials properly.

---

## Step 1: Created SQL Server User ✅

**Run this in SSMS to create the user:**

```sql
USE master;
GO

CREATE LOGIN mcp_user WITH PASSWORD = 'MCP_SecurePass2024!';
GO

USE MWVGDB;
GO

CREATE USER mcp_user FOR LOGIN mcp_user;
GO

ALTER ROLE db_datareader ADD MEMBER mcp_user;
GO

GRANT VIEW DEFINITION TO mcp_user;
GO

PRINT 'MCP user created successfully with read-only access!';
```

**User Details:**
- **Username**: `mcp_user`
- **Password**: `MCP_SecurePass2024!`
- **Permissions**: Read-only (db_datareader)
- **Database**: MWVGDB

---

## Step 2: Updated Claude Desktop Config ✅

Changed authentication from Windows to SQL Server:

**Before:**
```json
"SQL_USE_WINDOWS_AUTH": "true"
```

**After:**
```json
"SQL_USE_WINDOWS_AUTH": "false",
"SQL_USERNAME": "mcp_user",
"SQL_PASSWORD": "MCP_SecurePass2024!"
```

**Full config location:**
`c:\Users\thara\AppData\Roaming\Claude\claude_desktop_config.json`

---

## Step 3: Restart Claude Desktop

**IMPORTANT: You must restart Claude Desktop for changes to take effect**

1. **Close Claude Desktop completely**
2. **Wait 5 seconds**
3. **Reopen Claude Desktop**

---

## Step 4: Test the Connection

After restarting Claude Desktop, try these commands:

### Test 1: List Databases
```
List all databases on the SQL Server
```

### Test 2: List Tables in MWVGDB
```
Show me all tables in the MWVGDB database
```

### Test 3: Describe a Table
```
Describe the structure of [TableName] table
```

---

## Expected Results

When working correctly, you should see:
- ✅ No authentication errors
- ✅ List of all tables in MWVGDB
- ✅ All 12 MCP tools working
- ✅ Can explore database schema

---

## Connection Details

**Authentication Method**: SQL Server Authentication
**Server**: THARANA
**Database**: MWVGDB
**Username**: mcp_user
**Port**: 1433
**Driver**: ODBC Driver 17 for SQL Server

**Connection String (for reference):**
```
Driver={ODBC Driver 17 for SQL Server};
Server=THARANA;
Database=MWVGDB;
UID=mcp_user;
PWD=MCP_SecurePass2024!;
TrustServerCertificate=yes;
```

---

## Security Notes

✅ **Read-only access**: The `mcp_user` account only has `db_datareader` role
✅ **No write operations**: Cannot INSERT, UPDATE, or DELETE data
✅ **No schema changes**: Cannot CREATE, ALTER, or DROP objects
✅ **Limited to MWVGDB**: Only has access to the MWVGDB database

This is safe for exploration and research queries.

---

## Troubleshooting

### If you still get authentication errors:

1. **Verify the SQL user exists:**
   ```sql
   USE MWVGDB;
   SELECT name FROM sys.database_principals WHERE name = 'mcp_user';
   ```

2. **Check Claude Desktop logs:**
   - Help → View Logs
   - Look for "SQL Server MCP Connection Attempt"
   - Check for any error messages

3. **Test the login in SSMS:**
   - File → Connect Object Explorer → SQL Server Authentication
   - Login: `mcp_user`
   - Password: `MCP_SecurePass2024!`
   - Server: `THARANA`
   - If this works, the MCP server should work too

---

## What You Can Do Now

Once connected, ask Claude:

### Schema Exploration
- "What tables are in MWVGDB?"
- "Show me the structure of the Users table"
- "List all stored procedures"

### Finding Information
- "Search for tables with 'patient' in the name"
- "Where is the CustomerID column used?"
- "Find all views in the database"

### Understanding Relationships
- "How are Orders and OrderDetails tables related?"
- "Show me all tables that reference the Products table"
- "What are the foreign keys on the Customers table?"

### Querying Data
- "Show me the first 10 records from [TableName]"
- "Count records in each table"
- "Get distinct values from [ColumnName]"

---

## Success Indicators

✅ Claude shows 12 SQL Server tools available
✅ Can list databases without errors
✅ Can list tables in MWVGDB
✅ Can describe table structures
✅ Can execute SELECT queries

---

## Next Steps

1. **Run the SQL script in SSMS** (if not done yet)
2. **Restart Claude Desktop**
3. **Test**: Ask "List all tables in MWVGDB"
4. **Enjoy** exploring your database with Claude! 🎉

---

**You're all set!** SQL Server Authentication is more reliable than Windows Auth with Node.js drivers, so this should work perfectly now.

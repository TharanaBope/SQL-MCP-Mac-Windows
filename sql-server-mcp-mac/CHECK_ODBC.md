# ODBC Driver Check

## ✅ Packages Installed Successfully
- `mssql`: v11.0.1
- `msnodesqlv8`: v4.5.0

## 🔍 Check ODBC Driver

The `msnodesqlv8` package requires an ODBC driver for SQL Server to be installed on your system.

### How to Check:

1. **Open Windows Run** (Win + R)
2. **Type**: `odbcad32` and press Enter
3. **Go to "Drivers" tab**
4. **Look for any of these**:
   - ✅ "ODBC Driver 18 for SQL Server"
   - ✅ "ODBC Driver 17 for SQL Server"
   - ✅ "ODBC Driver 13 for SQL Server"
   - ✅ "SQL Server Native Client 11.0"
   - ✅ "SQL Server" (older driver)

### If You Have SQL Server Management Studio (SSMS)

You **already have** ODBC drivers installed! SSMS includes them automatically.

### If No ODBC Driver Found:

**Download and Install:**
- [ODBC Driver 18 for SQL Server](https://go.microsoft.com/fwlink/?linkid=2249004) (Recommended)
- [ODBC Driver 17 for SQL Server](https://go.microsoft.com/fwlink/?linkid=2187214)

**Installation is simple:**
1. Download the installer
2. Run it
3. Accept defaults
4. Restart Claude Desktop after installation

---

## 🚀 After Verifying ODBC Driver

### Restart Claude Desktop

1. **Close Claude Desktop completely**
2. **Wait 5 seconds**
3. **Reopen Claude Desktop**

### Test Connection

Ask Claude Desktop:
```
List all tables in the MWVGDB database
```

---

## 📋 Current Configuration

Your config is set to:
- **Server**: THARANA
- **Database**: MWVGDB
- **Auth**: Windows Authentication (Trusted Connection)
- **Connection String**: `Driver=msnodesqlv8;Server=THARANA;Database=MWVGDB;Trusted_Connection=Yes;`

---

## 🐛 If Connection Still Fails

Check Claude Desktop logs:
1. **Help** → **View Logs**
2. Look for messages from "sql-server" MCP server
3. Check for specific error messages

**Common errors:**

### Error: "Driver not found"
- Install ODBC driver (see above)
- Restart Claude Desktop

### Error: "Cannot open database"
- Database name might be wrong
- User might not have permissions
- Try connecting to 'master' database first:
  ```json
  "SQL_DATABASE": "master"
  ```

### Error: "SQL Server does not exist"
- Server name might need to include instance name
- Try: `THARANA\\SQLEXPRESS` or `localhost\\SQLEXPRESS`
- Or try: `localhost` or `127.0.0.1` or `(local)`

---

## 🔧 Alternative Server Names to Try

If "THARANA" doesn't work, try these in order:

1. `localhost`
2. `(local)`
3. `127.0.0.1`
4. `THARANA\\SQLEXPRESS` (if using SQL Express)
5. Computer name from SSMS connection string

To find the exact server name:
1. Open SQL Server Configuration Manager
2. Look at "SQL Server Network Configuration"
3. Check the instance name

---

## ✨ Expected Success

When working, you should see:
- No "ConnectionPool is not a constructor" error
- Claude can list databases
- Claude can query MWVGDB tables
- No authentication errors

Good luck! 🎉

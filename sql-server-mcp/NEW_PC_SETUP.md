# SQL Server MCP Setup Guide for New Windows PC

This guide will help you set up the SQL Server MCP on a fresh Windows PC where you've already installed SQL Server Management Studio 21.

## Prerequisites Checklist

- ✅ SQL Server Management Studio 21 installed
- ✅ SQL Server instance running (verify in SSMS)
- ✅ Node.js 18.x or higher (needs to be installed)
- ✅ SQL Server MCP files copied (without node_modules)

---

## Step-by-Step Setup

### Step 1: Install Node.js (if not already installed)

1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Choose the **LTS (Long Term Support)** version
3. Run the installer with default options
4. Verify installation by opening **Command Prompt** and running:
   ```bash
   node --version
   npm --version
   ```
   Both commands should display version numbers.

---

### Step 2: Copy SQL Server MCP Files

1. Copy the entire `sql-server-mcp` folder to your new PC
   - **Recommended location**: `D:\Medical Wizard\VFP Entire Codebase\MCP\sql-server-mcp`
   - Or any location you prefer (just remember it for later)

2. **Important**: Do NOT copy the `node_modules` folder (it's huge and will be regenerated)

3. Files you MUST copy:
   ```
   sql-server-mcp/
   ├── src/                    (all TypeScript source files)
   ├── package.json
   ├── tsconfig.json
   ├── README.md
   ├── SETUP.md
   └── .env.example (optional)
   ```

---

### Step 3: Install Dependencies

1. Open **Command Prompt** or **PowerShell**

2. Navigate to the sql-server-mcp folder:
   ```bash
   cd "D:\Medical Wizard\VFP Entire Codebase\MCP\sql-server-mcp"
   ```
   *(Replace with your actual path)*

3. Install all required packages:
   ```bash
   npm install
   ```

   This will:
   - Download all dependencies from the internet
   - Create a new `node_modules` folder
   - Take a few minutes to complete

4. Wait until you see:
   ```
   added XXX packages, and audited XXX packages in XXs
   ```

---

### Step 4: Build the Project

1. Still in the same Command Prompt, run:
   ```bash
   npm run build
   ```

2. This will:
   - Compile TypeScript to JavaScript
   - Create a `dist` folder with compiled files
   - Take 10-30 seconds

3. Verify success:
   - You should see `dist/index.js` created
   - No error messages

---

### Step 5: Configure SQL Server Connection

Before setting up Claude Desktop, you need to know your SQL Server connection details.

#### Option A: Using Windows Authentication (Recommended)

This is what you see in your screenshot - **Windows Authentication** selected.

**Your connection details:**
- **Server Name**: Leave blank or use `localhost` or `(local)`
- **Authentication**: Windows Authentication (uses your Windows login)
- **Database**: `<default>` means it will connect to your default database

**You don't need to enter:**
- Username
- Password

#### Option B: Using SQL Server Authentication

If you have a SQL Server username/password:

**Your connection details:**
- **Server Name**: `localhost` or your server name
- **Authentication**: SQL Server Authentication
- **Username**: Your SQL username (e.g., `sa`)
- **Password**: Your SQL password
- **Database**: Database name or `master`

---

### Step 6: Test SQL Server Connection in SSMS

**Before proceeding**, make sure you can connect in SSMS:

1. Open **SQL Server Management Studio 21**
2. Use the same settings you see in your screenshot:
   - **Server type**: Database Engine
   - **Server name**: (blank) or `localhost`
   - **Authentication**: Windows Authentication
   - **Database**: `<default>`
3. Click **Connect**
4. If successful, you're ready for the next step!

**Troubleshooting:**
- If connection fails, verify SQL Server is running:
  - Open **SQL Server Configuration Manager**
  - Check **SQL Server Services** → Ensure your SQL Server instance is **Running**
  - Check **SQL Server Network Configuration** → TCP/IP should be **Enabled**

---

### Step 7: Configure Claude Desktop

#### Find Your Claude Desktop Config File

1. Press `Windows + R` to open Run dialog
2. Type: `%APPDATA%\Claude`
3. Press Enter
4. Look for `claude_desktop_config.json`
   - If it doesn't exist, create it

#### Add the Configuration

**For Windows Authentication (matches your screenshot):**

Open `claude_desktop_config.json` and add this configuration:

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\Medical Wizard\\VFP Entire Codebase\\MCP\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "master",
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

**IMPORTANT: Update the path in `args` to match where you copied the files!**

**For SQL Server Authentication:**

If you use SQL username/password:

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\Medical Wizard\\VFP Entire Codebase\\MCP\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "master",
        "SQL_USE_WINDOWS_AUTH": "false",
        "SQL_USERNAME": "sa",
        "SQL_PASSWORD": "YourPasswordHere",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "1000"
      }
    }
  }
}
```

#### Configuration Explanation

| Setting | What It Does | When to Change |
|---------|-------------|----------------|
| `SQL_SERVER` | Server address | Change to your server name/IP |
| `SQL_DATABASE` | Initial database | Change to your main database |
| `SQL_USE_WINDOWS_AUTH` | Use Windows login | `true` for Windows Auth, `false` for SQL Auth |
| `SQL_USERNAME` | SQL login name | Only needed if `SQL_USE_WINDOWS_AUTH` is `false` |
| `SQL_PASSWORD` | SQL password | Only needed if `SQL_USE_WINDOWS_AUTH` is `false` |
| `SQL_PORT` | SQL Server port | Default is 1433, rarely needs changing |
| `QUERY_TIMEOUT` | Max query time (seconds) | Increase if queries timeout |
| `MAX_RESULT_ROWS` | Max rows to return | Increase if you need more data |

---

### Step 8: Restart Claude Desktop

**This is critical!**

1. **Completely close** Claude Desktop (right-click taskbar icon → Exit)
2. Wait 5 seconds
3. **Reopen** Claude Desktop
4. The SQL Server MCP tools will now be available

---

### Step 9: Test the Setup

Open Claude Desktop and try these test commands:

#### Test 1: List Databases
```
List all databases on the server
```

**Expected result**: You should see a list of databases from your SQL Server

#### Test 2: Explore a Database
```
Show me all tables in the master database
```

**Expected result**: List of tables with row counts

#### Test 3: Describe a Table
```
Describe the structure of [YourTableName] table
```

**Expected result**: Column names, data types, constraints

---

## Troubleshooting

### Issue: "Tools not showing up in Claude"

**Solutions:**
1. ✅ Verify you ran `npm run build` successfully
2. ✅ Check the path in `claude_desktop_config.json` is correct
3. ✅ Ensure the path uses double backslashes (`\\`) on Windows
4. ✅ Restart Claude Desktop completely (not just refresh)
5. ✅ Check Claude Desktop logs:
   - Windows: `%APPDATA%\Claude\logs`

---

### Issue: "Cannot connect to SQL Server"

**Solutions:**
1. ✅ Test connection in SSMS first
2. ✅ Verify SQL Server is running:
   - Open **SQL Server Configuration Manager**
   - Check if SQL Server service is **Running**
3. ✅ Enable TCP/IP:
   - SQL Server Configuration Manager
   - SQL Server Network Configuration
   - Protocols for [Your Instance]
   - Right-click TCP/IP → Enable
   - Restart SQL Server service
4. ✅ Check Windows Firewall (allow port 1433)

---

### Issue: "Authentication failed"

**For Windows Authentication:**
1. ✅ Set `SQL_USE_WINDOWS_AUTH: "true"`
2. ✅ Your Windows user must have SQL Server login access
3. ✅ Grant permissions in SSMS:
   - Security → Logins → Right-click your Windows user → Properties
   - Server Roles → Check appropriate roles

**For SQL Server Authentication:**
1. ✅ Set `SQL_USE_WINDOWS_AUTH: "false"`
2. ✅ Provide correct `SQL_USERNAME` and `SQL_PASSWORD`
3. ✅ Enable Mixed Mode authentication:
   - Right-click SQL Server in SSMS → Properties
   - Security → SQL Server and Windows Authentication mode
   - Restart SQL Server service

---

### Issue: "Module not found" or "Cannot find module"

**Solution:**
1. ✅ Delete `node_modules` folder
2. ✅ Delete `package-lock.json` file
3. ✅ Run `npm install` again
4. ✅ Run `npm run build` again

---

## Quick Reference: Commands Summary

### Initial Setup
```bash
# Navigate to folder
cd "D:\Medical Wizard\VFP Entire Codebase\MCP\sql-server-mcp"

# Install dependencies
npm install

# Build project
npm run build
```

### If You Make Code Changes
```bash
# Rebuild
npm run build

# Or watch mode (auto-rebuild on changes)
npm run watch
```

### Updating the MCP
```bash
# Pull latest code
# Copy new files (without node_modules)

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Restart Claude Desktop
```

---

## What This MCP Can Do

Once set up, you can ask Claude to:

### 1. Explore Database Structure
- "What databases are available?"
- "Show me all tables in the Sales database"
- "What's the structure of the Customers table?"

### 2. Find Relationships
- "How are Orders and OrderDetails related?"
- "What tables reference the Products table?"
- "Show me all foreign keys in the Customers table"

### 3. Search Schema
- "Find all tables with 'customer' in the name"
- "Where is the Email column used?"
- "Search for 'invoice' in the database"

### 4. Query Data
- "Show me the first 10 products ordered by price"
- "Get the count of orders by status"
- "Execute: SELECT * FROM Users WHERE Active = 1"

### 5. Analyze Database
- "Give me an overview of the Sales database"
- "List all stored procedures"
- "Show me all views"

---

## Security Notes

- **Read-only by default**: The MCP cannot INSERT, UPDATE, or DELETE data
- **Query timeouts**: Prevents long-running queries
- **Result limits**: Prevents overwhelming results
- **SQL injection prevention**: Built-in security checks

To enable write operations (not recommended), add to config:
```json
"ENABLE_WRITE_OPERATIONS": "true"
```

---

## Next Steps

1. ✅ Complete the setup steps above
2. ✅ Test with simple queries
3. ✅ Explore your actual databases
4. ✅ Use for database research and analysis

---

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review [README.md](README.md) for more details
3. Check [SETUP.md](SETUP.md) for additional examples
4. Verify SQL Server is accessible via SSMS first

---

## Summary

**On the new Windows PC, you need to:**

1. ✅ Install Node.js
2. ✅ Copy sql-server-mcp files (no node_modules)
3. ✅ Run `npm install`
4. ✅ Run `npm run build`
5. ✅ Configure `claude_desktop_config.json` with your SQL Server details
6. ✅ Restart Claude Desktop
7. ✅ Test with "List all databases"

**That's it! You're ready to explore your databases with Claude!**

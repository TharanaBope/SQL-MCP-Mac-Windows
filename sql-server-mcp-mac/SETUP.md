# Quick Setup Guide for SQL Server MCP

## Step 1: Install Dependencies

```bash
cd sql-server-mcp
npm install
```

## Step 2: Build the Project

```bash
npm run build
```

## Step 3: Configure Claude Desktop

### Find Your Config File

**Windows**: Open File Explorer and paste this path:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Add This Configuration

**For Windows Authentication (most common for local SQL Server):**

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["/path/to/sql-server-mcp/dist/index.js"],
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

**Important**: Update the path in `args` to match where you saved the project!

### For SQL Server Authentication:

If you use SQL Server username/password:

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["/path/to/sql-server-mcp/dist/index.js"],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "YourDatabase",
        "SQL_USE_WINDOWS_AUTH": "false",
        "SQL_USERNAME": "sa",
        "SQL_PASSWORD": "YourPassword",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "1000"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

**Important**: You MUST restart Claude Desktop completely for changes to take effect.

1. Close Claude Desktop
2. Wait a few seconds
3. Open Claude Desktop again

## Step 5: Test It!

Open Claude Desktop and try these commands:

```
List all databases
```

```
Show me the tables in [YourDatabaseName]
```

```
Describe the structure of the [TableName] table
```

## Common Issues

### Issue 1: Tools Not Showing Up

**Fix**:
1. Check the path in `claude_desktop_config.json` is correct
2. Make sure you ran `npm run build`
3. Restart Claude Desktop completely

### Issue 2: Connection Failed

**Fix**:
1. Verify SQL Server is running
2. Check SQL Server Configuration Manager - TCP/IP should be enabled
3. Try connecting with SQL Server Management Studio first to verify credentials
4. Check if SQL Server Browser service is running (for named instances)

### Issue 3: Authentication Error

**For Windows Auth**:
- Set `SQL_USE_WINDOWS_AUTH` to `"true"`
- Make sure your Windows user has access to SQL Server

**For SQL Auth**:
- Set `SQL_USE_WINDOWS_AUTH` to `"false"`
- Provide `SQL_USERNAME` and `SQL_PASSWORD`
- Verify SQL Server is in Mixed Mode authentication

### Issue 4: Cannot Access Specific Database

**Fix**:
- Make sure the database name is spelled correctly
- Verify your user has permissions to that database
- Try setting `SQL_DATABASE` to that database in the config

## Customization Options

### Restrict to Specific Databases

Add this to your `env` section:
```json
"SQL_ALLOWED_DATABASES": "Database1,Database2,Database3"
```

### Increase Query Timeout

```json
"QUERY_TIMEOUT": "60"
```

### Increase Result Limit

```json
"MAX_RESULT_ROWS": "5000"
```

### Disable Caching

```json
"ENABLE_SCHEMA_CACHE": "false"
```

## Example Queries to Try

Once set up, ask Claude:

1. **Explore databases**
   - "What databases are on this server?"
   - "Show me all tables in the Sales database"

2. **Understand structure**
   - "What's the structure of the Customers table?"
   - "Show me all columns in the Orders table"

3. **Find relationships**
   - "How are Orders and OrderDetails related?"
   - "What tables reference the Products table?"

4. **Search**
   - "Find all tables with 'customer' in the name"
   - "Where is the Email column used?"

5. **Query data**
   - "Show me the first 10 products ordered by price"
   - "Get the count of orders by status"

## Next Steps

Once working, you can use this MCP server to:
- Understand database schemas
- Research implementations
- Find where data is stored
- Explore table relationships
- Query data for analysis

All through natural language conversations with Claude!

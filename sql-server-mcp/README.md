# SQL Server MCP Server

A Model Context Protocol (MCP) server for SQL Server that enables AI assistants like Claude to explore and query SQL Server databases. Designed specifically as a RAG (Retrieval-Augmented Generation) system for database knowledge, focusing on schema exploration and research queries.

## Features

### Schema Exploration
- **List databases** - Discover all available databases on the server
- **List tables** - View all tables with row counts
- **Describe tables** - Get detailed column information, data types, constraints, indexes
- **List views and stored procedures** - Explore database objects

### Relationship Mapping
- **Foreign key relationships** - Understand how tables are connected
- **Table dependencies** - See what depends on what
- **Related tables** - Find all directly connected tables

### Search & Discovery
- **Global schema search** - Search across tables, columns, procedures, views
- **Column usage analysis** - Find where specific columns are used
- **Keyword search** - Locate implementations across the database

### Safe Query Execution
- **Read-only queries** - Execute SELECT queries with automatic safety limits
- **Query timeout** - Prevent long-running queries
- **Result limits** - Automatic row limiting to prevent overwhelming results
- **SQL injection prevention** - Built-in security checks

### RAG Features
- **Schema caching** - Fast retrieval of frequently accessed schema information
- **Configurable TTL** - Control cache expiration
- **Database whitelisting** - Restrict access to specific databases

## Installation

### Prerequisites
- Node.js 18.x or higher
- SQL Server (local or remote)
- Windows Authentication or SQL Server Authentication credentials

### Setup

1. **Clone or download this repository**

2. **Install dependencies**
```bash
cd sql-server-mcp
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Configure environment** (optional)
Copy `.env.example` to `.env` and customize:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
SQL_SERVER=localhost
SQL_DATABASE=master
SQL_PORT=1433
SQL_USE_WINDOWS_AUTH=true
QUERY_TIMEOUT=30
MAX_RESULT_ROWS=1000
```

## Configuration for Claude Desktop

Add to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Option 1: Windows Authentication (Recommended for local SQL Server)

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\path\\to\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "localhost",
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

### Option 2: SQL Server Authentication

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\path\\to\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "YourDatabase",
        "SQL_USE_WINDOWS_AUTH": "false",
        "SQL_USERNAME": "your_username",
        "SQL_PASSWORD": "your_password",
        "SQL_PORT": "1433",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "1000"
      }
    }
  }
}
```

### Option 3: Restricted Database Access

```json
{
  "mcpServers": {
    "sql-server": {
      "command": "node",
      "args": ["D:\\path\\to\\sql-server-mcp\\dist\\index.js"],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "master",
        "SQL_USE_WINDOWS_AUTH": "true",
        "SQL_ALLOWED_DATABASES": "MyAppDB,MyTestDB,Analytics",
        "QUERY_TIMEOUT": "30",
        "MAX_RESULT_ROWS": "500"
      }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SQL_SERVER` | SQL Server hostname or IP | `localhost` | Yes |
| `SQL_DATABASE` | Default database to connect to | `master` | Yes |
| `SQL_PORT` | SQL Server port | `1433` | No |
| `SQL_USE_WINDOWS_AUTH` | Use Windows Authentication | `true` | Yes |
| `SQL_USERNAME` | SQL Server username | - | If not using Windows Auth |
| `SQL_PASSWORD` | SQL Server password | - | If not using Windows Auth |
| `SQL_ALLOWED_DATABASES` | Comma-separated list of allowed databases | All | No |
| `QUERY_TIMEOUT` | Query timeout in seconds | `30` | No |
| `MAX_RESULT_ROWS` | Maximum rows to return | `1000` | No |
| `ENABLE_WRITE_OPERATIONS` | Allow INSERT/UPDATE/DELETE | `false` | No |
| `ENABLE_SCHEMA_CACHE` | Enable schema caching | `true` | No |
| `CACHE_TTL_MINUTES` | Cache expiration time | `60` | No |

## Available Tools

### 1. list_databases
List all databases on the SQL Server instance.

**Parameters:**
- `includeSystem` (boolean, optional) - Include system databases

**Example:**
```
List all databases on the server
```

### 2. list_tables
List all tables in a specific database.

**Parameters:**
- `database` (string, required) - Database name

**Example:**
```
List all tables in the MyAppDB database
```

### 3. describe_table
Get detailed schema information about a table.

**Parameters:**
- `database` (string, required) - Database name
- `tableName` (string, required) - Table name (can include schema, e.g., "dbo.Users")

**Example:**
```
Describe the Users table in MyAppDB
```

### 4. get_table_relationships
Get foreign key relationships for a table.

**Parameters:**
- `database` (string, required) - Database name
- `tableName` (string, required) - Table name

**Example:**
```
Show me the relationships for the Orders table
```

### 5. search_schema
Search across tables, columns, views, and procedures.

**Parameters:**
- `database` (string, required) - Database name
- `searchTerm` (string, required) - Search keyword

**Example:**
```
Search for "customer" in the database schema
```

### 6. find_column_usage
Find all tables containing a specific column.

**Parameters:**
- `database` (string, required) - Database name
- `columnName` (string, required) - Exact column name

**Example:**
```
Where is the CustomerID column used?
```

### 7. list_stored_procedures
List all stored procedures in a database.

**Parameters:**
- `database` (string, required) - Database name

### 8. get_procedure_definition
Get the SQL definition of a stored procedure.

**Parameters:**
- `database` (string, required) - Database name
- `procedureName` (string, required) - Procedure name

### 9. list_views
List all views in a database.

**Parameters:**
- `database` (string, required) - Database name

### 10. get_database_overview
Get high-level statistics about a database.

**Parameters:**
- `database` (string, required) - Database name

### 11. execute_query
Execute a read-only SELECT query.

**Parameters:**
- `database` (string, required) - Database name
- `query` (string, required) - SQL SELECT query

**Example:**
```
Execute: SELECT TOP 10 * FROM Users WHERE Active = 1
```

### 12. get_related_tables
Get all tables directly related through foreign keys.

**Parameters:**
- `database` (string, required) - Database name
- `tableName` (string, required) - Table name

## Usage Examples

### Research Use Cases

**1. Understanding Database Structure**
```
"What databases are available on this server?"
"Show me all tables in the SalesDB database"
"What's the structure of the Customers table?"
```

**2. Finding Implementations**
```
"Where is the OrderStatus field used across the database?"
"Search for any tables or columns related to 'invoice'"
"Find all stored procedures that mention 'payment'"
```

**3. Analyzing Relationships**
```
"How are the Orders and OrderDetails tables related?"
"Show me all tables that reference the Customers table"
"What tables are connected to the Products table?"
```

**4. Data Exploration**
```
"Execute: SELECT TOP 10 ProductName, UnitPrice FROM Products ORDER BY UnitPrice DESC"
"Get a summary of the database structure"
"Show me recent orders from the Orders table"
```

## Security Features

- **Read-only by default** - Write operations disabled unless explicitly enabled
- **SQL injection prevention** - Query validation and sanitization
- **Query timeouts** - Prevents long-running queries from blocking
- **Result limits** - Automatic row limiting to prevent memory issues
- **Database whitelisting** - Optional restriction to specific databases
- **Windows Authentication support** - Secure local connections

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to SQL Server

**Solutions**:
1. Verify SQL Server is running and accessible
2. Check firewall settings (port 1433)
3. Enable TCP/IP in SQL Server Configuration Manager
4. For Windows Auth, ensure the user has database access
5. For SQL Auth, verify credentials are correct

### Authentication Issues

**Problem**: Windows Authentication not working

**Solutions**:
1. Set `SQL_USE_WINDOWS_AUTH=true`
2. Ensure the Windows user has SQL Server access
3. Check SQL Server allows Windows Authentication (not mixed mode required)

**Problem**: SQL Server Authentication not working

**Solutions**:
1. Set `SQL_USE_WINDOWS_AUTH=false`
2. Provide `SQL_USERNAME` and `SQL_PASSWORD`
3. Verify SQL Server is in Mixed Mode authentication
4. Check user has appropriate permissions

### Tool Not Found

**Problem**: Claude cannot see the MCP server tools

**Solutions**:
1. Restart Claude Desktop after config changes
2. Check `claude_desktop_config.json` syntax
3. Verify the path to `dist/index.js` is correct (absolute path)
4. Build the project: `npm run build`
5. Check Claude Desktop logs for errors

### Query Errors

**Problem**: "Only SELECT queries are allowed"

**Solution**: This is intentional. The server is read-only by default. To enable write operations (not recommended), set `ENABLE_WRITE_OPERATIONS=true`

**Problem**: Query timeout

**Solution**: Increase `QUERY_TIMEOUT` or optimize the query

## Development

### Build
```bash
npm run build
```

### Watch mode (auto-rebuild)
```bash
npm run watch
```

### Project Structure
```
sql-server-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── database/
│   │   ├── connection.ts     # SQL Server connection pool
│   │   ├── queries.ts        # SQL query templates
│   │   └── cache.ts          # Schema caching layer
│   ├── tools/
│   │   ├── schema.ts         # Schema exploration tools
│   │   ├── relationships.ts  # Relationship mapping tools
│   │   ├── search.ts         # Search & discovery tools
│   │   └── query.ts          # Safe query execution
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── package.json
├── tsconfig.json
└── README.md
```

## Differences from Existing MSSQL MCP Servers

This implementation focuses on:
- **Local SQL Server support** with Windows Authentication
- **RAG-optimized** for database knowledge exploration
- **Research-focused** tools (not CRUD operations)
- **Schema caching** for faster repeated queries
- **Simpler configuration** for local development
- **Read-only by default** for safety

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review SQL Server connection settings
3. Check Claude Desktop logs
4. Verify database permissions

## Acknowledgments

Built using:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Tedious](https://tediousjs.github.io/tedious/) - SQL Server driver for Node.js
- [Zod](https://zod.dev/) - Schema validation

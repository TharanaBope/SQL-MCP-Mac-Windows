# SQL Server MCP - macOS Setup Guide

This is the macOS-compatible version of the SQL Server MCP server, designed to work with LM Studio on Mac.

## Prerequisites

- ✅ macOS (tested on Mac Mini M4 with Apple Silicon)
- ✅ Docker Desktop for Mac (with SQL Server 2022 container)
- ✅ Node.js 18+ (LTS recommended)
- ✅ LM Studio 0.3.17 or later

## Key Differences from Windows Version

| Feature | Windows | macOS |
|---------|---------|-------|
| SQL Driver | `msnodesqlv8` (ODBC) | `mssql` (Tedious) |
| Windows Auth | ✅ Supported | ❌ Not supported |
| SQL Auth | ✅ Supported | ✅ Supported (required) |
| Native Dependencies | Required | None |

## Installation Steps

### 1. Verify Docker SQL Server is Running

```bash
# Check if container is running
docker ps

# If not running, start it
docker start sql1

# Test connection
docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'gukukr6rg#67' \
  -Q "SELECT @@VERSION" -C
```

### 2. Install Node.js Dependencies

```bash
cd sql-server-mcp-mac

# Clean install (if you had errors before)
rm -rf node_modules package-lock.json

# Install dependencies (msnodesqlv8 is removed for Mac)
npm install

# Build TypeScript
npm run build
```

**Note:** The `msnodesqlv8` package has been removed because:
- It requires Windows-specific ODBC drivers
- It won't compile on macOS
- Your code already uses the cross-platform `mssql` package

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.mac.example .env

# Edit .env with your actual database details
nano .env  # or use any text editor
```

**Important:** Set `SQL_USE_WINDOWS_AUTH=false` - Windows Authentication doesn't work on macOS.

### 4. Test the MCP Server

```bash
# Test by running directly
node dist/index.js
# Press Ctrl+C to exit

# You should see: "SQL Server MCP Server running on stdio"
```

### 5. Configure LM Studio

1. Open LM Studio
2. Go to **Settings → Extensions** or edit `mcp.json`
3. Add the following configuration:

```json
{
  "mcpServers": {
    "sql-server-mcp": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/path/to/sql-server-mcp-mac/dist/index.js"
      ],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "master",
        "SQL_USERNAME": "sa",
        "SQL_PASSWORD": "gukukr6rg#67",
        "SQL_USE_WINDOWS_AUTH": "false"
      }
    }
  }
}
```

**Replace:**
- `/Users/YOUR_USERNAME/path/to/sql-server-mcp-mac` with the actual absolute path
- Database and password with your actual values

### 6. Use with LM Studio

1. Open LM Studio
2. Load your GPT OSS 20B model
3. Start a new chat
4. The SQL Server MCP tools should be available
5. Try queries like:
   - "List all databases"
   - "Show me tables in the master database"
   - "Describe the structure of table X"

## Troubleshooting

### Error: Cannot find module 'msnodesqlv8'

**Solution:** You're using the wrong package.json. Make sure you're using the Mac version that has `msnodesqlv8` removed.

### Error: Connection refused (port 1433)

**Solutions:**
```bash
# Check if Docker container is running
docker ps

# Restart container
docker restart sql1

# Check if port is accessible
nc -zv localhost 1433
```

### Error: Login failed for user 'sa'

**Solutions:**
- Verify password in `.env` matches Docker container password
- Check SQL Server container logs: `docker logs sql1`

### LM Studio doesn't see MCP server

**Solutions:**
- Verify the path in `mcp.json` is absolute (starts with `/Users/...`)
- Check that `npm run build` completed successfully
- Restart LM Studio after changing configuration
- Check LM Studio logs for error messages

## Performance Notes

- SQL Server 2022 runs via Rosetta 2 emulation (x64 on ARM)
- Expected ~10-20% performance overhead (acceptable for development)
- Container uses ~1-2GB RAM
- For production workloads, consider using ARM-native Azure SQL Edge or remote Windows SQL Server

## Connecting to Remote SQL Server

If you prefer to connect to your Windows laptop's SQL Server instead of running Docker locally:

1. **On Windows laptop:**
   - Enable SQL Server remote connections
   - Configure Windows Firewall to allow port 1433
   - Note your laptop's IP address (e.g., `192.168.1.100`)

2. **On Mac, update `.env`:**
   ```bash
   SQL_SERVER=192.168.1.100
   # Rest of config remains the same
   ```

## File Structure

```
sql-server-mcp-mac/
├── src/                  # TypeScript source files
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Your configuration (not in git)
├── .env.mac.example      # Example configuration
├── package.json          # Dependencies (msnodesqlv8 removed)
├── tsconfig.json         # TypeScript configuration
└── README.MAC.md         # This file
```

## Support

For issues specific to:
- **macOS setup:** Check this README
- **Docker SQL Server:** See Docker container logs
- **LM Studio integration:** Check LM Studio documentation
- **SQL Server connection:** Verify connection with Azure Data Studio

## License

MIT

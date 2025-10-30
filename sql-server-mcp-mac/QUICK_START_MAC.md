# Quick Start Guide - Mac Mini M4

## TL;DR

```bash
# 1. Copy this folder to your Mac
# 2. Run the setup script
chmod +x setup-mac.sh
./setup-mac.sh

# 3. Edit .env with your database details
nano .env

# 4. Test the server
node dist/index.js
```

## What's Different from Windows?

1. **NO `msnodesqlv8`** - Removed because it requires Windows-only ODBC drivers
2. **SQL Authentication ONLY** - Windows Authentication doesn't work on Mac
3. **Uses `mssql` package** - Cross-platform, pure JavaScript driver

## Step-by-Step Setup

### 1. Copy Folder to Mac

Transfer the `sql-server-mcp-mac` folder to your Mac Mini M4.

### 2. Install Dependencies

```bash
cd /path/to/sql-server-mcp-mac

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Why this works now:**
- ✅ Removed `msnodesqlv8` from package.json
- ✅ Only uses cross-platform `mssql` package
- ✅ No native compilation required

### 3. Create .env File

```bash
# Copy example
cp .env.mac.example .env

# Edit with your details
nano .env
```

**Important settings:**
```bash
SQL_SERVER=localhost              # Your Docker SQL Server
SQL_DATABASE=master               # Or your database name
SQL_USE_WINDOWS_AUTH=false       # MUST be false on Mac!
SQL_USERNAME=sa                   # SQL authentication
SQL_PASSWORD=YOUR_STRONG_PASSWORD_HERE        # Your Docker password
```

### 4. Configure LM Studio

**Find your absolute path:**
```bash
cd /path/to/sql-server-mcp-mac
pwd  # Copy this path
```

**Edit LM Studio mcp.json:**

Location: `~/Library/Application Support/LMStudio/mcp.json`

```json
{
  "mcpServers": {
    "sql-server-mcp": {
      "command": "node",
      "args": [
        "/Users/mwdev/Desktop/AI/SQLMCP/sql-server-mcp-mac/dist/index.js"
      ],
      "env": {
        "SQL_SERVER": "localhost",
        "SQL_DATABASE": "master",
        "SQL_USERNAME": "sa",
        "SQL_PASSWORD": "YOUR_STRONG_PASSWORD_HERE",
        "SQL_USE_WINDOWS_AUTH": "false"
      }
    }
  }
}
```

**Replace `/Users/mwdev/Desktop/AI/SQLMCP/sql-server-mcp-mac` with your actual path!**

### 5. Test Everything

**Test SQL Server connection:**
```bash
docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YOUR_STRONG_PASSWORD_HERE' \
  -Q "SELECT @@VERSION" -C
```

**Test MCP server:**
```bash
node dist/index.js
# Should see: "SQL Server MCP Server running on stdio"
# Press Ctrl+C to exit
```

**Test with LM Studio:**
1. Open LM Studio
2. Load GPT OSS 20B model
3. New chat
4. Try: "List all databases"
5. Should see SQL Server tools working!

## Common Issues & Fixes

### ❌ Error: Cannot find module 'msnodesqlv8'

**Cause:** Using old package.json with `msnodesqlv8` dependency

**Fix:**
```bash
# Make sure you're using the Mac version
cat package.json | grep msnodesqlv8
# Should return nothing

# If it shows msnodesqlv8, you're using wrong folder
# Use sql-server-mcp-mac, not sql-server-mcp
```

### ❌ npm install fails with gyp errors

**Cause:** Trying to compile native modules

**Fix:**
```bash
# Clean everything
rm -rf node_modules package-lock.json

# Verify package.json doesn't have msnodesqlv8
grep msnodesqlv8 package.json
# Should be empty

# Reinstall
npm install
```

### ❌ Connection refused (port 1433)

**Fix:**
```bash
# Check container
docker ps | grep sql1

# Restart if needed
docker restart sql1

# Wait 10 seconds, then test
docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YOUR_STRONG_PASSWORD_HERE' \
  -Q "SELECT 1" -C
```

### ❌ LM Studio doesn't see MCP

**Fix:**
1. Check path in mcp.json is absolute (starts with `/Users/`)
2. Verify `npm run build` worked: `ls dist/index.js`
3. Restart LM Studio completely
4. Check LM Studio logs for errors

## File Checklist

After setup, you should have:

```
sql-server-mcp-mac/
├── ✅ package.json           (no msnodesqlv8!)
├── ✅ node_modules/           (installed)
├── ✅ dist/index.js           (built)
├── ✅ .env                    (your config)
├── ✅ src/                    (TypeScript source)
└── 📖 README.MAC.md           (documentation)
```

## Verification Commands

Run these to verify everything is ready:

```bash
# 1. Check Node.js
node --version  # Should be v18+

# 2. Check Docker
docker ps | grep sql1  # Should show running container

# 3. Check package.json
grep msnodesqlv8 package.json  # Should be empty

# 4. Check build
ls -la dist/index.js  # Should exist

# 5. Check .env
cat .env | grep SQL_USE_WINDOWS_AUTH  # Should be false

# 6. Test connection
docker exec sql1 /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YOUR_STRONG_PASSWORD_HERE' \
  -Q "SELECT @@VERSION" -C

# 7. Test MCP server
node dist/index.js  # Should start without errors
```

## Next Steps

1. ✅ Setup complete
2. Configure additional databases in `.env` if needed
3. Start using with LM Studio + GPT OSS 20B
4. Explore SQL databases through natural language!

## Support

- **Mac Setup Issues:** See [README.MAC.md](README.MAC.md)
- **SQL Server Issues:** Check Docker logs: `docker logs sql1`
- **LM Studio Issues:** Check LM Studio documentation

---

**Need help?** Check that:
1. Docker SQL Server is running
2. `package.json` has NO `msnodesqlv8`
3. `.env` has `SQL_USE_WINDOWS_AUTH=false`
4. Path in LM Studio `mcp.json` is absolute
5. You ran `npm run build` successfully

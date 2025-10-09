# Enable SQL Server Mixed Mode Authentication

## Problem

SQL Server Authentication is failing because SQL Server might be in "Windows Authentication Only" mode.

For SQL Server Authentication to work, SQL Server must be in **Mixed Mode** (Windows + SQL Server Authentication).

---

## Step 1: Check Current Authentication Mode

**Run this in SSMS:**

```sql
EXEC xp_instance_regread
    N'HKEY_LOCAL_MACHINE',
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode';
```

**Result:**
- **1** = Windows Authentication Only ❌ (SQL Auth won't work)
- **2** = Mixed Mode (Windows + SQL Auth) ✅ (SQL Auth will work)

---

## Step 2: Enable Mixed Mode (If Needed)

### Method 1: Using SQL Server Management Studio (GUI) - EASIEST

1. **Open SQL Server Management Studio (SSMS)**

2. **Connect to your server** (THARANA)

3. **Right-click on the server name** (THARANA) in Object Explorer

4. **Select "Properties"**

5. **Click "Security" in the left panel**

6. **Under "Server authentication", select:**
   - ✅ **"SQL Server and Windows Authentication mode"** (Mixed Mode)

7. **Click OK**

8. **IMPORTANT: Restart SQL Server service** (changes don't take effect until restart)

---

### Method 2: Using PowerShell (Advanced)

Run as Administrator:

```powershell
# Import SQL Server module
Import-Module SQLPS -DisableNameChecking

# Set Mixed Mode Authentication
$server = New-Object Microsoft.SqlServer.Management.Smo.Server "THARANA"
$server.Settings.LoginMode = [Microsoft.SqlServer.Management.SMO.ServerLoginMode]::Mixed
$server.Alter()

Write-Host "Mixed Mode enabled. Please restart SQL Server service."
```

---

### Method 3: Restart SQL Server Service

After enabling Mixed Mode, **you MUST restart SQL Server**:

**Option A: Services GUI**
1. Press **Win + R**
2. Type `services.msc` and press Enter
3. Find **SQL Server (MSSQLSERVER)** or **SQL Server (THARANA)**
4. Right-click → **Restart**

**Option B: PowerShell**
```powershell
Restart-Service MSSQLSERVER
# Or if you have a named instance:
# Restart-Service MSSQL$THARANA
```

**Option C: SQL Server Configuration Manager**
1. Open SQL Server Configuration Manager
2. Go to "SQL Server Services"
3. Right-click "SQL Server (MSSQLSERVER)" → Restart

---

## Step 3: Reset the mcp_user Password

After enabling Mixed Mode and restarting SQL Server, run the **FIX_PASSWORD.sql** script:

```sql
-- This will drop and recreate the user with a fresh password
-- See FIX_PASSWORD.sql for the complete script
```

---

## Step 4: Test the Login

**Test in SSMS:**

1. **File** → **Connect Object Explorer**
2. **Authentication**: Select "SQL Server Authentication"
3. **Login**: `mcp_user`
4. **Password**: `MCP_SecurePass2024!`
5. **Click Connect**

**If connection succeeds:** ✅ SQL Auth is working!

**If connection fails:** Check the error message for details

---

## Common Issues

### Issue: "Login failed for user 'mcp_user'"
**Cause**: Mixed Mode might not be enabled
**Solution**: Follow Step 2 above to enable Mixed Mode

### Issue: "Password did not match"
**Cause**: Password in config doesn't match SQL Server
**Solution**: Run FIX_PASSWORD.sql to reset password

### Issue: Service won't restart
**Cause**: Need administrator privileges
**Solution**: Run as Administrator

---

## Alternative: Use Windows Authentication Instead

If you prefer not to use SQL Server Authentication, we can switch back to Windows Auth, but we'll need to use a different approach:

**Create a simple test to verify Windows Auth works:**

```sql
-- Test if Windows Auth works for current user
SELECT
    SUSER_SNAME() AS WindowsUser,
    IS_SRVROLEMEMBER('sysadmin') AS IsAdmin;
```

Then we can create a workaround using SQL Server's built-in features.

---

## Summary Checklist

- [ ] Check if SQL Server is in Mixed Mode (should be **2**)
- [ ] If not, enable Mixed Mode via SSMS Properties → Security
- [ ] **Restart SQL Server service** (CRITICAL!)
- [ ] Run FIX_PASSWORD.sql to recreate mcp_user
- [ ] Test login in SSMS with SQL Server Authentication
- [ ] Restart Claude Desktop
- [ ] Test MCP connection

---

Let me know which step you're on and what you see!

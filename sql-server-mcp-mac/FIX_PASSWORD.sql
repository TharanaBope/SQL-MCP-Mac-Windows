-- Fix mcp_user password and verify SQL Server Authentication is enabled
-- Run this script in SSMS as administrator

-- Step 1: Check if SQL Server is in Mixed Mode (required for SQL Auth)
EXEC xp_instance_regread
    N'HKEY_LOCAL_MACHINE',
    N'Software\Microsoft\MSSQLServer\MSSQLServer',
    N'LoginMode';
-- Result should be 2 for Mixed Mode (SQL + Windows Auth)
-- If it's 1, you need to enable Mixed Mode

-- Step 2: Drop and recreate the login with a fresh password
USE master;
GO

-- Drop existing login if it exists
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'mcp_user')
BEGIN
    DROP LOGIN mcp_user;
    PRINT 'Existing login dropped';
END
GO

-- Create new login with password
CREATE LOGIN mcp_user WITH PASSWORD = 'MCP_SecurePass2024!', CHECK_POLICY = OFF;
GO

PRINT 'Login created successfully';
GO

-- Step 3: Create user in MWVGDB database
USE MWVGDB;
GO

-- Drop existing user if it exists
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'mcp_user')
BEGIN
    DROP USER mcp_user;
    PRINT 'Existing user dropped';
END
GO

-- Create new user
CREATE USER mcp_user FOR LOGIN mcp_user;
GO

-- Grant permissions
ALTER ROLE db_datareader ADD MEMBER mcp_user;
GO

GRANT VIEW DEFINITION TO mcp_user;
GO

PRINT 'User created and permissions granted successfully';
GO

-- Step 4: Verify the setup
PRINT '=== Verification ===';
PRINT '';

-- Check login exists
SELECT
    'Login exists: ' + name AS Status
FROM sys.server_principals
WHERE name = 'mcp_user';

-- Check user exists in MWVGDB
USE MWVGDB;
SELECT
    'User exists in MWVGDB: ' + name AS Status
FROM sys.database_principals
WHERE name = 'mcp_user';

-- Check role membership
SELECT
    'Role: ' + r.name AS RoleMembership
FROM sys.database_role_members rm
JOIN sys.database_principals r ON rm.role_principal_id = r.principal_id
JOIN sys.database_principals m ON rm.member_principal_id = m.principal_id
WHERE m.name = 'mcp_user';

PRINT '';
PRINT '=== Setup Complete ===';
PRINT 'Username: mcp_user';
PRINT 'Password: MCP_SecurePass2024!';
PRINT 'Database: MWVGDB';
PRINT 'Permissions: db_datareader (read-only)';

-- Run this in SQL Server Management Studio to verify Windows Authentication setup

-- 1. Check if your Windows user has access to SQL Server
USE master;
GO

SELECT
    name AS LoginName,
    type_desc AS LoginType,
    is_disabled AS IsDisabled,
    create_date AS CreatedDate
FROM sys.server_principals
WHERE name LIKE '%THARANA%' OR name LIKE '%thara%';

-- 2. Check if you have access to MWVGDB database
USE MWVGDB;
GO

SELECT
    dp.name AS UserName,
    dp.type_desc AS UserType,
    dp.create_date AS CreatedDate
FROM sys.database_principals dp
WHERE dp.name LIKE '%THARANA%' OR dp.name LIKE '%thara%';

-- 3. Check current connection info
SELECT
    SUSER_SNAME() AS CurrentLoginName,
    USER_NAME() AS CurrentUserName,
    DB_NAME() AS CurrentDatabase;

-- 4. If your user is NOT listed above, run this to add access:
-- (Uncomment and modify the username to match your Windows account)

/*
USE master;
GO

-- Add Windows login to SQL Server
CREATE LOGIN [THARANA\thara] FROM WINDOWS;
GO

-- Grant access to MWVGDB database
USE MWVGDB;
GO

-- Create user in database
CREATE USER [THARANA\thara] FOR LOGIN [THARANA\thara];
GO

-- Grant read permissions (for MCP read-only access)
ALTER ROLE db_datareader ADD MEMBER [THARANA\thara];
GO

-- Optional: Grant additional permissions if needed
-- ALTER ROLE db_datawriter ADD MEMBER [THARANA\thara];  -- For write access
-- ALTER ROLE db_owner ADD MEMBER [THARANA\thara];       -- For full access

PRINT 'User access granted successfully!';
*/

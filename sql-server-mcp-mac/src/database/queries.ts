/**
 * SQL query templates for SQL Server database exploration
 */

export const QUERIES = {
  // List all databases
  LIST_DATABASES: `
    SELECT
      name AS databaseName,
      create_date AS createdDate,
      state_desc AS state,
      compatibility_level AS compatibilityLevel
    FROM sys.databases
    WHERE database_id > 4  -- Exclude system databases: master, tempdb, model, msdb
    ORDER BY name;
  `,

  // List all user databases including system ones
  LIST_ALL_DATABASES: `
    SELECT
      name AS databaseName,
      create_date AS createdDate,
      state_desc AS state,
      compatibility_level AS compatibilityLevel
    FROM sys.databases
    ORDER BY name;
  `,

  // List all tables in a database
  LIST_TABLES: `
    SELECT
      t.name AS tableName,
      s.name AS schemaName,
      p.rows AS rowCount,
      t.type_desc AS tableType
    FROM sys.tables t
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    LEFT JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0, 1)
    ORDER BY s.name, t.name;
  `,

  // Get table schema details
  DESCRIBE_TABLE: `
    SELECT
      c.name AS columnName,
      t.name AS dataType,
      c.max_length AS maxLength,
      c.is_nullable AS isNullable,
      CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS isPrimaryKey,
      CASE WHEN fk.parent_column_id IS NOT NULL THEN 1 ELSE 0 END AS isForeignKey,
      dc.definition AS defaultValue
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    LEFT JOIN (
      SELECT ic.object_id, ic.column_id
      FROM sys.index_columns ic
      INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
      WHERE i.is_primary_key = 1
    ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
    LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
    LEFT JOIN sys.default_constraints dc ON c.default_object_id = dc.object_id
    WHERE c.object_id = OBJECT_ID(@tableName)
    ORDER BY c.column_id;
  `,

  // Get foreign key relationships
  GET_FOREIGN_KEYS: `
    SELECT
      fk.name AS constraintName,
      COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS columnName,
      OBJECT_NAME(fkc.referenced_object_id) AS referencedTable,
      COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referencedColumn,
      OBJECT_SCHEMA_NAME(fkc.referenced_object_id) AS referencedSchema
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    WHERE fk.parent_object_id = OBJECT_ID(@tableName)
    ORDER BY fk.name;
  `,

  // Get indexes for a table
  GET_INDEXES: `
    SELECT
      i.name AS indexName,
      COL_NAME(ic.object_id, ic.column_id) AS columnName,
      i.is_unique AS isUnique,
      i.is_primary_key AS isPrimaryKey
    FROM sys.indexes i
    INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.object_id = OBJECT_ID(@tableName)
    ORDER BY i.name, ic.key_ordinal;
  `,

  // List all views
  LIST_VIEWS: `
    SELECT
      v.name AS viewName,
      s.name AS schemaName,
      v.create_date AS createdDate,
      v.modify_date AS modifiedDate
    FROM sys.views v
    INNER JOIN sys.schemas s ON v.schema_id = s.schema_id
    ORDER BY s.name, v.name;
  `,

  // List all stored procedures
  LIST_STORED_PROCEDURES: `
    SELECT
      p.name AS procedureName,
      s.name AS schemaName,
      p.create_date AS createdDate,
      p.modify_date AS modifiedDate
    FROM sys.procedures p
    INNER JOIN sys.schemas s ON p.schema_id = s.schema_id
    ORDER BY s.name, p.name;
  `,

  // Get stored procedure definition
  GET_PROCEDURE_DEFINITION: `
    SELECT OBJECT_DEFINITION(OBJECT_ID(@procedureName)) AS definition;
  `,

  // Get view definition
  GET_VIEW_DEFINITION: `
    SELECT OBJECT_DEFINITION(OBJECT_ID(@viewName)) AS definition;
  `,

  // Search for tables by name
  SEARCH_TABLES: `
    SELECT
      t.name AS objectName,
      s.name AS schemaName,
      'table' AS objectType
    FROM sys.tables t
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name LIKE @searchTerm
    ORDER BY s.name, t.name;
  `,

  // Search for columns by name across all tables
  SEARCH_COLUMNS: `
    SELECT
      c.name AS objectName,
      s.name AS schemaName,
      t.name AS parentObject,
      'column' AS objectType,
      ty.name AS dataType
    FROM sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    WHERE c.name LIKE @searchTerm
    ORDER BY s.name, t.name, c.name;
  `,

  // Search for stored procedures
  SEARCH_PROCEDURES: `
    SELECT
      p.name AS objectName,
      s.name AS schemaName,
      'procedure' AS objectType
    FROM sys.procedures p
    INNER JOIN sys.schemas s ON p.schema_id = s.schema_id
    WHERE p.name LIKE @searchTerm
    ORDER BY s.name, p.name;
  `,

  // Get table dependencies (what tables reference this table)
  GET_TABLE_DEPENDENCIES: `
    SELECT DISTINCT
      OBJECT_NAME(fk.parent_object_id) AS dependentTable,
      OBJECT_SCHEMA_NAME(fk.parent_object_id) AS dependentSchema,
      fk.name AS constraintName
    FROM sys.foreign_keys fk
    WHERE fk.referenced_object_id = OBJECT_ID(@tableName)
    ORDER BY dependentSchema, dependentTable;
  `,

  // Get all columns with a specific name across database
  FIND_COLUMN_USAGE: `
    SELECT
      t.name AS tableName,
      s.name AS schemaName,
      c.name AS columnName,
      ty.name AS dataType,
      CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS isPrimaryKey,
      CASE WHEN fk.parent_column_id IS NOT NULL THEN 1 ELSE 0 END AS isForeignKey
    FROM sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    LEFT JOIN (
      SELECT ic.object_id, ic.column_id
      FROM sys.index_columns ic
      INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
      WHERE i.is_primary_key = 1
    ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
    LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
    WHERE c.name = @columnName
    ORDER BY s.name, t.name;
  `,

  // Get database overview statistics
  DATABASE_OVERVIEW: `
    SELECT
      (SELECT COUNT(*) FROM sys.tables) AS tableCount,
      (SELECT COUNT(*) FROM sys.views) AS viewCount,
      (SELECT COUNT(*) FROM sys.procedures) AS procedureCount,
      (SELECT COUNT(DISTINCT name) FROM sys.schemas WHERE schema_id > 4) AS schemaCount,
      DB_NAME() AS databaseName;
  `,
};

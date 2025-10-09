import { SQLServerConnection } from '../database/connection.js';
import { QUERIES } from '../database/queries.js';
import {
  DatabaseInfo,
  TableInfo,
  ColumnInfo,
  ForeignKeyInfo,
  IndexInfo,
  StoredProcedureInfo,
} from '../types/index.js';

export class SchemaTools {
  constructor(private connection: SQLServerConnection) {}

  async listDatabases(includeSystem: boolean = false): Promise<DatabaseInfo[]> {
    const query = includeSystem ? QUERIES.LIST_ALL_DATABASES : QUERIES.LIST_DATABASES;
    return await this.connection.executeQuery<DatabaseInfo>(query);
  }

  async listTables(database: string): Promise<TableInfo[]> {
    // Switch to the target database
    await this.connection.executeQuery(`USE [${database}]`);
    return await this.connection.executeQuery<TableInfo>(QUERIES.LIST_TABLES);
  }

  async describeTable(database: string, tableName: string): Promise<{
    columns: ColumnInfo[];
    foreignKeys: ForeignKeyInfo[];
    indexes: IndexInfo[];
  }> {
    // Switch to the target database
    await this.connection.executeQuery(`USE [${database}]`);

    // Get fully qualified table name
    const fullTableName = tableName.includes('.') ? tableName : `dbo.${tableName}`;

    // Execute queries in parallel for better performance
    const [columns, foreignKeys, indexes] = await Promise.all([
      this.connection.executeQuery<ColumnInfo>(
        QUERIES.DESCRIBE_TABLE.replace('@tableName', `'${fullTableName}'`)
      ),
      this.connection.executeQuery<ForeignKeyInfo>(
        QUERIES.GET_FOREIGN_KEYS.replace('@tableName', `'${fullTableName}'`)
      ),
      this.connection.executeQuery<IndexInfo>(
        QUERIES.GET_INDEXES.replace('@tableName', `'${fullTableName}'`)
      ),
    ]);

    return { columns, foreignKeys, indexes };
  }

  async listViews(database: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    return await this.connection.executeQuery(QUERIES.LIST_VIEWS);
  }

  async listStoredProcedures(database: string): Promise<StoredProcedureInfo[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    return await this.connection.executeQuery<StoredProcedureInfo>(
      QUERIES.LIST_STORED_PROCEDURES
    );
  }

  async getStoredProcedureDefinition(
    database: string,
    procedureName: string
  ): Promise<string> {
    await this.connection.executeQuery(`USE [${database}]`);
    const fullProcName = procedureName.includes('.')
      ? procedureName
      : `dbo.${procedureName}`;
    const result = await this.connection.executeQuery<{ definition: string }>(
      QUERIES.GET_PROCEDURE_DEFINITION.replace('@procedureName', `'${fullProcName}'`)
    );
    return result[0]?.definition || '';
  }

  async getViewDefinition(database: string, viewName: string): Promise<string> {
    await this.connection.executeQuery(`USE [${database}]`);
    const fullViewName = viewName.includes('.') ? viewName : `dbo.${viewName}`;
    const result = await this.connection.executeQuery<{ definition: string }>(
      QUERIES.GET_VIEW_DEFINITION.replace('@viewName', `'${fullViewName}'`)
    );
    return result[0]?.definition || '';
  }

  async getDatabaseOverview(database: string): Promise<any> {
    await this.connection.executeQuery(`USE [${database}]`);
    const result = await this.connection.executeQuery(QUERIES.DATABASE_OVERVIEW);
    return result[0];
  }
}

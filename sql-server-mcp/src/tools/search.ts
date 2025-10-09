import { SQLServerConnection } from '../database/connection.js';
import { QUERIES } from '../database/queries.js';
import { SchemaSearchResult } from '../types/index.js';

export class SearchTools {
  constructor(private connection: SQLServerConnection) {}

  async searchSchema(database: string, searchTerm: string): Promise<SchemaSearchResult[]> {
    await this.connection.executeQuery(`USE [${database}]`);

    const searchPattern = `%${searchTerm}%`;

    // Search across tables, columns, and procedures in parallel
    const [tables, columns, procedures] = await Promise.all([
      this.connection.executeQuery(
        QUERIES.SEARCH_TABLES.replace('@searchTerm', `'${searchPattern}'`)
      ),
      this.connection.executeQuery(
        QUERIES.SEARCH_COLUMNS.replace('@searchTerm', `'${searchPattern}'`)
      ),
      this.connection.executeQuery(
        QUERIES.SEARCH_PROCEDURES.replace('@searchTerm', `'${searchPattern}'`)
      ),
    ]);

    const results: SchemaSearchResult[] = [
      ...tables.map((t: any) => ({
        objectType: 'table' as const,
        objectName: t.objectName,
        schemaName: t.schemaName,
      })),
      ...columns.map((c: any) => ({
        objectType: 'column' as const,
        objectName: c.objectName,
        schemaName: c.schemaName,
        parentObject: c.parentObject,
        description: `Type: ${c.dataType}`,
      })),
      ...procedures.map((p: any) => ({
        objectType: 'procedure' as const,
        objectName: p.objectName,
        schemaName: p.schemaName,
      })),
    ];

    return results;
  }

  async searchTables(database: string, searchTerm: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    const searchPattern = `%${searchTerm}%`;
    return await this.connection.executeQuery(
      QUERIES.SEARCH_TABLES.replace('@searchTerm', `'${searchPattern}'`)
    );
  }

  async searchColumns(database: string, searchTerm: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    const searchPattern = `%${searchTerm}%`;
    return await this.connection.executeQuery(
      QUERIES.SEARCH_COLUMNS.replace('@searchTerm', `'${searchPattern}'`)
    );
  }

  async findColumnByName(database: string, columnName: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    return await this.connection.executeQuery(
      QUERIES.FIND_COLUMN_USAGE.replace('@columnName', `'${columnName}'`)
    );
  }

  async searchStoredProcedures(database: string, searchTerm: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    const searchPattern = `%${searchTerm}%`;
    return await this.connection.executeQuery(
      QUERIES.SEARCH_PROCEDURES.replace('@searchTerm', `'${searchPattern}'`)
    );
  }

  async globalSearch(searchTerm: string, databases: string[]): Promise<{
    database: string;
    results: SchemaSearchResult[];
  }[]> {
    const allResults = await Promise.all(
      databases.map(async (db) => ({
        database: db,
        results: await this.searchSchema(db, searchTerm),
      }))
    );

    return allResults.filter((r) => r.results.length > 0);
  }
}

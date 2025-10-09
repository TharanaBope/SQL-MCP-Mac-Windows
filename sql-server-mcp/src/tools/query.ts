import { SQLServerConnection } from '../database/connection.js';
import { QueryResult, SQLServerConfig } from '../types/index.js';

export class QueryTools {
  constructor(
    private connection: SQLServerConnection,
    private config: SQLServerConfig
  ) {}

  async executeSelectQuery(database: string, query: string): Promise<QueryResult> {
    // Security checks
    if (!this.config.enableWriteOperations && !this.isReadOnlyQuery(query)) {
      throw new Error('Write operations are disabled. Only SELECT queries are allowed.');
    }

    const startTime = Date.now();

    try {
      await this.connection.executeQuery(`USE [${database}]`);

      // Add row limit if not already present
      const limitedQuery = this.addRowLimit(query, this.config.maxResultRows);

      const result = await this.connection.executeQueryWithMetadata(limitedQuery);

      const executionTime = Date.now() - startTime;

      return {
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rows.length,
        executionTime,
      };
    } catch (error: any) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  private isReadOnlyQuery(query: string): boolean {
    const normalizedQuery = query.trim().toUpperCase();

    // Block any write operations
    const writeOperations = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'CREATE',
      'ALTER',
      'TRUNCATE',
      'EXEC',
      'EXECUTE',
      'SP_',
      'XP_',
    ];

    for (const op of writeOperations) {
      if (normalizedQuery.includes(op)) {
        return false;
      }
    }

    // Allow SELECT and WITH (for CTEs)
    return normalizedQuery.startsWith('SELECT') || normalizedQuery.startsWith('WITH');
  }

  private addRowLimit(query: string, maxRows: number): string {
    const normalizedQuery = query.trim().toUpperCase();

    // If query already has TOP clause, return as is
    if (normalizedQuery.includes('TOP ')) {
      return query;
    }

    // If query has SELECT, add TOP clause
    if (normalizedQuery.startsWith('SELECT')) {
      return query.replace(/SELECT/i, `SELECT TOP ${maxRows}`);
    }

    // For CTEs (WITH clause), we need to add TOP to the final SELECT
    if (normalizedQuery.startsWith('WITH')) {
      // This is a simple implementation; might need enhancement for complex CTEs
      const lastSelectIndex = query.lastIndexOf('SELECT');
      if (lastSelectIndex !== -1) {
        return (
          query.substring(0, lastSelectIndex) +
          query.substring(lastSelectIndex).replace(/SELECT/i, `SELECT TOP ${maxRows}`)
        );
      }
    }

    return query;
  }

  async explainQuery(database: string, query: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);

    // Get execution plan
    await this.connection.executeQuery('SET SHOWPLAN_TEXT ON');
    const plan = await this.connection.executeQuery(query);
    await this.connection.executeQuery('SET SHOWPLAN_TEXT OFF');

    return plan;
  }

  async validateQuery(query: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      // Basic syntax validation
      if (!this.isReadOnlyQuery(query)) {
        return {
          isValid: false,
          error: 'Only SELECT queries are allowed in read-only mode',
        };
      }

      // Additional validation can be added here
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }
}

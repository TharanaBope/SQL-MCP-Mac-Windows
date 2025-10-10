import { SQLServerConnection } from '../database/connection.js';
import { QUERIES } from '../database/queries.js';
import { ForeignKeyInfo } from '../types/index.js';

export class RelationshipTools {
  constructor(private connection: SQLServerConnection) {}

  async getTableRelationships(database: string, tableName: string): Promise<{
    outgoingReferences: ForeignKeyInfo[];
    incomingReferences: any[];
  }> {
    await this.connection.executeQuery(`USE [${database}]`);
    const fullTableName = tableName.includes('.') ? tableName : `dbo.${tableName}`;

    // Get outgoing foreign keys (this table references others)
    const outgoingReferences = await this.connection.executeQuery<ForeignKeyInfo>(
      QUERIES.GET_FOREIGN_KEYS.replace('@tableName', `'${fullTableName}'`)
    );

    // Get incoming references (other tables reference this table)
    const incomingReferences = await this.connection.executeQuery(
      QUERIES.GET_TABLE_DEPENDENCIES.replace('@tableName', `'${fullTableName}'`)
    );

    return { outgoingReferences, incomingReferences };
  }

  async getTableDependencies(database: string, tableName: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    const fullTableName = tableName.includes('.') ? tableName : `dbo.${tableName}`;

    return await this.connection.executeQuery(
      QUERIES.GET_TABLE_DEPENDENCIES.replace('@tableName', `'${fullTableName}'`)
    );
  }

  async analyzeColumnUsage(database: string, columnName: string): Promise<any[]> {
    await this.connection.executeQuery(`USE [${database}]`);
    return await this.connection.executeQuery(
      QUERIES.FIND_COLUMN_USAGE.replace('@columnName', `'${columnName}'`)
    );
  }

  async getRelatedTables(database: string, tableName: string): Promise<{
    directRelations: string[];
    indirectRelations: string[];
  }> {
    const { outgoingReferences, incomingReferences } = await this.getTableRelationships(
      database,
      tableName
    );

    // Get directly related tables
    const directRelations = [
      ...new Set([
        ...outgoingReferences.map((fk) => `${fk.referencedSchema}.${fk.referencedTable}`),
        ...incomingReferences.map((dep: any) => `${dep.dependentSchema}.${dep.dependentTable}`),
      ]),
    ];

    // For indirect relations, we'd need to traverse the graph further
    // For now, return empty array (can be enhanced later)
    const indirectRelations: string[] = [];

    return { directRelations, indirectRelations };
  }
}

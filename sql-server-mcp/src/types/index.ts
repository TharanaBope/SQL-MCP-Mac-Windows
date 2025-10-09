import { Connection, Request } from 'tedious';

export interface SQLServerConfig {
  server: string;
  database: string;
  port: number;
  useWindowsAuth: boolean;
  username?: string;
  password?: string;
  allowedDatabases?: string[];
  queryTimeout: number;
  maxResultRows: number;
  enableWriteOperations: boolean;
}

export interface TableInfo {
  tableName: string;
  schemaName: string;
  rowCount: number;
  tableType: string;
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  maxLength: number | null;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue: string | null;
}

export interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  referencedSchema: string;
}

export interface IndexInfo {
  indexName: string;
  columnName: string;
  isUnique: boolean;
  isPrimaryKey: boolean;
}

export interface StoredProcedureInfo {
  procedureName: string;
  schemaName: string;
  definition: string;
  createdDate: Date;
  modifiedDate: Date;
}

export interface DatabaseInfo {
  databaseName: string;
  createdDate: Date;
  state: string;
  compatibilityLevel: number;
}

export interface SchemaSearchResult {
  objectType: 'table' | 'column' | 'procedure' | 'view';
  objectName: string;
  schemaName: string;
  parentObject?: string;
  description?: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

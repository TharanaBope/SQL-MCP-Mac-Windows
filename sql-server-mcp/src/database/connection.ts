import sql from 'mssql';
import { SQLServerConfig } from '../types/index.js';

export class SQLServerConnection {
  private config: SQLServerConfig;
  private pool: sql.ConnectionPool | null = null;

  constructor(config: SQLServerConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.pool && this.pool.connected) {
      return;
    }

    try {
      if (this.config.useWindowsAuth) {
        // Windows Authentication with ODBC Driver 17 (confirmed installed on system)
        const driver = 'ODBC Driver 17 for SQL Server';

        // Connection string format for Windows Authentication with ODBC
        // Using 'yes' (lowercase) for Trusted_Connection as per msnodesqlv8 requirements
        const connectionString = `Driver={${driver}};Server=${this.config.server};Database=${this.config.database};Trusted_Connection=yes;TrustServerCertificate=yes;`;

        console.error('=== SQL Server MCP Connection Attempt ===');
        console.error('Driver:', driver);
        console.error('Server:', this.config.server);
        console.error('Database:', this.config.database);
        console.error('Connection String:', connectionString.replace(/;/g, ';\n  '));
        console.error('=========================================');

        // Use 'as any' to bypass TypeScript type checking for connectionString
        this.pool = new sql.ConnectionPool(connectionString as any);
      } else if (this.config.username && this.config.password) {
        // SQL Server Authentication
        console.error('=== SQL Server Authentication ===');
        console.error('Server:', this.config.server);
        console.error('Database:', this.config.database);
        console.error('Username:', this.config.username);
        console.error('Password length:', this.config.password.length);

        const connectionConfig: sql.config = {
          server: this.config.server,
          database: this.config.database,
          user: this.config.username,
          password: this.config.password,
          options: {
            trustServerCertificate: true,
            enableArithAbort: true,
            encrypt: false,
          },
          connectionTimeout: 15000,
          requestTimeout: this.config.queryTimeout * 1000,
        };

        this.pool = new sql.ConnectionPool(connectionConfig);
      } else {
        throw new Error('No authentication method configured');
      }

      await this.pool.connect();
      console.error('Successfully connected to SQL Server');
    } catch (error: any) {
      console.error('Connection failed:', error.message);
      console.error('Error details:', error);
      throw error;
    }
  }

  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.pool || !this.pool.connected) {
      await this.connect();
    }

    try {
      const request = this.pool!.request();

      // Add parameters if provided
      params.forEach((param, index) => {
        request.input(`param${index}`, sql.NVarChar, param);
      });

      const result = await request.query(query);
      return result.recordset as T[];
    } catch (error: any) {
      console.error('Query execution failed:', error.message);
      throw error;
    }
  }

  async executeQueryWithMetadata(query: string): Promise<{ columns: string[]; rows: any[] }> {
    if (!this.pool || !this.pool.connected) {
      await this.connect();
    }

    try {
      const request = this.pool!.request();
      const result = await request.query(query);

      const columns = result.recordset.columns
        ? Object.keys(result.recordset.columns)
        : result.recordset.length > 0
        ? Object.keys(result.recordset[0])
        : [];

      return {
        columns,
        rows: result.recordset,
      };
    } catch (error: any) {
      console.error('Query with metadata failed:', error.message);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      console.error('Connection closed');
    }
  }

  isConnected(): boolean {
    return this.pool !== null && this.pool.connected;
  }
}

// Singleton connection pool
let connectionInstance: SQLServerConnection | null = null;

export function getConnection(config: SQLServerConfig): SQLServerConnection {
  if (!connectionInstance) {
    connectionInstance = new SQLServerConnection(config);
  }
  return connectionInstance;
}

export async function closeConnection(): Promise<void> {
  if (connectionInstance) {
    await connectionInstance.close();
    connectionInstance = null;
  }
}

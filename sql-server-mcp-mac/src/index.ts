#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { getConnection, closeConnection } from './database/connection.js';
import { SchemaTools } from './tools/schema.js';
import { RelationshipTools } from './tools/relationships.js';
import { SearchTools } from './tools/search.js';
import { QueryTools } from './tools/query.js';
import { getCache, generateCacheKey } from './database/cache.js';
import { SQLServerConfig } from './types/index.js';
import { z } from 'zod';

// Load configuration from environment variables
const config: SQLServerConfig = {
  server: process.env.SQL_SERVER || 'localhost',
  database: process.env.SQL_DATABASE || 'master',
  port: parseInt(process.env.SQL_PORT || '1433'),
  useWindowsAuth: process.env.SQL_USE_WINDOWS_AUTH === 'true',
  username: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  allowedDatabases: process.env.SQL_ALLOWED_DATABASES?.split(',').map((s) => s.trim()),
  queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30'),
  maxResultRows: parseInt(process.env.MAX_RESULT_ROWS || '1000'),
  enableWriteOperations: process.env.ENABLE_WRITE_OPERATIONS === 'true',
};

// Initialize cache
const cache = getCache(
  parseInt(process.env.CACHE_TTL_MINUTES || '60'),
  process.env.ENABLE_SCHEMA_CACHE !== 'false'
);

// Initialize connection and tools
const connection = getConnection(config);
const schemaTools = new SchemaTools(connection);
const relationshipTools = new RelationshipTools(connection);
const searchTools = new SearchTools(connection);
const queryTools = new QueryTools(connection, config);

// Define MCP tools
const TOOLS: Tool[] = [
  {
    name: 'list_databases',
    description:
      'List all databases on the SQL Server instance. Useful for discovering what databases are available.',
    inputSchema: {
      type: 'object',
      properties: {
        includeSystem: {
          type: 'boolean',
          description: 'Include system databases (master, tempdb, model, msdb)',
          default: false,
        },
      },
    },
  },
  {
    name: 'list_tables',
    description:
      'List all tables in a specific database with row counts. Essential for understanding database structure.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
      },
      required: ['database'],
    },
  },
  {
    name: 'describe_table',
    description:
      'Get detailed schema information about a table including columns, data types, constraints, foreign keys, and indexes. Critical for understanding table structure.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        tableName: {
          type: 'string',
          description: 'Name of the table (can include schema, e.g., dbo.Users)',
        },
      },
      required: ['database', 'tableName'],
    },
  },
  {
    name: 'get_table_relationships',
    description:
      'Get all foreign key relationships for a table (both incoming and outgoing). Shows how tables are connected.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        tableName: {
          type: 'string',
          description: 'Name of the table',
        },
      },
      required: ['database', 'tableName'],
    },
  },
  {
    name: 'search_schema',
    description:
      'Search across tables, columns, views, and stored procedures by keyword. Perfect for finding where something is implemented.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        searchTerm: {
          type: 'string',
          description: 'Search term or keyword',
        },
      },
      required: ['database', 'searchTerm'],
    },
  },
  {
    name: 'find_column_usage',
    description:
      'Find all tables that contain a column with a specific name. Useful for tracking where a field is used across the database.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        columnName: {
          type: 'string',
          description: 'Exact column name to search for',
        },
      },
      required: ['database', 'columnName'],
    },
  },
  {
    name: 'list_stored_procedures',
    description: 'List all stored procedures in a database.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
      },
      required: ['database'],
    },
  },
  {
    name: 'get_procedure_definition',
    description: 'Get the full SQL definition of a stored procedure.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        procedureName: {
          type: 'string',
          description: 'Name of the stored procedure',
        },
      },
      required: ['database', 'procedureName'],
    },
  },
  {
    name: 'list_views',
    description: 'List all views in a database.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
      },
      required: ['database'],
    },
  },
  {
    name: 'get_database_overview',
    description:
      'Get high-level statistics about a database including table count, view count, procedure count, and schema count.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
      },
      required: ['database'],
    },
  },
  {
    name: 'execute_query',
    description:
      'Execute a read-only SELECT query against the database. Automatically limited to prevent large result sets. Only SELECT queries are allowed.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        query: {
          type: 'string',
          description: 'SQL SELECT query to execute',
        },
      },
      required: ['database', 'query'],
    },
  },
  {
    name: 'get_related_tables',
    description:
      'Get all tables directly related to a given table through foreign key relationships. Helps understand table dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        database: {
          type: 'string',
          description: 'Name of the database',
        },
        tableName: {
          type: 'string',
          description: 'Name of the table',
        },
      },
      required: ['database', 'tableName'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'sql-server-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Ensure connection is established
    if (!connection.isConnected()) {
      await connection.connect();
    }

    // Check database access
    if (args?.database && config.allowedDatabases && config.allowedDatabases.length > 0) {
      const dbName = args.database as string;
      if (!config.allowedDatabases.includes(dbName)) {
        throw new Error(
          `Access denied to database "${dbName}". Allowed databases: ${config.allowedDatabases.join(', ')}`
        );
      }
    }

    switch (name) {
      case 'list_databases': {
        const cacheKey = generateCacheKey('list_databases', String(args?.includeSystem));
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.listDatabases(args?.includeSystem as boolean);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_tables': {
        const db = args?.database as string;
        const cacheKey = generateCacheKey('list_tables', db);
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.listTables(db);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'describe_table': {
        const db = args?.database as string;
        const table = args?.tableName as string;
        const cacheKey = generateCacheKey('describe_table', db, table);
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.describeTable(db, table);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_table_relationships': {
        const db = args?.database as string;
        const table = args?.tableName as string;
        const result = await relationshipTools.getTableRelationships(db, table);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_schema': {
        const db = args?.database as string;
        const term = args?.searchTerm as string;
        const result = await searchTools.searchSchema(db, term);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'find_column_usage': {
        const db = args?.database as string;
        const column = args?.columnName as string;
        const result = await searchTools.findColumnByName(db, column);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_stored_procedures': {
        const db = args?.database as string;
        const cacheKey = generateCacheKey('list_procedures', db);
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.listStoredProcedures(db);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_procedure_definition': {
        const db = args?.database as string;
        const proc = args?.procedureName as string;
        const result = await schemaTools.getStoredProcedureDefinition(db, proc);

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'list_views': {
        const db = args?.database as string;
        const cacheKey = generateCacheKey('list_views', db);
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.listViews(db);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_database_overview': {
        const db = args?.database as string;
        const cacheKey = generateCacheKey('overview', db);
        let result = cache.get(cacheKey);

        if (!result) {
          result = await schemaTools.getDatabaseOverview(db);
          cache.set(cacheKey, result);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'execute_query': {
        const db = args?.database as string;
        const query = args?.query as string;
        const result = await queryTools.executeSelectQuery(db, query);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_related_tables': {
        const db = args?.database as string;
        const table = args?.tableName as string;
        const result = await relationshipTools.getRelatedTables(db, table);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('SQL Server MCP Server running on stdio');
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

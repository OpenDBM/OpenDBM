package database

import "opendbm/internal/models"

// Driver is the common interface for all database drivers
type Driver interface {
	Connect(config models.ConnectionConfig) (string, error)
	Disconnect(id string) error
	Ping(id string) error
}

// SQLDriver interface for SQL databases
type SQLDriver interface {
	Driver
	ExecuteQuery(id string, sql string) (*models.QueryResult, error)
	ExecuteSQL(id string, sql string) error
	ListDatabases(id string) ([]string, error)
	ListTables(id string, database string) ([]models.TableInfo, error)
	GetTableSchema(id string, table string) ([]models.ColumnInfo, error)
}

// DocumentDriver interface for document databases like MongoDB
type DocumentDriver interface {
	Driver
	ListDatabases(id string) ([]string, error)
	ListCollections(id string, database string) ([]string, error)
	FindDocuments(id string, database, collection string, filter map[string]interface{}) ([]map[string]interface{}, error)
}

// KeyValueDriver interface for key-value stores like Redis
type KeyValueDriver interface {
	Driver
	Get(id string, key string) (string, error)
	Set(id string, key, value string) error
	Keys(id string, pattern string) ([]string, error)
}

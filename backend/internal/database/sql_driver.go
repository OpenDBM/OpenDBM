package database

import (
	"database/sql"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"opendbm/internal/models"
)

// SQLDriverImpl implements SQLDriver interface using GORM
type SQLDriverImpl struct {
	connections     map[string]*gorm.DB
	connectionTypes map[string]string
	mu              sync.RWMutex
}

// NewSQLDriver creates a new SQL driver instance
func NewSQLDriver() *SQLDriverImpl {
	return &SQLDriverImpl{
		connections:     make(map[string]*gorm.DB),
		connectionTypes: make(map[string]string),
	}
}

// Connect establishes a new database connection
func (d *SQLDriverImpl) Connect(config models.ConnectionConfig) (string, error) {
	var dialector gorm.Dialector

	switch config.Type {
	case "mysql":
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4",
			config.Username, config.Password, config.Host, config.Port, config.Database)
		dialector = mysql.Open(dsn)
	case "postgres":
		sslMode := "disable"
		if config.SSL {
			sslMode = "require"
		}
		dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
			config.Host, config.Port, config.Username, config.Password, config.Database, sslMode)
		dialector = postgres.Open(dsn)
	case "sqlite":
		dialector = sqlite.Open(config.Database)
	case "sqlserver":
		dsn := fmt.Sprintf("sqlserver://%s:%s@%s:%d?database=%s",
			config.Username, config.Password, config.Host, config.Port, config.Database)
		dialector = sqlserver.Open(dsn)
	default:
		return "", fmt.Errorf("unsupported database type: %s", config.Type)
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return "", fmt.Errorf("failed to connect: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return "", fmt.Errorf("failed to get sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return "", fmt.Errorf("failed to ping database: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	id := uuid.New().String()
	d.mu.Lock()
	d.connections[id] = db
	d.connectionTypes[id] = config.Type
	d.mu.Unlock()

	return id, nil
}

// Disconnect closes a database connection
func (d *SQLDriverImpl) Disconnect(id string) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	db, exists := d.connections[id]
	if !exists {
		return nil
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.Close()
	}

	delete(d.connections, id)
	delete(d.connectionTypes, id)
	return nil
}

// Ping checks if connection is alive
func (d *SQLDriverImpl) Ping(id string) error {
	d.mu.RLock()
	db, exists := d.connections[id]
	d.mu.RUnlock()

	if !exists {
		return fmt.Errorf("connection not found")
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// ExecuteQuery executes a SELECT query and returns results
func (d *SQLDriverImpl) ExecuteQuery(id string, query string) (*models.QueryResult, error) {
	d.mu.RLock()
	db, exists := d.connections[id]
	d.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("connection not found")
	}

	start := time.Now()

	rows, err := db.Raw(query).Rows()
	if err != nil {
		return &models.QueryResult{
			Columns:       []string{},
			Rows:          []map[string]interface{}{},
			RowCount:      0,
			ExecutionTime: time.Since(start).Milliseconds(),
			Error:         err.Error(),
		}, nil
	}
	defer rows.Close()

	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var results []map[string]interface{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			if b, ok := val.([]byte); ok {
				val = string(b)
			}
			row[col] = val
		}
		results = append(results, row)
	}

	if results == nil {
		results = []map[string]interface{}{}
	}

	return &models.QueryResult{
		Columns:       columns,
		Rows:          results,
		RowCount:      len(results),
		ExecutionTime: time.Since(start).Milliseconds(),
	}, nil
}

// ExecuteSQL executes a non-SELECT SQL statement
func (d *SQLDriverImpl) ExecuteSQL(id string, sqlStatement string) error {
	d.mu.RLock()
	db, exists := d.connections[id]
	d.mu.RUnlock()

	if !exists {
		return fmt.Errorf("connection not found")
	}

	return db.Exec(sqlStatement).Error
}

// ListDatabases lists all databases
func (d *SQLDriverImpl) ListDatabases(id string) ([]string, error) {
	d.mu.RLock()
	dbType := d.connectionTypes[id]
	d.mu.RUnlock()

	var query string
	switch dbType {
	case "mysql":
		query = "SHOW DATABASES"
	case "postgres":
		query = "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
	case "sqlserver":
		query = "SELECT name FROM sys.databases ORDER BY name"
	case "sqlite":
		return []string{"main"}, nil
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	result, err := d.ExecuteQuery(id, query)
	if err != nil {
		return nil, err
	}

	var databases []string
	for _, row := range result.Rows {
		for _, v := range row {
			if dbName, ok := v.(string); ok {
				databases = append(databases, dbName)
				break
			}
		}
	}
	return databases, nil
}

// ListTables lists all tables in a database
func (d *SQLDriverImpl) ListTables(id string, database string) ([]models.TableInfo, error) {
	d.mu.RLock()
	dbType := d.connectionTypes[id]
	db := d.connections[id]
	d.mu.RUnlock()

	var query string
	switch dbType {
	case "mysql":
		query = fmt.Sprintf("SHOW TABLES FROM `%s`", database)
	case "postgres":
		query = "SELECT tablename as name FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
	case "sqlserver":
		query = "SELECT table_name as name FROM information_schema.tables WHERE table_type = 'BASE TABLE' ORDER BY table_name"
	case "sqlite":
		query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	if dbType == "mysql" {
		db.Exec(fmt.Sprintf("USE `%s`", database))
	}

	result, err := d.ExecuteQuery(id, query)
	if err != nil {
		return nil, err
	}

	var tables []models.TableInfo
	for _, row := range result.Rows {
		for _, v := range row {
			if tableName, ok := v.(string); ok {
				tables = append(tables, models.TableInfo{Name: tableName, Type: "table"})
				break
			}
		}
	}
	return tables, nil
}

// GetTableSchema returns column information for a table
func (d *SQLDriverImpl) GetTableSchema(id string, table string) ([]models.ColumnInfo, error) {
	d.mu.RLock()
	dbType := d.connectionTypes[id]
	d.mu.RUnlock()

	var query string
	switch dbType {
	case "mysql":
		query = fmt.Sprintf("DESCRIBE `%s`", table)
	case "postgres":
		query = fmt.Sprintf(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '%s' ORDER BY ordinal_position`, table)
	case "sqlite":
		query = fmt.Sprintf("PRAGMA table_info(%s)", table)
	case "sqlserver":
		query = fmt.Sprintf(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '%s' ORDER BY ordinal_position`, table)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", dbType)
	}

	result, err := d.ExecuteQuery(id, query)
	if err != nil {
		return nil, err
	}

	var columns []models.ColumnInfo
	for _, row := range result.Rows {
		col := models.ColumnInfo{}
		switch dbType {
		case "mysql":
			if v, ok := row["Field"].(string); ok {
				col.Name = v
			}
			if v, ok := row["Type"].(string); ok {
				col.Type = v
			}
			if v, ok := row["Null"].(string); ok {
				col.Nullable = v == "YES"
			}
			if v, ok := row["Key"].(string); ok {
				col.IsPrimaryKey = v == "PRI"
			}
		case "postgres", "sqlserver":
			if v, ok := row["column_name"].(string); ok {
				col.Name = v
			}
			if v, ok := row["data_type"].(string); ok {
				col.Type = v
			}
			if v, ok := row["is_nullable"].(string); ok {
				col.Nullable = v == "YES"
			}
		case "sqlite":
			if v, ok := row["name"].(string); ok {
				col.Name = v
			}
			if v, ok := row["type"].(string); ok {
				col.Type = v
			}
			if v, ok := row["notnull"]; ok {
				col.Nullable = v == int64(0) || v == 0
			}
			if v, ok := row["pk"]; ok {
				col.IsPrimaryKey = v == int64(1) || v == 1
			}
		}
		columns = append(columns, col)
	}
	return columns, nil
}

// GetDB returns the underlying *sql.DB for a connection
func (d *SQLDriverImpl) GetDB(id string) (*sql.DB, error) {
	d.mu.RLock()
	db, exists := d.connections[id]
	d.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("connection not found")
	}

	return db.DB()
}

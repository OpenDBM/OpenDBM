package models

import "time"

// ConnectionConfig represents the configuration for a database connection
type ConnectionConfig struct {
	ID       string `json:"id,omitempty"`
	Name     string `json:"name"`
	Type     string `json:"type"` // mysql, postgres, mongodb, redis, sqlite, oracle, sqlserver
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Database string `json:"database"`
	SSL      bool   `json:"ssl,omitempty"`
}

// Connection represents an active database connection
type Connection struct {
	ConnectionConfig
	Status          string     `json:"status"` // connected, disconnected, connecting, error
	CreatedAt       time.Time  `json:"createdAt"`
	LastConnectedAt *time.Time `json:"lastConnectedAt,omitempty"`
	Error           string     `json:"error,omitempty"`
}

// QueryRequest represents a query execution request
type QueryRequest struct {
	ConnectionID string `json:"connection_id"`
	SQL          string `json:"sql"`
}

// DocumentFindRequest represents a MongoDB find request
type DocumentFindRequest struct {
	ConnectionID string                 `json:"connection_id"`
	Database     string                 `json:"database"`
	Collection   string                 `json:"collection"`
	Filter       map[string]interface{} `json:"filter"`
}

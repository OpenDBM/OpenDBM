package database

import (
	"fmt"
	"sync"
	"time"

	"opendbm/internal/models"
)

// Manager handles all database connections
type Manager struct {
	connections map[string]*ManagedConnection
	sqlDriver   *SQLDriverImpl
	mu          sync.RWMutex
}

// ManagedConnection wraps a connection with its metadata
type ManagedConnection struct {
	Config    models.ConnectionConfig
	Status    string
	CreatedAt time.Time
	LastUsed  time.Time
	Error     string
}

// NewManager creates a new connection manager
func NewManager() *Manager {
	return &Manager{
		connections: make(map[string]*ManagedConnection),
		sqlDriver:   NewSQLDriver(),
	}
}

// Connect creates a new database connection
func (m *Manager) Connect(config models.ConnectionConfig) (*models.Connection, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	id, err := m.sqlDriver.Connect(config)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	m.connections[id] = &ManagedConnection{
		Config:    config,
		Status:    "connected",
		CreatedAt: now,
		LastUsed:  now,
	}
	m.connections[id].Config.ID = id

	return &models.Connection{
		ConnectionConfig: m.connections[id].Config,
		Status:           "connected",
		CreatedAt:        now,
	}, nil
}

// TestConnection tests a database connection without storing it
func (m *Manager) TestConnection(config models.ConnectionConfig) error {
	id, err := m.sqlDriver.Connect(config)
	if err != nil {
		return err
	}
	m.sqlDriver.Disconnect(id)
	return nil
}

// Disconnect closes a connection
func (m *Manager) Disconnect(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.connections[id]; !exists {
		return fmt.Errorf("connection not found: %s", id)
	}

	if err := m.sqlDriver.Disconnect(id); err != nil {
		return err
	}

	m.connections[id].Status = "disconnected"
	return nil
}

// Delete removes a connection completely
func (m *Manager) Delete(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.connections[id]; !exists {
		return fmt.Errorf("connection not found: %s", id)
	}

	m.sqlDriver.Disconnect(id)
	delete(m.connections, id)
	return nil
}

// GetConnection returns connection metadata
func (m *Manager) GetConnection(id string) (*models.Connection, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	conn, exists := m.connections[id]
	if !exists {
		return nil, fmt.Errorf("connection not found: %s", id)
	}

	return &models.Connection{
		ConnectionConfig: conn.Config,
		Status:           conn.Status,
		CreatedAt:        conn.CreatedAt,
		Error:            conn.Error,
	}, nil
}

// ListConnections returns all connections
func (m *Manager) ListConnections() []models.Connection {
	m.mu.RLock()
	defer m.mu.RUnlock()

	result := make([]models.Connection, 0, len(m.connections))
	for _, conn := range m.connections {
		result = append(result, models.Connection{
			ConnectionConfig: conn.Config,
			Status:           conn.Status,
			CreatedAt:        conn.CreatedAt,
			Error:            conn.Error,
		})
	}
	return result
}

// GetSQLDriver returns the SQL driver for query execution
func (m *Manager) GetSQLDriver() *SQLDriverImpl {
	return m.sqlDriver
}

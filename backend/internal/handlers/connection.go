package handlers

import (
	"log"
	"net/http"
	"strconv"

	"opendbm/internal/database"
	"opendbm/internal/models"

	"github.com/gin-gonic/gin"
)

// ListConnections returns all active connections
func ListConnections(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		connections := manager.ListConnections()
		c.JSON(http.StatusOK, connections)
	}
}

// CreateConnection creates a new database connection
func CreateConnection(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var config models.ConnectionConfig
		if err := c.ShouldBindJSON(&config); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		conn, err := manager.Connect(config)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, conn)
	}
}

// TestConnection tests a database connection without storing it
func TestConnection(manager *database.Manager) gin.HandlerFunc {
	log.Printf("TestConnection")
	return func(c *gin.Context) {
		var config models.ConnectionConfig
		if err := c.ShouldBindJSON(&config); err != nil {
			log.Printf("[TestConnection] Failed to parse request body: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		log.Printf("[TestConnection] Testing connection: type=%s, host=%s, port=%d, database=%s, user=%s",
			config.Type, config.Host, config.Port, config.Database, config.Username)

		if err := manager.TestConnection(config); err != nil {
			log.Printf("[TestConnection] Connection test failed: %v", err)
			c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
			return
		}

		log.Printf("[TestConnection] Connection test successful")
		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}

// DeleteConnection removes a connection
func DeleteConnection(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if err := manager.Delete(id); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}

// DisconnectConnection disconnects but keeps connection info
func DisconnectConnection(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if err := manager.Disconnect(id); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	}
}

// ExecuteQuery executes a SQL query
func ExecuteQuery(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.QueryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := manager.GetSQLDriver().ExecuteQuery(req.ConnectionID, req.SQL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

// ListDatabases lists all databases for a connection
func ListDatabases(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		databases, err := manager.GetSQLDriver().ListDatabases(id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, databases)
	}
}

// ListTables lists all tables in a database
func ListTables(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		db := c.Param("db")
		tables, err := manager.GetSQLDriver().ListTables(id, db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tables)
	}
}

// GetTableSchema returns column info for a table
func GetTableSchema(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		table := c.Param("table")
		schema, err := manager.GetSQLDriver().GetTableSchema(id, table)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, schema)
	}
}

// GetTableData returns paginated table data
func GetTableData(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		table := c.Param("table")

		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "100"))

		offset := (page - 1) * pageSize
		query := "SELECT * FROM " + table + " LIMIT " + strconv.Itoa(pageSize) + " OFFSET " + strconv.Itoa(offset)

		result, err := manager.GetSQLDriver().ExecuteQuery(id, query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, result)
	}
}

// ListCollections lists MongoDB collections (placeholder)
func ListCollections(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []string{})
	}
}

// FindDocuments finds MongoDB documents (placeholder)
func FindDocuments(manager *database.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, []map[string]interface{}{})
	}
}

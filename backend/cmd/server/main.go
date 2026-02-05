package main

import (
	"log"
	"os"

	"opendbm/internal/database"
	"opendbm/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Create connection manager
	manager := database.NewManager()

	// Create router
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:1420",
			"http://localhost:5173",
			"http://localhost:5174",
			"http://127.0.0.1:1420",
			"https://app.opendbm.com",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API routes
	api := r.Group("/api")
	{
		// Connection management
		api.GET("/connections", handlers.ListConnections(manager))
		api.POST("/connections", handlers.CreateConnection(manager))
		api.POST("/connections/test", handlers.TestConnection(manager))
		api.DELETE("/connections/:id", handlers.DeleteConnection(manager))
		api.POST("/connections/:id/disconnect", handlers.DisconnectConnection(manager))

		// Query execution
		api.POST("/query", handlers.ExecuteQuery(manager))

		// Database structure
		api.GET("/databases/:id", handlers.ListDatabases(manager))
		api.GET("/tables/:id/:db", handlers.ListTables(manager))
		api.GET("/schema/:id/:table", handlers.GetTableSchema(manager))

		// Table data
		api.GET("/data/:id/:db/:table", handlers.GetTableData(manager))

		// MongoDB specific
		api.GET("/collections/:id/:db", handlers.ListCollections(manager))
		api.POST("/documents/find", handlers.FindDocuments(manager))
	}

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8880"
	}

	log.Printf("OpenDBM server starting on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

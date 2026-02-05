package models

// QueryResult represents the result of a query execution
type QueryResult struct {
	Columns       []string                 `json:"columns"`
	Rows          []map[string]interface{} `json:"rows"`
	RowCount      int                      `json:"rowCount"`
	ExecutionTime int64                    `json:"executionTime"`
	Error         string                   `json:"error,omitempty"`
}

// TableInfo represents basic information about a table
type TableInfo struct {
	Name     string `json:"name"`
	Schema   string `json:"schema,omitempty"`
	Type     string `json:"type"` // table, view
	RowCount int64  `json:"rowCount,omitempty"`
}

// ColumnInfo represents column metadata
type ColumnInfo struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Nullable     bool   `json:"nullable"`
	DefaultValue string `json:"defaultValue,omitempty"`
	IsPrimaryKey bool   `json:"isPrimaryKey"`
	IsForeignKey bool   `json:"isForeignKey"`
	Comment      string `json:"comment,omitempty"`
}

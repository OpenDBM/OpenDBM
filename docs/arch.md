# OpenDBM 架构设计文档（Go 后端方案）

## 项目概述

OpenDBM 是一个**开源**的类似 Navicat 的跨平台数据库管理工具，同时支持**桌面端**和 **Web 端**。

### 核心特性

- ✅ 跨平台桌面应用（Windows / macOS / Linux）
- ✅ Web 网页版本
- ✅ 统一的用户体验
- ✅ 支持多种数据库（MySQL、PostgreSQL、MongoDB、Redis、SQLite）
- ✅ 代码复用率 100%

---

## 技术栈选型

### 核心决策：统一 Go 后端

```
架构理念：桌面端和 Web 端共用同一套 Go HTTP API

桌面端: Tauri 窗口 + 本地 Go 服务 (localhost:8080)
Web 端: React 前端 + 远程 Go 服务 (api.opendbm.com)
```

### 前端技术栈

- **框架**: React 19 + TypeScript (严格模式)
- **构建工具**: Vite
- **UI 库**: Tailwind CSS 4 + shadcn/ui (new-york 风格)
- **状态管理**: Zustand
- **代码编辑器**: Monaco Editor (VS Code 同款)
- **虚拟化**: @tanstack/react-virtual (处理大数据集)

### 后端技术栈（Go）

- **框架**: Gin (或 Echo / Fiber)
- **SQL 数据库层**: GORM (只用 Raw SQL，不用 ORM 功能)
- **GORM 驱动**:
  - MySQL: `gorm.io/driver/mysql`
  - PostgreSQL: `gorm.io/driver/postgres`
  - SQLite: `gorm.io/driver/sqlite`
  - SQL Server: `gorm.io/driver/sqlserver`
  - Oracle: `github.com/CengSin/oracle` (社区驱动)
- **NoSQL 数据库**:
  - MongoDB: `go.mongodb.org/mongo-driver` (官方)
  - Redis: `github.com/redis/go-redis/v9`
- **路由**: Gin Router
- **CORS**: `gin-contrib/cors`
- **配置**: `spf13/viper`

### 桌面端技术栈（Tauri）

- **作用**: 窗口壳 + Go 服务启动器
- **语言**: Rust（仅用于启动 Go 服务和管理窗口）
- **通信**: 不使用 Tauri 命令，直接 HTTP 调用本地 Go 服务

---

## 项目结构（Monorepo）

```
opendbm/
├── packages/
│   └── ui/                           # 共享前端 (100% 复用)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/               # shadcn 基础组件
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── MainPanel.tsx
│       │   │   │   └── StatusBar.tsx
│       │   │   ├── database/
│       │   │   │   ├── ConnectionForm.tsx
│       │   │   │   ├── DatabaseTree.tsx
│       │   │   │   ├── TableView.tsx
│       │   │   │   ├── MongoDbTree.tsx      # MongoDB 专用
│       │   │   │   └── RedisTree.tsx        # Redis 专用
│       │   │   ├── editor/
│       │   │   │   ├── SqlEditor.tsx
│       │   │   │   ├── MongoEditor.tsx
│       │   │   │   └── QueryResult.tsx
│       │   │   └── dialogs/
│       │   │       ├── NewConnection.tsx
│       │   │       └── ExportData.tsx
│       │   ├── stores/
│       │   │   ├── connectionStore.ts
│       │   │   ├── editorStore.ts
│       │   │   └── queryStore.ts
│       │   ├── api/
│       │   │   └── client.ts        # HTTP API 客户端（自动检测桌面/Web）
│       │   ├── types/
│       │   │   ├── database.ts
│       │   │   └── connection.ts
│       │   └── lib/
│       │       └── utils.ts         # cn() 工具
│       ├── package.json
│       └── tsconfig.json
│
├── apps/
│   │
│   └── web/                          # Web 应用
│       ├── src/                      # = packages/ui
│       │   ├── main.tsx
│       │   └── App.tsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── backend/                          # Go 后端 (桌面和 Web 共享)
│   ├── cmd/
│   │   └── server/
│   │       └── main.go               # HTTP 服务入口
│   ├── internal/
│   │   ├── handlers/                 # HTTP 请求处理器
│   │   │   ├── connection.go
│   │   │   ├── query.go
│   │   │   ├── schema.go
│   │   │   ├── data.go
│   │   │   └── document.go          # MongoDB
│   │   ├── database/                 # 数据库驱动层
│   │   │   ├── driver.go            # 驱动接口
│   │   │   ├── manager.go           # 连接管理器
│   │   │   ├── mysql.go
│   │   │   ├── postgres.go
│   │   │   ├── mongodb.go
│   │   │   ├── redis.go
│   │   │   └── sqlite.go
│   │   ├── models/                   # 数据模型
│   │   │   ├── connection.go
│   │   │   ├── query_result.go
│   │   │   └── schema.go
│   │   ├── middleware/               # 中间件
│   │   │   ├── cors.go
│   │   │   └── logger.go
│   │   └── config/
│   │       └── config.go             # 配置管理
│   ├── go.mod
│   └── go.sum
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 核心架构设计

### 1. 前端：自动检测平台

```typescript
// packages/ui/src/api/client.ts

// 自动检测是桌面还是 Web
const isDesktop = typeof window !== 'undefined' && window.__TAURI__;

// 桌面端调用本地服务，Web 端调用远程服务
const API_BASE = isDesktop
  ? 'http://localhost:8080/api'
  : import.meta.env.VITE_API_URL || 'https://api.opendbm.com/api';

// 统一的 API 客户端
export const api = {
  // 连接管理
  async createConnection(config: ConnectionConfig): Promise<string> {
    const res = await fetch(`${API_BASE}/connections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    return data.id;
  },

  async testConnection(config: ConnectionConfig): Promise<boolean> {
    const res = await fetch(`${API_BASE}/connections/test`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
    const data = await res.json();
    return data.success;
  },

  // 查询执行
  async executeQuery(connectionId: string, sql: string): Promise<QueryResult> {
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      body: JSON.stringify({ connection_id: connectionId, sql })
    });
    return res.json();
  },

  // 数据库结构
  async listDatabases(connectionId: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/databases/${connectionId}`);
    return res.json();
  },

  async listTables(connectionId: string, database: string): Promise<TableInfo[]> {
    const res = await fetch(`${API_BASE}/tables/${connectionId}/${database}`);
    return res.json();
  }
};
```

**关键优势**：前端代码完全相同，无需适配器模式！

---

### 2. Tauri：启动和管理 Go 服务

```rust
// apps/desktop/src-tauri/src/main.rs

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::{Manager, State};

struct GoServer {
    process: Mutex<Option<Child>>,
}

fn start_go_server(app: &tauri::AppHandle) -> Result<Child, std::io::Error> {
    // 获取打包的 Go 二进制路径
    let resource_path = app.path_resolver()
        .resolve_resource("bin/server")
        .expect("failed to resolve go server binary");
    
    #[cfg(target_os = "windows")]
    let resource_path = app.path_resolver()
        .resolve_resource("bin/server.exe")
        .expect("failed to resolve go server binary");
    
    // 启动 Go 服务
    let child = Command::new(resource_path)
        .env("PORT", "8080")
        .env("ENV", "desktop")
        .spawn()?;
    
    Ok(child)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 启动 Go 服务
            let server = start_go_server(&app.handle())?;
            app.manage(GoServer {
                process: Mutex::new(Some(server)),
            });
            
            // 等待服务就绪（简单轮询）
            std::thread::sleep(std::time::Duration::from_millis(500));
            
            println!("Go server started on http://localhost:8080");
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::Destroyed = event.event() {
                // 关闭窗口时终止 Go 服务
                if let Some(state) = event.window().app_handle().try_state::<GoServer>() {
                    if let Ok(mut process) = state.process.lock() {
                        if let Some(mut child) = process.take() {
                            let _ = child.kill();
                            println!("Go server stopped");
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**打包配置**：

```json
// apps/desktop/src-tauri/tauri.conf.json
{
  "tauri": {
    "bundle": {
      "resources": [
        "bin/server",      // macOS/Linux
        "bin/server.exe"   // Windows
      ]
    }
  }
}
```

---

### 3. Go 后端：统一的 HTTP API

#### 主入口

```go
// backend/cmd/server/main.go
package main

import (
    "log"
    "os"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "opendbm/internal/handlers"
    "opendbm/internal/database"
)

func main() {
    // 创建连接管理器
    manager := database.NewManager()
    
    // 创建路由
    r := gin.Default()
    
    // CORS 配置（Web 端需要）
    r.Use(cors.New(cors.Config{
        AllowOrigins: []string{
            "http://localhost:5173",         // 开发环境
            "http://localhost:5174",         
            "https://app.opendbm.com",       // 生产环境
        },
        AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders: []string{"Content-Type"},
    }))
    
    // API 路由
    api := r.Group("/api")
    {
        // 连接管理
        api.POST("/connections", handlers.CreateConnection(manager))
        api.POST("/connections/test", handlers.TestConnection(manager))
        api.DELETE("/connections/:id", handlers.DeleteConnection(manager))
        
        // 查询执行
        api.POST("/query", handlers.ExecuteQuery(manager))
        
        // 数据库结构
        api.GET("/databases/:id", handlers.ListDatabases(manager))
        api.GET("/tables/:id/:db", handlers.ListTables(manager))
        api.GET("/schema/:id/:table", handlers.GetTableSchema(manager))
        
        // MongoDB 专用
        api.GET("/collections/:id/:db", handlers.ListCollections(manager))
        api.POST("/documents/find", handlers.FindDocuments(manager))
    }
    
    // 启动服务
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Server starting on http://localhost:%s", port)
    r.Run(":" + port)
}
```

#### 数据库驱动接口

```go
// backend/internal/database/driver.go
package database

// 通用数据库驱动接口
type Driver interface {
    Connect(config ConnectionConfig) (string, error)
    Disconnect(id string) error
    Ping(id string) error
}

// SQL 数据库接口
type SQLDriver interface {
    Driver
    ExecuteQuery(id string, sql string) (*QueryResult, error)
    ExecuteSQL(id string, sql string) error
    ListDatabases(id string) ([]string, error)
    ListTables(id string, database string) ([]string, error)
}

// MongoDB 接口
type DocumentDriver interface {
    Driver
    ListCollections(id string, database string) ([]string, error)
    FindDocuments(id string, database string, collection string, filter map[string]interface{}) ([]map[string]interface{}, error)
}

// Redis 接口
type RedisDriver interface {
    Driver
    Get(id string, key string) (string, error)
    Set(id string, key, value string) error
    Keys(id string, pattern string) ([]string, error)
}

// 连接配置
type ConnectionConfig struct {
    Type     string `json:"type"`      // mysql, postgres, mongodb, redis, sqlite, oracle, sqlserver
    Host     string `json:"host"`
    Port     int    `json:"port"`
    Username string `json:"username"`
    Password string `json:"password"`
    Database string `json:"database"`
}
```

#### SQL 驱动实现（使用 GORM）

```go
// backend/internal/database/sql_driver.go
package database

import (
    "fmt"
    "sync"
    "github.com/google/uuid"
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
    "gorm.io/driver/postgres"
    "gorm.io/driver/sqlite"
    "gorm.io/driver/sqlserver"
    "github.com/CengSin/oracle"
)

type SQLDriver struct {
    connections     map[string]*gorm.DB
    connectionTypes map[string]string  // 记录数据库类型
    mu              sync.RWMutex
}

func NewSQLDriver() *SQLDriver {
    return &SQLDriver{
        connections:     make(map[string]*gorm.DB),
        connectionTypes: make(map[string]string),
    }
}

func (d *SQLDriver) Connect(config ConnectionConfig) (string, error) {
    var dialector gorm.Dialector
    
    switch config.Type {
    case "mysql":
        dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4",
            config.Username, config.Password, config.Host, config.Port, config.Database)
        dialector = mysql.Open(dsn)
    
    case "postgres":
        dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
            config.Host, config.Port, config.Username, config.Password, config.Database)
        dialector = postgres.Open(dsn)
    
    case "sqlite":
        dialector = sqlite.Open(config.Database)
    
    case "oracle":
        dsn := fmt.Sprintf("%s/%s@%s:%d/%s",
            config.Username, config.Password, config.Host, config.Port, config.Database)
        dialector = oracle.Open(dsn)
    
    case "sqlserver":
        dsn := fmt.Sprintf("sqlserver://%s:%s@%s:%d?database=%s",
            config.Username, config.Password, config.Host, config.Port, config.Database)
        dialector = sqlserver.Open(dsn)
    
    default:
        return "", fmt.Errorf("unsupported database type: %s", config.Type)
    }
    
    // 打开连接
    db, err := gorm.Open(dialector, &gorm.Config{
        // 可选：启用日志
        // Logger: logger.Default.LogMode(logger.Info),
    })
    if err != nil {
        return "", err
    }
    
    // 测试连接
    sqlDB, err := db.DB()
    if err != nil {
        return "", err
    }
    
    if err := sqlDB.Ping(); err != nil {
        return "", err
    }
    
    // 配置连接池
    sqlDB.SetMaxOpenConns(25)
    sqlDB.SetMaxIdleConns(5)
    
    // 生成唯一 ID 并存储
    id := uuid.New().String()
    d.mu.Lock()
    d.connections[id] = db
    d.connectionTypes[id] = config.Type
    d.mu.Unlock()
    
    return id, nil
}

func (d *SQLDriver) Disconnect(id string) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    
    db, exists := d.connections[id]
    if !exists {
        return fmt.Errorf("connection not found")
    }
    
    sqlDB, _ := db.DB()
    sqlDB.Close()
    
    delete(d.connections, id)
    delete(d.connectionTypes, id)
    return nil
}

func (d *SQLDriver) Ping(id string) error {
    d.mu.RLock()
    db, exists := d.connections[id]
    d.mu.RUnlock()
    
    if !exists {
        return fmt.Errorf("connection not found")
    }
    
    sqlDB, _ := db.DB()
    return sqlDB.Ping()
}

// 执行查询（只用 Raw SQL）
func (d *SQLDriver) ExecuteQuery(id string, query string) (*QueryResult, error) {
    d.mu.RLock()
    db, exists := d.connections[id]
    d.mu.RUnlock()
    
    if !exists {
        return nil, fmt.Errorf("connection not found")
    }
    
    // 使用 GORM Raw SQL
    var results []map[string]interface{}
    if err := db.Raw(query).Scan(&results).Error; err != nil {
        return nil, err
    }
    
    // 提取列名
    var columns []string
    if len(results) > 0 {
        for k := range results[0] {
            columns = append(columns, k)
        }
    }
    
    return &QueryResult{
        Columns: columns,
        Rows:    results,
    }, nil
}

// 执行 SQL（DDL、DML 等）
func (d *SQLDriver) ExecuteSQL(id string, sql string) error {
    d.mu.RLock()
    db, exists := d.connections[id]
    d.mu.RUnlock()
    
    if !exists {
        return fmt.Errorf("connection not found")
    }
    
    return db.Exec(sql).Error
}

// 列出数据库
func (d *SQLDriver) ListDatabases(id string) ([]string, error) {
    d.mu.RLock()
    dbType := d.connectionTypes[id]
    d.mu.RUnlock()
    
    var query string
    switch dbType {
    case "mysql":
        query = "SHOW DATABASES"
    case "postgres":
        query = "SELECT datname FROM pg_database WHERE datistemplate = false"
    case "sqlserver":
        query = "SELECT name FROM sys.databases"
    case "oracle":
        query = "SELECT username FROM all_users ORDER BY username"
    case "sqlite":
        return []string{}, nil  // SQLite 只有一个数据库
    }
    
    result, err := d.ExecuteQuery(id, query)
    if err != nil {
        return nil, err
    }
    
    var databases []string
    for _, row := range result.Rows {
        // 提取第一列的值作为数据库名
        for _, v := range row {
            if dbName, ok := v.(string); ok {
                databases = append(databases, dbName)
                break
            }
        }
    }
    
    return databases, nil
}

// 列出表
func (d *SQLDriver) ListTables(id string, database string) ([]string, error) {
    d.mu.RLock()
    dbType := d.connectionTypes[id]
    d.mu.RUnlock()
    
    var query string
    switch dbType {
    case "mysql":
        query = fmt.Sprintf("SHOW TABLES FROM `%s`", database)
    case "postgres":
        query = "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    case "sqlserver":
        query = "SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE'"
    case "oracle":
        query = "SELECT table_name FROM user_tables"
    case "sqlite":
        query = "SELECT name FROM sqlite_master WHERE type='table'"
    }
    
    result, err := d.ExecuteQuery(id, query)
    if err != nil {
        return nil, err
    }
    
    var tables []string
    for _, row := range result.Rows {
        for _, v := range row {
            if tableName, ok := v.(string); ok {
                tables = append(tables, tableName)
                break
            }
        }
    }
    
    return tables, nil
}
```

#### 连接管理器

```go
// backend/internal/database/manager.go
package database

import "sync"

type Manager struct {
    drivers map[string]Driver
    mu      sync.RWMutex
}

func NewManager() *Manager {
    return &Manager{
        drivers: make(map[string]Driver),
    }
}

func (m *Manager) GetDriver(dbType string) Driver {
    switch dbType {
    case "mysql":
        return NewMySQLDriver()
    case "postgres":
        return NewPostgresDriver()
    case "mongodb":
        return NewMongoDBDriver()
    case "redis":
        return NewRedisDriver()
    case "sqlite":
        return NewSQLiteDriver()
    default:
        return nil
    }
}
```

---

## 打包和部署

### 桌面端打包

```bash
# 1. 编译 Go 服务（多平台）

# macOS
cd backend
GOOS=darwin GOARCH=amd64 go build -o ../apps/desktop/src-tauri/bin/server cmd/server/main.go

# Windows
GOOS=windows GOARCH=amd64 go build -o ../apps/desktop/src-tauri/bin/server.exe cmd/server/main.go

# Linux
GOOS=linux GOARCH=amd64 go build -o ../apps/desktop/src-tauri/bin/server cmd/server/main.go

# 2. 打包 Tauri
cd apps/desktop
pnpm install
pnpm tauri build
```

### Web 端部署

```bash
# 1. 部署 Go 后端到服务器
cd backend
go build -o server cmd/server/main.go
./server  # 或用 systemd/docker 管理

# 2. 构建前端
cd apps/web
pnpm build

# 3. 部署到 CDN/服务器
# dist/ 目录部署到 Vercel/Netlify 等
```

---

## 性能优化策略

### 1. 连接池管理

```go
// 每个数据库连接配置连接池
db.SetMaxOpenConns(25)      // 最大连接数
db.SetMaxIdleConns(5)       // 最大空闲连接
db.SetConnMaxLifetime(5 * time.Minute)
```

### 2. 大数据集分页

```go
func (h *Handler) FetchTableData(c *gin.Context) {
    page := c.DefaultQuery("page", "1")
    pageSize := c.DefaultQuery("page_size", "100")
    
    offset := (page - 1) * pageSize
    sql := fmt.Sprintf("SELECT * FROM %s LIMIT %d OFFSET %d", 
        table, pageSize, offset)
    
    // 执行查询...
}
```

### 3. 前端虚拟滚动

```tsx
// packages/ui/src/components/database/TableView.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function TableView({ data }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      {virtualizer.getVirtualItems().map(row => (
        <div key={row.index}>{/* 渲染行 */}</div>
      ))}
    </div>
  );
}
```

---

## 技术决策说明

### 为什么选择 Go 而非 Rust？

| 对比项 | Go | Rust (原方案) |
|--------|-----|---------------|
| **学习曲线** | 1-2 周 | 2-3 月 |
| **编译速度** | 秒级 | 分钟级 |
| **生态成熟度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **贡献者友好** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **代码复用** | **100%** | 90% |

**结论**：对于开源项目，易于贡献比性能极致更重要。

### 为什么不用双后端（桌面 Rust + Web Go）？

- ❌ 需要维护两套代码
- ❌ 开发效率低（每个功能实现两遍）
- ❌ 容易产生不一致
- ✅ 统一后端维护成本低 50%+

### 为什么使用 GORM 而非 database/sql？

**我们只用 GORM 的 Raw SQL 功能，不使用 ORM 特性**

| 对比项 | GORM Raw SQL | database/sql |
|--------|--------------|--------------|
| **代码简洁度** | ✅ `db.Raw().Scan(&results)` | ❌ 需要 30 行样板代码 |
| **数据库支持** | ✅ 统一驱动接口（包括 Oracle） | ⚠️ 需要手动管理每个驱动 |
| **扩展性** | ✅ 导入 GORM 驱动即可 | ✅ 导入驱动即可 |
| **动态结果** | ✅ 自动处理为 `map[string]interface{}` | ❌ 需要手动解析 |
| **包体积** | ⚠️ +2MB | ✅ 最小 |
| **性能** | ⚠️ 微小开销（< 5%） | ✅ 零开销 |

**为什么不用 ORM 功能？**
- ❌ 用户的表结构是动态的、未知的
- ❌ 需要执行用户的原始 SQL（包括 DDL）
- ❌ ORM 要求预定义模型，不适合数据库管理工具

**核心策略**：
```go
// ✅ 使用 GORM 作为驱动层（获得简洁 API）
db, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{})

// ✅ 只用 Raw SQL（保持灵活性）
db.Raw(userSQL).Scan(&results)

// ❌ 不使用 ORM 功能
// db.Where().Find() - 不用 these
```

**结论**：GORM 提供了统一的驱动接口和简洁的 Raw SQL API，同时保持了执行任意 SQL 的灵活性。

---

## 总结

这个架构设计提供了：

1. **代码复用率 100%**：前端和后端完全共享
2. **开发效率最高**：只维护一套 Go 代码
3. **性能完全够用**：Go 性能足够数据库管理工具
4. **社区友好**：Go 学习曲线平缓，贡献者多
5. **部署简单**：Go 单二进制，跨平台编译

**核心理念**：从一开始就设计为桌面 + Web 双端，使用统一的 Go HTTP API，Tauri 只是窗口壳。

下一步：开始实现 Phase 1 MVP！🚀

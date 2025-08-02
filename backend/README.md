# Chat Backend - TypeScript 模块化版本

## 项目概述
这是一个基于 Express 和 WebSocket 的聊天后端服务，已完全迁移到 TypeScript 并采用模块化架构设计。

**当前状态：**
- 项目已完成 TypeScript 模块化重构，功能完善。
- 支持用户注册、登录、JWT 权限校验、WebSocket 实时通信、消息持久化接口（MongoDB）。
- 已集成本地 MongoDB 与 Docker 一键启动脚本。
- 受限于 macOS 15 兼容性，Homebrew 安装 MongoDB 可能失败，建议优先使用 Docker Desktop 启动数据库。
- 如数据库未安装，应用仍可正常编译和运行，但涉及数据持久化的接口会因无法连接数据库而报错。

## 功能特性
- 用户注册和登录系统
- WebSocket 实时消息传递
- 类型安全的 TypeScript 实现
- 心跳检测机制
- 模块化架构设计
- 完善的错误处理和输入验证
- 请求日志记录
- JWT 权限校验
- 消息持久化与历史查询（需 MongoDB）

## 数据库适配说明
- **推荐方式：Docker Desktop 启动 MongoDB**
    - 脚本：`npm run dev:all:docker`
    - 需先安装 Docker Desktop 并确保 docker 命令可用。
- **本地 MongoDB**
    - 脚本：`npm run dev:all`
    - 需本地已安装 mongod，且 macOS 15 可能不兼容。
- **如数据库未安装**
    - 应用仍可启动和调试，但涉及消息持久化/历史接口会因无法连接数据库报错。

## 一键启动命令
- Docker 方案（推荐）：
  ```sh
  npm run dev:all:docker
  ```
- 本地 MongoDB 方案：
  ```sh
  npm run dev:all
  ```

## macOS 15 兼容性提示
- Homebrew 在 macOS 15 下安装 MongoDB 可能失败，建议优先使用 Docker。
- 如 Docker Desktop 也无法运行，建议等待官方适配或临时使用旧系统/云开发环境。

## 项目结构

```
backend/
├── src/
│   ├── app.ts                    # 主应用入口
│   ├── types.ts                  # 类型定义
│   ├── routes/
│   │   └── apiRoutes.ts         # HTTP API 路由
│   └── services/
│       ├── userService.ts       # 用户管理服务
│       └── websocketService.ts  # WebSocket 服务
├── dist/                        # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

## 模块说明

### 1. 主应用 (`src/app.ts`)
- 整合 HTTP API 和 WebSocket 服务
- 配置中间件和错误处理
- 提供统一的应用入口

### 2. 类型定义 (`src/types.ts`)
- 定义所有接口和类型
- 确保类型安全

### 3. API 路由 (`src/routes/apiRoutes.ts`)
- 处理 HTTP REST API 请求
- 用户注册、登录、查询等功能

### 4. 用户服务 (`src/services/userService.ts`)
- 用户数据管理
- 业务逻辑封装
- 单例模式实现

### 5. WebSocket 服务 (`src/services/websocketService.ts`)
- 实时通信管理
- 连接状态监控
- 消息广播功能

## API 端点

### HTTP API (端口 3000)
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录  
- `GET /api/users` - 获取用户列表
- `GET /api/health` - 健康检查
- `GET /` - 重定向到健康检查

### WebSocket (端口 8080)
- `ws://localhost:8080` - WebSocket 连接端点

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式运行 (使用 ts-node)
npm run dev

# 构建 TypeScript
npm run build

# 运行构建后的代码
npm start

# 监听模式构建
npm run watch
```

## 使用示例

### 用户注册
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"id": "user123"}'
```

### 用户登录
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"id": "user123"}'
```

### WebSocket 连接
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello World!'
}));
```

## 架构优势

1. **模块化设计**: 各功能模块独立，便于维护和扩展
2. **类型安全**: TypeScript 提供编译时类型检查
3. **单一职责**: 每个模块职责明确
4. **易于测试**: 模块化结构便于单元测试
5. **可扩展性**: 新功能可以轻松添加新模块

## 后续优化建议

- [ ] 实现房间/频道系统
- [ ] 添加单元测试和集成测试
- [ ] 实现 API 限流和安全中间件
- [ ] 支持更多数据库类型（如 PostgreSQL）
- [ ] 支持更丰富的消息类型（如图片、文件等）

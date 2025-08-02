import express, { Request, Response } from 'express';
import { ApiResponse } from './types';
import apiRoutes from './routes/apiRoutes';
import { websocketService } from './services/websocketService';
import { databaseConfig } from './config/database';

/**
 * 聊天后端主应用
 * 整合 HTTP API 和 WebSocket 服务
 */
class ChatBackendApp {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // 请求日志中间件
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // API 路由
    this.app.use('/api', apiRoutes);
    
    // 根路径重定向到健康检查
    this.app.get('/', (req: Request, res: Response) => {
      res.redirect('/api/health');
    });
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 404 处理
    this.app.use('*', (req: Request, res: Response<ApiResponse>) => {
      return res.status(404).json({ message: 'Endpoint not found' });
    });

    // 全局错误处理中间件
    this.app.use((error: Error, req: Request, res: Response<ApiResponse>, next: Function) => {
      console.error('Global error handler:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    try {
      // 连接数据库
      await databaseConfig.connect();
      
      // 启动 HTTP 服务器
      this.app.listen(this.port, () => {
        console.log(`Express server listening on port ${this.port}`);
        console.log(`WebSocket server running with ${websocketService.getClientCount()} connected clients`);
        console.log(`Database connection status: ${databaseConfig.getConnectionStatus() ? 'Connected' : 'Disconnected'}`);
      });
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  /**
   * 获取 Express 应用实例
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// 创建并启动应用
const chatApp = new ChatBackendApp();
chatApp.start().catch(error => {
  console.error('Application startup failed:', error);
  process.exit(1);
});

export default chatApp.getApp();

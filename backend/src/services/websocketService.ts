import WebSocket from 'ws';
import { WebSocketMessage, ExtendedWebSocket } from '../types';
import { MessageRepository } from '../repositories/messageRepository';

/**
 * WebSocket 服务类 - 管理实时通信
 */
export class WebSocketService {
  private wss: WebSocket.Server;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageRepository: MessageRepository;

  constructor(port: number = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.messageRepository = new MessageRepository();
    this.setupWebSocketServer();
    this.startHeartbeat();
    console.log(`WebSocket server is running on ws://localhost:${port}`);
  }

  /**
   * 设置 WebSocket 服务器
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('A new client connected');
      this.handleConnection(ws);
    });

    // 清理定时器
    this.wss.on('close', () => {
      this.stopHeartbeat();
    });
  }

  /**
   * 处理新的 WebSocket 连接
   */
  private handleConnection(ws: WebSocket): void {
    // 将 WebSocket 转换为扩展类型
    const extendedWs = ws as ExtendedWebSocket;
    
    // 初始化连接状态
    extendedWs.isAlive = true;
    
    // 发送欢迎消息
    this.sendWelcomeMessage(ws);
    
    // 设置事件监听器
    this.setupEventListeners(ws, extendedWs);
  }

  /**
   * 发送欢迎消息
   */
  private sendWelcomeMessage(ws: WebSocket): void {
    const welcomeMessage: WebSocketMessage = {
      type: 'welcome',
      content: 'Welcome to the WebSocket server!',
      timestamp: new Date()
    };
    ws.send(JSON.stringify(welcomeMessage));
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(ws: WebSocket, extendedWs: ExtendedWebSocket): void {
    // 监听客户端消息
    ws.on('message', (data: WebSocket.Data) => {
      this.handleMessage(ws, extendedWs, data);
    });

    // 处理连接关闭
    ws.on('close', () => {
      console.log('A client disconnected');
    });

    // 处理连接错误
    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    // Ping/Pong 心跳检测
    ws.on('pong', () => {
      extendedWs.isAlive = true;
    });
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(ws: WebSocket, extendedWs: ExtendedWebSocket, data: WebSocket.Data): void {
    try {
      const messageStr = data.toString();
      console.log(`Received message: ${messageStr}`);

      // 尝试解析为 JSON，如果失败则作为普通文本处理
      let parsedMessage: WebSocketMessage;
      try {
        parsedMessage = JSON.parse(messageStr);
      } catch {
        parsedMessage = {
          type: 'message',
          content: messageStr,
          timestamp: new Date(),
          userId: extendedWs.userId
        };
      }

      // 持久化消息，仅保存 type 为 'message' 或 'broadcast' 的聊天消息
      if (parsedMessage.type === 'message' || parsedMessage.type === 'broadcast') {
        // 只保存必须字段，防止不规范消息导致异常
        const msgToSave = {
          from: parsedMessage.userId || 'anonymous',
          content: parsedMessage.content,
          timestamp: parsedMessage.timestamp ? new Date(parsedMessage.timestamp) : new Date(),
        };
        this.messageRepository.saveMessage(msgToSave).catch(err => {
          console.error('Failed to save message:', err);
        });
      }
      // 广播消息给所有连接的客户端
      this.broadcastMessage(parsedMessage, extendedWs);
    } catch (error) {
      console.error('Error processing message:', error);
      this.sendErrorMessage(ws, 'Failed to process message');
    }
  }

  /**
   * 广播消息给所有连接的客户端
   */
  private broadcastMessage(originalMessage: WebSocketMessage, senderWs: ExtendedWebSocket): void {
    const broadcastMessage: WebSocketMessage = {
      type: 'broadcast',
      content: originalMessage.content,
      timestamp: new Date(),
      userId: originalMessage.userId || senderWs.userId
    };

    this.wss.clients.forEach((client: WebSocket) => {
      const extendedClient = client as ExtendedWebSocket;
      if (extendedClient.readyState === WebSocket.OPEN) {
        extendedClient.send(JSON.stringify(broadcastMessage));
      }
    });
  }

  /**
   * 发送错误消息
   */
  private sendErrorMessage(ws: WebSocket, content: string): void {
    const errorMessage: WebSocketMessage = {
      type: 'error',
      content,
      timestamp: new Date()
    };
    ws.send(JSON.stringify(errorMessage));
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const extendedWs = ws as ExtendedWebSocket;
        if (!extendedWs.isAlive) {
          return extendedWs.terminate();
        }
        extendedWs.isAlive = false;
        extendedWs.ping();
      });
    }, 30000);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 获取连接的客户端数量
   */
  public getClientCount(): number {
    return this.wss.clients.size;
  }

  /**
   * 向特定用户发送消息
   */
  public sendToUser(userId: string, message: WebSocketMessage): boolean {
    let sent = false;
    this.wss.clients.forEach((client: WebSocket) => {
      const extendedClient = client as ExtendedWebSocket;
      if (extendedClient.userId === userId && extendedClient.readyState === WebSocket.OPEN) {
        extendedClient.send(JSON.stringify(message));
        sent = true;
      }
    });
    return sent;
  }

  /**
   * 关闭 WebSocket 服务器
   */
  public close(): void {
    this.stopHeartbeat();
    this.wss.close();
  }
}

// 导出单例实例
export const websocketService = new WebSocketService();

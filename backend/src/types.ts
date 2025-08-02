// 用户相关类型定义
export interface User {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 数据库用户模型（包含 MongoDB _id）
export interface UserDocument extends User {
  _id?: string;
}

// API 请求体类型
export interface RegisterRequest {
  id: string;
}

export interface LoginRequest {
  id: string;
}

// API 响应类型
export interface ApiResponse {
  message: string;
  token?: string | undefined;
}

export interface UserServiceResult {
  success: boolean;
  message: string;
  token?: string;
  data?: User;
}

// WebSocket 消息类型
export interface WebSocketMessage {
  type: 'message' | 'broadcast' | 'welcome' | 'error';
  content: string;
  timestamp?: Date;
  userId?: string | undefined;
}

// 扩展 WebSocket 类型以包含用户信息
import WebSocket from 'ws';
export interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

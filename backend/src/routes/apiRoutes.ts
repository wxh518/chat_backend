import express, { Request, Response } from 'express';
import { RegisterRequest, LoginRequest, ApiResponse, User } from '../types';
import { userService } from '../services/userService';
import { MessageRepository } from '../repositories/messageRepository';
import { IMessage } from '../models/Message';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * 用户注册路由
 */
router.post('/register', async (req: Request<{}, ApiResponse, RegisterRequest>, res: Response<ApiResponse>) => {
  console.log('Register request:', req.body);
  
  const { id } = req.body;
  const result = await userService.register(id);
  if (result.success) {
    return res.status(201).json({ message: result.message, token: result.token });
  } else {
    return res.status(400).json({ message: result.message });
  }
});

/**
 * 用户登录路由
 */
router.post('/login', async (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
  console.log('Login request:', req.body);
  
  const { id } = req.body;
  const result = await userService.login(id);
  if (result.success) {
    return res.status(200).json({ message: result.message, token: result.token });
  } else {
    return res.status(400).json({ message: result.message });
  }
});

/**
 * 获取所有用户列表
 */
router.get('/users', async (req: Request, res: Response<{ users: User[] }>) => {
  const users = await userService.getAllUsers();
  return res.status(200).json({ users });
});

/**
 * 健康检查端点
 */
router.get('/health', (req: Request, res: Response<{ status: string; timestamp: string }>) => {
  return res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * 获取历史消息（倒序，支持分页）
 * GET /messages?limit=20&before=2025-08-02T17:00:00.000Z
 */
router.get('/messages', authMiddleware, async (req: Request, res: Response<{ messages: IMessage[] }>) => {
  const limit = Number(req.query.limit) || 20;
  const before = req.query.before ? new Date(String(req.query.before)) : undefined;
  const repo = new MessageRepository();
  const messages = await repo.getMessages(limit, before);
  return res.status(200).json({ messages });
});

export default router;

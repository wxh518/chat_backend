import { User, UserDocument } from '../types';
import { IUserRepository, userRepository } from '../repositories/userRepository';

/**
 * 用户服务结果接口
 */

/**
 * 用户服务类 - 管理用户数据和业务逻辑
 * 使用仓储模式实现数据持久化
 */
import { signToken } from '../utils/auth';

import { UserServiceResult } from '../types';

export class UserService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  /**
   * 注册新用户
   */
  async register(id: string): Promise<UserServiceResult> {
    try {
      // 输入验证
      const validation = this.validateUserId(id);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      const trimmedId = id.trim();

      // 检查用户是否已存在
      const userExists = await this.repository.exists(trimmedId);
      if (userExists) {
        return { success: false, message: 'Account already registered' };
      }

      // 创建新用户
      const newUser = await this.repository.create({ id: trimmedId });
      
      console.log(`User registered: ${trimmedId}`);
      return { 
        success: true, 
        message: 'Registration successful',
        data: newUser
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * 用户登录验证
   */
  async login(id: string): Promise<UserServiceResult> {
    try {
      // 输入验证
      const validation = this.validateUserId(id);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      const trimmedId = id.trim();

      // 检查用户是否存在
      const user = await this.repository.findById(trimmedId);
      if (!user) {
        return { success: false, message: '用户不存在' };
      }

      console.log(`User logged in: ${trimmedId}`);
      const token = signToken({ userId: trimmedId });
      return { 
        success: true, 
        message: '登录成功',
        data: user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '登录失败'
      };
    }
  }

  /**
   * 获取所有用户
   */
  async getAllUsers(): Promise<UserDocument[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  /**
   * 根据ID查找用户
   */
  async findUserById(id: string): Promise<UserDocument | null> {
    try {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return null;
      }
      return await this.repository.findById(id.trim());
    } catch (error) {
      console.error('Find user error:', error);
      return null;
    }
  }

  /**
   * 检查用户是否存在
   */
  async userExists(id: string): Promise<boolean> {
    try {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        return false;
      }
      return await this.repository.exists(id.trim());
    } catch (error) {
      console.error('User exists check error:', error);
      return false;
    }
  }

  /**
   * 获取用户总数
   */
  async getUserCount(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      console.error('Get user count error:', error);
      return 0;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<UserServiceResult> {
    try {
      const validation = this.validateUserId(id);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      const trimmedId = id.trim();
      const deleted = await this.repository.delete(trimmedId);
      
      if (deleted) {
        console.log(`User deleted: ${trimmedId}`);
        return { success: true, message: '删除成功' };
      } else {
        return { success: false, message: '用户不存在' };
      }
    } catch (error) {
      console.error('Delete user error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '删除失败'
      };
    }
  }

  /**
   * 验证用户ID
   */
  private validateUserId(id: string): { isValid: boolean; message: string } {
    if (!id || typeof id !== 'string') {
      return { isValid: false, message: 'Valid ID is required' };
    }

    const trimmedId = id.trim();
    if (trimmedId.length === 0) {
      return { isValid: false, message: 'ID cannot be empty' };
    }

    if (trimmedId.length > 50) {
      return { isValid: false, message: 'ID cannot exceed 50 characters' };
    }

    return { isValid: true, message: 'Valid' };
  }
}

// 导出单例实例
export const userService = new UserService(userRepository);

// 默认导出
export default UserService;

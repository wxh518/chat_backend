import { UserModel, IUserDocument } from '../models/User';
import { User, UserDocument } from '../types';

/**
 * 用户仓储接口
 * 定义用户数据访问的抽象方法
 */
export interface IUserRepository {
  create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<UserDocument>;
  findById(id: string): Promise<UserDocument | null>;
  findAll(): Promise<UserDocument[]>;
  exists(id: string): Promise<boolean>;
  update(id: string, userData: Partial<User>): Promise<UserDocument | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

/**
 * MongoDB 用户仓储实现
 * 实现用户数据的 CRUD 操作
 */
export class MongoUserRepository implements IUserRepository {
  
  /**
   * 创建新用户
   */
  async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    try {
      const user = new UserModel(userData);
      const savedUser = await user.save();
      return savedUser.toUserObject();
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User with ID '${userData.id}' already exists`);
      }
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<UserDocument | null> {
    try {
      const user = await UserModel.findByUserId(id);
      return user ? user.toUserObject() : null;
    } catch (error) {
      throw new Error(`Failed to find user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<UserDocument[]> {
    try {
      const users = await UserModel.find().sort({ createdAt: -1 });
      return users.map((user: any) => user.toUserObject());
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 检查用户是否存在
   */
  async exists(id: string): Promise<boolean> {
    try {
      return await UserModel.userExists(id);
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 更新用户信息
   */
  async update(id: string, userData: Partial<User>): Promise<UserDocument | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { id },
        { ...userData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return updatedUser ? updatedUser.toUserObject() : null;
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 删除用户
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await UserModel.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取用户总数
   */
  async count(): Promise<number> {
    try {
      return await UserModel.countDocuments();
    } catch (error) {
      throw new Error(`Failed to count users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// 导出仓储实例
export const userRepository = new MongoUserRepository();

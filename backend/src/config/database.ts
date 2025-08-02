import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 数据库配置类
 * 负责 MongoDB 连接管理
 */
export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * 获取数据库配置单例实例
   */
  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  /**
   * 连接到 MongoDB
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_backend';
      
      await mongoose.connect(mongoUri);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      
      // 监听连接事件
      mongoose.connection.on('error', (error: Error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开数据库连接
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * 检查连接状态
   */
  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * 获取数据库连接实例
   */
  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}

// 导出单例实例
export const databaseConfig = DatabaseConfig.getInstance();

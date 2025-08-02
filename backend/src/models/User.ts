import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserDocument } from '../types';

/**
 * Mongoose 用户文档接口
 * 只继承 mongoose.Document，避免 id 属性冲突
 */
export interface IUserDocument extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  _id: mongoose.Types.ObjectId;
  toUserObject(): UserDocument;
}

/**
 * 用户模型静态方法接口
 */
export interface IUserModel extends Model<IUserDocument> {
  findByUserId(userId: string): Promise<IUserDocument | null>;
  userExists(userId: string): Promise<boolean>;
}

/**
 * 用户 Schema 定义
 */
const UserSchema: Schema<IUserDocument> = new Schema(
  {
    id: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      trim: true,
      minlength: [1, 'User ID cannot be empty'],
      maxlength: [50, 'User ID cannot exceed 50 characters']
    }
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    versionKey: false // 禁用 __v 字段
  }
);

// 添加索引以提高查询性能
// id 已经通过 unique: true 设置了索引，不需要重复设置
UserSchema.index({ createdAt: -1 });

// 实例方法：转换为普通用户对象
UserSchema.methods.toUserObject = function(): UserDocument {
  return {
    _id: this._id.toString(),
    id: this.id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// 静态方法：根据用户ID查找
UserSchema.statics.findByUserId = function(userId: string) {
  return this.findOne({ id: userId });
};

// 静态方法：检查用户是否存在
UserSchema.statics.userExists = function(userId: string): Promise<boolean> {
  return this.exists({ id: userId }).then((result: any) => !!result);
};

// 预保存中间件：数据验证和清理
UserSchema.pre('save', function(next: any) {
  // 清理用户ID
  if (this.id) {
    this.id = this.id.trim();
  }
  next();
});

// 查询中间件：排除敏感信息（如果将来有的话）
UserSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  // 可以在这里添加字段过滤逻辑
});

/**
 * 用户模型
 */
export const UserModel = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default UserModel;

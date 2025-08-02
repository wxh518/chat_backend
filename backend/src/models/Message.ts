import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  from: string;        // 发送者用户名或ID
  to?: string;         // 接收者用户名或ID（可选，群聊可为空）
  content: string;     // 消息内容
  timestamp: Date;     // 发送时间
}

export interface IMessageDocument extends IMessage, Document {}

const MessageSchema = new Schema<IMessageDocument>({
  from: { type: String, required: true },
  to: { type: String },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);

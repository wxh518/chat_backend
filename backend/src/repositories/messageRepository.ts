import { MessageModel, IMessage, IMessageDocument } from '../models/Message';

export class MessageRepository {
  /** 保存消息到数据库 */
  async saveMessage(message: IMessage): Promise<IMessageDocument> {
    const msg = new MessageModel(message);
    return await msg.save();
  }

  /** 查询历史消息，按时间倒序，支持分页 */
  async getMessages(limit = 20, before?: Date): Promise<IMessageDocument[]> {
    const query: any = {};
    if (before) query.timestamp = { $lt: before };
    return MessageModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

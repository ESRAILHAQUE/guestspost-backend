import { Message, IMessage, MessageContent } from "./message.model";

export class MessageService {
  async getAllMessages(): Promise<IMessage[]> {
    return await Message.find().sort({ date: -1 });
  }

  async getMessageById(commentId: string): Promise<IMessage | null> {
    return await Message.findOne({ commentId });
  }

  async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    const newMessage = new Message(messageData);
    return await newMessage.save();
  }

  async updateMessage(
    commentId: string,
    updateData: Partial<IMessage>
  ): Promise<IMessage | null> {
    return await Message.findOneAndUpdate({ commentId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async addMessageToThread(
    commentId: string,
    newMessage: MessageContent
  ): Promise<IMessage | null> {
    const message = await Message.findOne({ commentId });
    if (!message) return null;

    message.content.push(newMessage);
    message.date = new Date();
    return await message.save();
  }

  async deleteMessage(commentId: string): Promise<void> {
    await Message.findOneAndDelete({ commentId });
  }

  async getMessageStats() {
    const total = await Message.countDocuments();
    const unread = await Message.countDocuments({ approved: 0 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Message.countDocuments({ date: { $gte: today } });

    return {
      total,
      unread,
      todayCount,
    };
  }
}

export const messageService = new MessageService();

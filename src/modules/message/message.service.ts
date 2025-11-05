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
    message.date = new Date(); // Update date so SSE stream can detect new messages
    message.approved = 1; // Mark as approved
    
    console.log(`Added reply to thread ${commentId}, new content length:`, message.content.length);
    return await message.save();
  }

  async deleteMessage(commentId: string): Promise<void> {
    await Message.findOneAndDelete({ commentId });
  }

  async getMessagesByUser(userId: string): Promise<IMessage[]> {
    return await Message.find({ userId }).sort({ date: -1 });
  }

  async getMessagesByUserEmail(userEmail: string): Promise<IMessage[]> {
    try {
      if (!userEmail) {
        return [];
      }
      
      const messages = await Message.find({ userEmail }).sort({ date: -1 });
      return messages || [];
    } catch (error) {
      console.error("Error fetching messages by user email:", error);
      return [];
    }
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

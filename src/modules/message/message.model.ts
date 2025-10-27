import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  commentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "thread" | "message";
  content: MessageContent[];
  approved: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageContent {
  text: string;
  isUser: boolean;
  time: string;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
}

const MessageSchema = new Schema<IMessage>(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["thread", "message"],
      default: "message",
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    approved: {
      type: Number,
      default: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
MessageSchema.index({ date: -1 });
MessageSchema.index({ userId: 1, date: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);

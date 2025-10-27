import { Request, Response, NextFunction } from "express";
import { messageService } from "./message.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

export const getMessages = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const messages = await messageService.getAllMessages();
    ApiResponse.success(res, messages, "Messages retrieved successfully");
  }
);

export const getMessageById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const message = await messageService.getMessageById(id);
    ApiResponse.success(res, message, "Message retrieved successfully");
  }
);

export const createMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const messageData = req.body;
    const newMessage = await messageService.createMessage(messageData);
    ApiResponse.created(res, newMessage, "Message created successfully");
  }
);

export const updateMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedMessage = await messageService.updateMessage(id, updateData);
    ApiResponse.success(res, updatedMessage, "Message updated successfully");
  }
);

export const addReplyToMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const newReply = req.body;
    const updatedMessage = await messageService.addMessageToThread(
      id,
      newReply
    );
    ApiResponse.success(res, updatedMessage, "Reply added successfully");
  }
);

export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await messageService.deleteMessage(id);
    ApiResponse.success(res, null, "Message deleted successfully");
  }
);

export const getMessageStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const stats = await messageService.getMessageStats();
    ApiResponse.success(
      res,
      stats,
      "Message statistics retrieved successfully"
    );
  }
);
// Enhanced message validation

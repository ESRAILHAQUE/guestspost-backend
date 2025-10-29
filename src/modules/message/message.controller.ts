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

export const getMyMessages = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userEmail = req.user?.userEmail;
    if (!userEmail) {
      throw new Error("User email not found");
    }
    const messages = await messageService.getMessagesByUserEmail(userEmail);
    ApiResponse.success(res, messages, "User messages retrieved successfully");
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

// Server-Sent Events endpoint for real-time message updates
export const messageStream = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const lastId = req.query.lastId as string;
    let userEmail = req.user?.userEmail;

    // If no user from middleware, try to get from query (for SSE compatibility)
    if (!userEmail) {
      // Try to verify token from query parameter
      const token = req.query.token as string;
      if (token) {
        try {
          const { verifyAccessToken } = await import("@/utils/jwt.utils");
          const decoded = verifyAccessToken(token);
          if (decoded && decoded.userEmail) {
            userEmail = decoded.userEmail;
          }
        } catch (error) {
          // Invalid token
        }
      }
    }

    if (!userEmail) {
      res.status(401).write(`data: ${JSON.stringify({ type: "error", message: "Unauthorized" })}\n\n`);
      res.end();
      return;
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in nginx

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Poll for new messages
    const pollInterval = setInterval(async () => {
      try {
        const messages = await messageService.getMessagesByUserEmail(userEmail);
        
        // Find messages newer than lastId
        const newMessages = messages
          .filter((msg) => {
            if (!lastId) return true;
            return msg.commentId && parseInt(msg.commentId) > parseInt(lastId);
          })
          .flatMap((msg) => {
            // Extract individual messages from content array
            if (Array.isArray(msg.content)) {
              return msg.content.map((content: any) => ({
                ...content,
                comment_id: msg.commentId,
                commentId: msg.commentId,
              }));
            }
            return [];
          });

        // Send each new message
        for (const message of newMessages) {
          res.write(`data: ${JSON.stringify(message)}\n\n`);
        }
      } catch (error) {
        console.error("Error polling messages:", error);
        res.write(`data: ${JSON.stringify({ type: "error", message: "Error polling messages" })}\n\n`);
      }
    }, 2000); // Poll every 2 seconds

    // Clean up on client disconnect
    req.on("close", () => {
      clearInterval(pollInterval);
      res.end();
    });
  }
);

// Enhanced message validation

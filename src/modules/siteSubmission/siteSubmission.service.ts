import { SiteSubmission, ISiteSubmission } from "./siteSubmission.model";
import { AppError } from "@/utils/AppError";
import {
  sendSiteSubmissionApprovalEmail,
  sendSiteSubmissionRejectionEmail,
  sendSiteSubmissionReceivedEmail,
} from "@/utils/email.utils";
import { config } from "@/config/env.config";
import { deleteFileFromVPS } from "@/utils/file.utils";

export interface CreateSiteSubmissionDto {
  userId?: string;
  userName: string;
  userEmail: string;
  websites: string[];
  isOwner: boolean;
  publisherName?: string;
  country?: string;
  phone?: string;
  message?: string;
  siteDescription?: string;
  monthlyTraffic?: string;
  domainAuthority?: string;
  domainRating?: string;
  websiteOwner?: string;
  csvFile?: {
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface UpdateSiteSubmissionDto {
  status?: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: string;
}

export interface SiteSubmissionFilters {
  status?: string;
  userEmail?: string;
  page?: number;
  limit?: number;
}

class SiteSubmissionService {
  async createSiteSubmission(data: CreateSiteSubmissionDto): Promise<ISiteSubmission> {
    const siteSubmission = new SiteSubmission(data);
    const savedSubmission = await siteSubmission.save();

    // Send email notification to user
    try {
      await sendSiteSubmissionReceivedEmail({
        userEmail: data.userEmail,
        userName: data.userName,
        websites: data.websites,
        frontendUrl: config.app.frontendUrl,
      });
    } catch (error) {
      console.error("Failed to send site submission received email:", error);
      // Don't fail the submission if email fails
    }

    return savedSubmission;
  }

  async getSiteSubmissions(filters: SiteSubmissionFilters): Promise<{
    siteSubmissions: ISiteSubmission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, userEmail, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;
    if (userEmail) query.userEmail = userEmail;

    const [siteSubmissions, total] = await Promise.all([
      SiteSubmission.find(query)
        .populate("userId", "user_nicename user_email")
        .populate("reviewedBy", "user_nicename user_email")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      SiteSubmission.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { siteSubmissions, total, page, limit, totalPages };
  }

  async getSiteSubmissionById(id: string): Promise<ISiteSubmission> {
    const siteSubmission = await SiteSubmission.findById(id)
      .populate("userId", "user_nicename user_email")
      .populate("reviewedBy", "user_nicename user_email");

    if (!siteSubmission) {
      throw new AppError("Site submission not found", 404);
    }

    return siteSubmission;
  }

  async updateSiteSubmission(
    id: string,
    data: UpdateSiteSubmissionDto
  ): Promise<ISiteSubmission> {
    // Get the current submission to check if status is changing
    const currentSubmission = await SiteSubmission.findById(id);
    if (!currentSubmission) {
      throw new AppError("Site submission not found", 404);
    }

    const oldStatus = currentSubmission.status;
    const newStatus = data.status;

    // Update the submission
    const siteSubmission = await SiteSubmission.findByIdAndUpdate(
      id,
      {
        ...data,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("userId", "user_nicename user_email")
      .populate("reviewedBy", "user_nicename user_email");

    if (!siteSubmission) {
      throw new AppError("Site submission not found", 404);
    }

    // Send email notification if status changed
    if (newStatus && oldStatus !== newStatus) {
      try {
        if (newStatus === "approved") {
          await sendSiteSubmissionApprovalEmail({
            userEmail: siteSubmission.userEmail,
            userName: siteSubmission.userName,
            websites: siteSubmission.websites,
            frontendUrl: config.app.frontendUrl,
            adminNotes: data.adminNotes,
          });
        } else if (newStatus === "rejected") {
          await sendSiteSubmissionRejectionEmail({
            userEmail: siteSubmission.userEmail,
            userName: siteSubmission.userName,
            websites: siteSubmission.websites,
            frontendUrl: config.app.frontendUrl,
            adminNotes: data.adminNotes,
          });
        }
      } catch (error) {
        console.error("Failed to send site submission status email:", error);
        // Don't fail the update if email fails
      }
    }

    return siteSubmission;
  }

  async deleteSiteSubmission(id: string): Promise<void> {
    const siteSubmission = await SiteSubmission.findById(id);

    if (!siteSubmission) {
      throw new AppError("Site submission not found", 404);
    }

    // Delete associated file from VPS if exists
    if (siteSubmission.csvFile?.filePath) {
      try {
        await deleteFileFromVPS(siteSubmission.csvFile.filePath);
      } catch (error) {
        console.error("Failed to delete file from VPS:", error);
        // Continue with deletion even if file deletion fails
      }
    }

    await SiteSubmission.findByIdAndDelete(id);
  }

  async getSiteSubmissionStats(filters: SiteSubmissionFilters = {}): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const query: any = {};
    if (filters.userEmail) query.userEmail = filters.userEmail;

    const [total, pending, approved, rejected] = await Promise.all([
      SiteSubmission.countDocuments(query),
      SiteSubmission.countDocuments({ ...query, status: "pending" }),
      SiteSubmission.countDocuments({ ...query, status: "approved" }),
      SiteSubmission.countDocuments({ ...query, status: "rejected" }),
    ]);

    return { total, pending, approved, rejected };
  }

  async getSiteSubmissionsByUser(userEmail: string, filters: SiteSubmissionFilters = {}): Promise<ISiteSubmission[]> {
    const query: any = { userEmail };
    if (filters.status) query.status = filters.status;

    return await SiteSubmission.find(query)
      .populate("userId", "user_nicename user_email")
      .populate("reviewedBy", "user_nicename user_email")
      .sort({ submittedAt: -1 });
  }
}

export const siteSubmissionService = new SiteSubmissionService();

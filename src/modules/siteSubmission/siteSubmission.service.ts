import { SiteSubmission, ISiteSubmission } from "./siteSubmission.model";
import { AppError } from "@/utils/AppError";

export interface CreateSiteSubmissionDto {
  userId: string;
  userName: string;
  userEmail: string;
  websites: string[];
  isOwner: boolean;
  csvFile?: {
    name: string;
    data: string;
    type: string;
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
    return await siteSubmission.save();
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

    return siteSubmission;
  }

  async deleteSiteSubmission(id: string): Promise<void> {
    const siteSubmission = await SiteSubmission.findByIdAndDelete(id);

    if (!siteSubmission) {
      throw new AppError("Site submission not found", 404);
    }
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

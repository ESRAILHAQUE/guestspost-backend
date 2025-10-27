import { Activity, IActivity } from "./activity.model";

export class ActivityService {
  async getAllActivities(limit = 100): Promise<IActivity[]> {
    return await Activity.find().sort({ createdAt: -1 }).limit(limit);
  }

  async getActivitiesByType(type: string, limit = 50): Promise<IActivity[]> {
    return await Activity.find({ type }).sort({ createdAt: -1 }).limit(limit);
  }

  async getActivitiesByUser(userId: string, limit = 50): Promise<IActivity[]> {
    return await Activity.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  async getActivityStats() {
    const total = await Activity.countDocuments();
    const byType = await Activity.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total,
      byType,
    };
  }
}

export const activityService = new ActivityService();

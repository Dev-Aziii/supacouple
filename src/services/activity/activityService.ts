import { activitiesRepository } from '../repositories/activitiesRepository';
import type {
  ActivityItem,
  CreateActivityDTO,
  GroupedActivities,
} from '../../types/activity';

export class ActivityService {
  async getActivityFeed(
    coupleId: string,
    page = 1,
    limit = 15
  ): Promise<{ data: ActivityItem[]; hasMore: boolean; page: number }> {
    if (!coupleId) {
      return { data: [], hasMore: false, page: 1 };
    }
    return activitiesRepository.paginate(coupleId, page, limit);
  }

  async createActivity(dto: CreateActivityDTO): Promise<ActivityItem> {
    return activitiesRepository.create(dto);
  }

  async markViewed(activityId: string, userId: string): Promise<boolean> {
    if (!activityId || !userId) return false;
    return activitiesRepository.markViewed(activityId, userId);
  }

  groupActivities(activities: ActivityItem[]): GroupedActivities[] {
    if (!activities || activities.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const groupsMap = new Map<string, ActivityItem[]>();

    for (const activity of activities) {
      const actDate = new Date(activity.createdAt);
      const actMidnight = new Date(
        actDate.getFullYear(),
        actDate.getMonth(),
        actDate.getDate()
      ).getTime();

      let label: string;
      if (actMidnight === today) {
        label = 'Today';
      } else if (actMidnight === yesterday) {
        label = 'Yesterday';
      } else {
        label = actDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: actDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!groupsMap.has(label)) {
        groupsMap.set(label, []);
      }
      groupsMap.get(label)!.push(activity);
    }

    const result: GroupedActivities[] = [];
    for (const [dateLabel, items] of groupsMap.entries()) {
      result.push({
        dateLabel,
        activities: items,
      });
    }

    return result;
  }
}

export const activityService = new ActivityService();

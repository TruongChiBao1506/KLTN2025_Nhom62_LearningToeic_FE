import axiosClient from "./axiosClient";

class AchievementService {
  constructor(baseUrl = "/achievements") {
    this.baseUrl = baseUrl;
  }

  // Lấy danh sách thành tích của user
  async getUserAchievements(userId) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/${userId}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch achievements"
      };
    }
  }

  // Lấy thống kê user
  async getUserStats(userId) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/stats/${userId}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch user stats"
      };
    }
  }

  // Ghi nhận hoạt động
  async recordActivity(userId, action, data) {
    try {
      const response = await axiosClient.post(`${this.baseUrl}/record-activity`, {
        userId,
        action,
        data
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error recording activity:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to record activity"
      };
    }
  }

  // Các action types tiện ích
  async recordCompleteQuestion(userId, count, skill = null) {
    return this.recordActivity(userId, 'complete_question', {
      count,
      skill
    });
  }

  async recordCompleteTest(userId, score, examType = null) {
    return this.recordActivity(userId, 'complete_test', {
      score,
      examType
    });
  }

  async recordLogin(userId) {
    return this.recordActivity(userId, 'login', {});
  }

  async recordLearnVocab(userId, count, vocabId = null) {
    return this.recordActivity(userId, 'learn_vocab', {
      count,
      vocabId
    });
  }

  async recordSaveVocab(userId, count, vocabId = null) {
    return this.recordActivity(userId, 'save_vocab', {
      count,
      vocabId
    });
  }

  // Ghi nhận hoạt động với notification
  async recordActivityWithNotification(userId, action, data) {
    try {
      const response = await axiosClient.post(`${this.baseUrl}/record-activity`, {
        userId,
        action,
        data,
        includeNotifications: true // Flag để backend trả về unlocked achievements
      });

      return {
        success: true,
        data: response.data || response,
        unlockedAchievements: response.data?.unlockedAchievements || [],
        notifications: response.data?.notifications || []
      };
    } catch (error) {
      console.error("Error recording activity with notification:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to record activity",
        unlockedAchievements: [],
        notifications: []
      };
    }
  }

  // Các action types tiện ích với notification
  async recordCompleteQuestionWithNotification(userId, count, skill = null) {
    return this.recordActivityWithNotification(userId, 'complete_question', {
      count,
      skill
    });
  }

  async recordCompleteTestWithNotification(userId, score, examType = null) {
    return this.recordActivityWithNotification(userId, 'complete_test', {
      score,
      examType
    });
  }

  async recordLearnVocabWithNotification(userId, count, vocabId = null) {
    return this.recordActivityWithNotification(userId, 'learn_vocab', {
      count,
      vocabId
    });
  }

  async recordSaveVocabWithNotification(userId, count, vocabId = null) {
    return this.recordActivityWithNotification(userId, 'save_vocab', {
      count,
      vocabId
    });
  }

  async recordContributeContentWithNotification(userId, contentType, contentId = null) {
    return this.recordActivityWithNotification(userId, 'contribute', {
      contentType,
      contentId
    });
  }

  async getAllAchievements() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching all achievements:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch achievements"
      };
    }
  }
  // Admin functions
  async seedAchievements() {
    try {
      const response = await axiosClient.post(`${this.baseUrl}/seed`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error seeding achievements:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to seed achievements"
      };
    }
  }
}

const achievementService = new AchievementService();
export default achievementService;
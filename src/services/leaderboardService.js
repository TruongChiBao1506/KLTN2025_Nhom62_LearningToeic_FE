import axiosClient from "./axiosClient";

class LeaderboardService {
  constructor(baseUrl = "/leaderboard") {
    this.baseUrl = baseUrl;
  }

  // Lấy bảng xếp hạng theo achievement points
  async getLeaderboard(limit = 50, period = 'all') {
    try {
      const response = await axiosClient.get(`${this.baseUrl}`, {
        params: { limit, period }
      });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch leaderboard"
      };
    }
  }

  // Lấy vị trí của user hiện tại
  async getUserRank(userId) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/rank/${userId}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching user rank:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch user rank"
      };
    }
  }

  // Lấy top 3 players
  async getTopPlayers() {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/top`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error("Error fetching top players:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch top players"
      };
    }
  }
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;
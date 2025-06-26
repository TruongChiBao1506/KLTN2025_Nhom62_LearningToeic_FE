import axiosClient from "./axiosClient";

class ScoreTableService {
  constructor(baseUrl = "/score-tables") {
    this.baseUrl = baseUrl;
  }

  async getListeningScoreTable() {
    const response = await axiosClient.get(`${this.baseUrl}/listening`);
    return response;
  }

  async getReadingScoreTable() {
    const response = await axiosClient.get(`${this.baseUrl}/reading`);
    return response;
  }

  async getScoreTables() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async getSpeakingScoreTable() {
    const response = await axiosClient.get(`${this.baseUrl}/speaking`);
    return response;
  }

  async getWritingScoreTable() {
    const response = await axiosClient.get(`${this.baseUrl}/writing`);
    return response;
  }
}

export default new ScoreTableService();

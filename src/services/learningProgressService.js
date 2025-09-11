import axiosClient from './axiosClient';

/**
 * Learning Progress Service
 * 
 * Service này kết nối với backend learning progress routes:
 * - GET /learning-progress/dashboard
 * - GET /learning-progress/overview  
 * - GET /learning-progress/skills
 * - GET /learning-progress/time-progress
 * - GET /learning-progress/strengths-weaknesses
 * - POST /learning-progress/vocabulary-answer
 * - POST /learning-progress/grammar-answer
 * 
 * Tất cả routes đều có middleware verifyToken
 */
class LearningProgressService {
    constructor(baseUrl = '/learning-progress') {
        this.baseUrl = baseUrl;
    }

    // Dashboard routes - khớp với backend routes
    
    /**
     * Lấy thông tin dashboard đầy đủ
     * Backend: GET /learning-progress/dashboard
     * @returns {Promise} Dashboard data including goalProgress, recentActivity, currentStreak, etc.
     */
    async getDashboard() {
        const response = await axiosClient.get(`${this.baseUrl}/dashboard`);
        return response;
    }

    /**
     * Lấy thông tin tổng quan (4 thẻ statistics)
     * Backend: GET /learning-progress/overview
     * @returns {Promise} Overview data including totalExams, averageScore, totalStudyTime, completedLessons
     */
    async getOverview() {
        const response = await axiosClient.get(`${this.baseUrl}/overview`);
        return response;
    }

    /**
     * Lấy phân tích kỹ năng (dữ liệu cho biểu đồ)
     * Backend: GET /learning-progress/skills
     * @returns {Promise} Skills data including listening, reading, grammar, vocabulary scores và comparison data
     */
    async getSkillProgress() {
        const response = await axiosClient.get(`${this.baseUrl}/skills`);
        return response;
    }

    /**
     * Lấy tiến độ theo thời gian (dữ liệu cho line chart)
     * Backend: GET /learning-progress/time-progress
     * @returns {Promise} Time progress data including progressByMonth, studyTimeData
     */
    async getTimeProgress() {
        const response = await axiosClient.get(`${this.baseUrl}/time-progress`);
        return response;
    }

    /**
     * Lấy điểm mạnh và điểm yếu
     * Backend: GET /learning-progress/strengths-weaknesses
     * @returns {Promise} Strengths and weaknesses data including skillsRadar
     */
    async getStrengthsWeaknesses() {
        const response = await axiosClient.get(`${this.baseUrl}/strengths-weaknesses`);
        return response;
    }

    // Progress recording routes - khớp với backend routes

    /**
     * Ghi nhận kết quả làm bài từ vựng
     * Backend: POST /learning-progress/vocabulary-answer
     * @param {Object} data - Vocabulary answer data {vocabularyQuestionId, selectedOption, isCorrect, timeSpent, topicId}
     * @returns {Promise} Response from server
     */
    async recordVocabularyAnswer(data) {
        const response = await axiosClient.post(`${this.baseUrl}/vocabulary-answer`, data);
        return response;
    }

    /**
     * Ghi nhận kết quả làm bài ngữ pháp
     * Backend: POST /learning-progress/grammar-answer
     * @param {Object} data - Grammar answer data {grammarQuestionId, selectedOption, isCorrect, timeSpent, grammarId}
     * @returns {Promise} Response from server
     */
    async recordGrammarAnswer(data) {
        const response = await axiosClient.post(`${this.baseUrl}/grammar-answer`, data);
        return response;
    }

    // Alias methods for backward compatibility
    async getSkills() {
        return this.getSkillProgress();
    }

    // Các method phụ trợ - đã được cập nhật để xử lý response format mới
    async getTotalStudyTime() {
        try {
            // Lấy từ overview endpoint
            const overviewResponse = await this.getOverview();
            return { 
                data: { 
                    totalHours: overviewResponse.data?.studyHours || 0, 
                    thisWeek: overviewResponse.data?.studyTimeThisWeek || 0, 
                    lastWeek: 0 
                } 
            };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: { totalHours: 0, thisWeek: 0, lastWeek: 0 } };
        }
    }

    async getSkillPerformance() {
        try {
            // Lấy từ skills endpoint
            const skillsResponse = await this.getSkillProgress();
            return { 
                data: { 
                    listening: skillsResponse.data?.listening || 0, 
                    reading: skillsResponse.data?.reading || 0, 
                    grammar: skillsResponse.data?.grammar || 0, 
                    vocabulary: skillsResponse.data?.vocabulary || 0 
                } 
            };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: { listening: 0, reading: 0, grammar: 0, vocabulary: 0 } };
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            // Lấy từ dashboard
            const dashboardResponse = await this.getDashboard();
            return { data: dashboardResponse.data?.recentActivity || [] };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: [] };
        }
    }

    async getGoalProgress() {
        try {
            // Lấy từ dashboard hoặc tính toán từ overview
            const dashboardResponse = await this.getDashboard();
            const overviewData = dashboardResponse.data?.overview || {};
            
            // Tính toán goal progress nếu không có sẵn
            const currentScore = overviewData.averageScore || 0;
            const targetScore = 850; // Default target
            const progressPercentage = Math.min(Math.round((currentScore / targetScore) * 100), 100);
            
            return { 
                data: { 
                    currentScore,
                    targetScore,
                    progressPercentage,
                    isAchieved: currentScore >= targetScore,
                    highestScore: currentScore
                } 
            };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: { currentScore: 0, targetScore: 850, progressPercentage: 0, isAchieved: false, highestScore: 0 } };
        }
    }

    async getExamHistory(limit = 10) {
        try {
            // Lấy từ dashboard
            const dashboardResponse = await this.getDashboard();
            return { data: dashboardResponse.data?.examHistory || [] };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: [] };
        }
    }

    async getStudyStreak() {
        try {
            // Lấy từ dashboard
            const dashboardResponse = await this.getDashboard();
            return { 
                data: { 
                    currentStreak: dashboardResponse.data?.currentStreak || 0, 
                    longestStreak: dashboardResponse.data?.longestStreak || 0 
                } 
            };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: { currentStreak: 0, longestStreak: 0 } };
        }
    }

    async getCompletedLessonsCount() {
        try {
            // Lấy từ overview
            const overviewResponse = await this.getOverview();
            return { data: { count: overviewResponse.data?.completedLessons || 0 } };
        } catch (error) {
            // Fallback nếu endpoint chưa có
            return { data: { count: 0 } };
        }
    }
}

const learningProgressService = new LearningProgressService();
export default learningProgressService;

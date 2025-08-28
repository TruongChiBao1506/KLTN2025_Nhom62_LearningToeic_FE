import axiosClient from "./axiosClient";

class AILearningPathService {
    constructor() {
        // Thử các endpoint có thể có
        this.baseUrl = "/learning-paths";
    }

    // Generate new learning path with AI
    async generateLearningPath(pathData) {
        try {
            // Map frontend fields to backend expected fields according to API requirements
            const requestData = {
                // Bắt buộc
                userId: pathData.userId,
                targetScore: pathData.targetScore,
                availableTimePerDay: pathData.studyTimePerDay || pathData.availableTimePerDay,
                
                // Tùy chọn - currentLevel object structure
                currentLevel: pathData.currentLevel ? {
                    listening: pathData.listeningScore || 0,
                    reading: pathData.readingScore || 0,
                    overall: (pathData.listeningScore || 0) + (pathData.readingScore || 0)
                } : undefined,
                
                // Map duration -> preferredDuration
                preferredDuration: pathData.duration || pathData.preferredDuration,
                
                // Tùy chọn - focus areas mapping
                focusAreas: pathData.weakSkills || pathData.focusAreas || [],
                
                // Learning style mapping
                learningStyle: pathData.learningStyle || "mixed",
                
                // Previous experience mapping from currentLevel
                previousExperience: this.mapLevelToExperience(pathData.currentLevel),
                
                // Additional optional fields
                title: pathData.title,
                startDate: pathData.startDate,
                preferences: pathData.preferences || {}
            };
            
            // Remove undefined fields to avoid backend issues
            Object.keys(requestData).forEach(key => {
                if (requestData[key] === undefined) {
                    delete requestData[key];
                }
            });
            
            console.log('Sending generate request to:', `${this.baseUrl}/generate`);
            console.log('With mapped data:', requestData);
            const response = await axiosClient.post(`${this.baseUrl}/generate`, requestData);
            console.log('Response:', response.data);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error generating learning path:", error.response?.data || error);
            console.error("Error status:", error.response?.status);
            console.error("Error URL:", error.config?.url);
            throw error;
        }
    }

    // Generate quick learning path
    async generateQuickLearningPath(quickData = {}) {
        try {
            const requestData = {
                // Bắt buộc
                userId: quickData.userId,
                targetScore: quickData.targetScore || 650,
                availableTimePerDay: quickData.studyTimePerDay || quickData.availableTimePerDay || 60,
                
                // Map duration -> preferredDuration (quan trọng!)
                preferredDuration: quickData.duration || 4,
                
                // Tùy chọn
                focusAreas: quickData.weakSkills || quickData.focusAreas || [],
                learningStyle: quickData.learningStyle || "mixed",
                previousExperience: quickData.previousExperience || "intermediate",
                
                // Title và ngày bắt đầu cho quick path
                title: quickData.title || 'Lộ trình nhanh 4 tuần',
                startDate: quickData.startDate
            };
            
            // Remove undefined fields
            Object.keys(requestData).forEach(key => {
                if (requestData[key] === undefined) {
                    delete requestData[key];
                }
            });
            
            console.log('Sending quick path request to:', `${this.baseUrl}/generate`);
            console.log('With mapped data:', requestData);
            const response = await axiosClient.post(`${this.baseUrl}/generate`, requestData);
            console.log('Response:', response.data);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error generating quick learning path:", error.response?.data || error);
            console.error("Error status:", error.response?.status);
            console.error("Error URL:", error.config?.url);
            throw error;
        }
    }

    // Get all learning paths for a user
    async getUserLearningPaths(userId) {
        try {
            console.log('Fetching learning paths for user:', userId);
            const response = await axiosClient.get(`${this.baseUrl}/user/${userId}`);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error fetching user learning paths:", error.response?.data || error);
            throw error;
        }
    }

    // Get specific learning path
    async getLearningPath(pathId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${pathId}`);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error fetching learning path:", error.response?.data || error);
            throw error;
        }
    }

    // Update activity progress
    async updateActivityProgress(pathId, activityData) {
        console.log('Updating activity progress:', { pathId, activityData });
        try {
            console.log('Sending activity progress update:', {
                url: `${this.baseUrl}/${pathId}/activity`,
                pathId,
                activityData
            });
            
            const response = await axiosClient.patch(`${this.baseUrl}/${pathId}/activity`, activityData);
            console.log('Activity progress update response:', response.data);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error updating activity progress:", error.response?.data || error);
            console.error("Error status:", error.response?.status);
            console.error("Error URL:", error.config?.url);
            throw error;
        }
    }

    // Get current week activities
    async getCurrentWeekActivities(pathId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${pathId}/current-week`);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error fetching current week activities:", error.response?.data || error);
            return { success: true, data: { activities: [] } }; // Return empty array as fallback
        }
    }

    // Get learning path statistics
    async getDetailedStats(pathId) {
        try {
            const response = await axiosClient.get(`${this.baseUrl}/${pathId}/stats`);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error fetching detailed stats:", error.response?.data || error);
            return { success: true, data: {} }; // Return empty stats as fallback
        }
    }

    // AI Analysis and recommendations
    async analyzeProgress(pathId) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/${pathId}/analyze`);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error analyzing progress:", error.response?.data || error);
            throw error;
        }
    }

    // Get AI recommendations
    async getAIRecommendations(pathId, context = {}) {
        try {
            const response = await axiosClient.post(`${this.baseUrl}/${pathId}/analyze`, context);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error getting AI recommendations:", error.response?.data || error);
            throw error;
        }
    }

    // Update learning path settings
    async updateLearningPath(pathId, updateData) {
        try {
            const response = await axiosClient.patch(`${this.baseUrl}/${pathId}/settings`, updateData);
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error updating learning path:", error.response?.data || error);
            throw error;
        }
    }

    // Deactivate learning path
    async deleteLearningPath(pathId) {
        try {
            const response = await axiosClient.patch(`${this.baseUrl}/${pathId}/deactivate`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error deleting learning path:", error.response?.data || error);
            throw error;
        }
    }

    // Reset progress
    async resetProgress(pathId) {
        try {
            const response = await axiosClient.patch(`${this.baseUrl}/${pathId}/settings`, {
                resetProgress: true
            });
            return { success: true, data: response.data.data || response.data };
        } catch (error) {
            console.error("Error resetting progress:", error.response?.data || error);
            throw error;
        }
    }

    // Helper method to map currentLevel to previousExperience
    mapLevelToExperience(currentLevel) {
        if (!currentLevel) return "beginner";
        
        const levelMap = {
            'beginner': 'beginner',
            'intermediate': 'intermediate', 
            'upper-intermediate': 'advanced',
            'advanced': 'expert'
        };
        
        return levelMap[currentLevel] || 'intermediate';
    }
}

const aiLearningPathService = new AILearningPathService();
export default aiLearningPathService;

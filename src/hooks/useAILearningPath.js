import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import aiLearningPathService from '../services/aiLearningPathService';

const useAILearningPath = (userId) => {
    const [learningPaths, setLearningPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const [currentWeekActivities, setCurrentWeekActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all learning paths for user
    const fetchUserLearningPaths = useCallback(async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await aiLearningPathService.getUserLearningPaths(userId);
            setLearningPaths(response.data);
            
            // Only set current path if we don't have one yet, or merge with existing
            if (response.data.length > 0) {
                setCurrentPath(prev => {
                    if (!prev) {
                        // No current path, set to first active path or first path
                        return response.data.find(path => path.isActive) || response.data[0];
                    } else {
                        // We have a current path, try to find updated version from server
                        const updatedCurrentPath = response.data.find(path => path._id === prev._id);
                        if (updatedCurrentPath) {
                            // Merge server data with our local progress if local is more recent
                            const localProgress = prev.progress;
                            const serverProgress = updatedCurrentPath.progress;
                            
                            // Keep local progress if it has more completed activities
                            if (localProgress && serverProgress && 
                                localProgress.completedActivities > serverProgress.completedActivities) {
                                console.log('Keeping local progress as it has more completed activities');
                                return { ...updatedCurrentPath, progress: localProgress, weeklySchedule: prev.weeklySchedule };
                            }
                            return updatedCurrentPath;
                        } else {
                            // Current path not found in server data, keep existing
                            return prev;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching learning paths:', error);
            setError('Không thể tải danh sách lộ trình học tập');
            message.error('Không thể tải danh sách lộ trình học tập');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Create new learning path with AI
    const createLearningPath = useCallback(async (pathData) => {
        if (!userId) {
            message.error('Vui lòng đăng nhập để tạo lộ trình học tập');
            return;
        }

        // Validate required fields before sending
        if (!pathData.targetScore) {
            message.error('Vui lòng nhập điểm mục tiêu');
            return;
        }

        if (!pathData.currentLevel) {
            message.error('Vui lòng chọn trình độ hiện tại');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const requestData = {
                userId,
                targetScore: pathData.targetScore,
                currentLevel: pathData.currentLevel,
                duration: pathData.duration || 8,
                studyTimePerDay: pathData.studyTimePerDay || 60,
                ...pathData
            };
            
            console.log('Creating learning path with data:', requestData);
            console.log('Original duration:', pathData.duration, 'Mapped duration:', requestData.duration);
            const response = await aiLearningPathService.generateLearningPath(requestData);
            
            const newPath = response.data;
            setLearningPaths(prev => [newPath, ...prev]);
            setCurrentPath(newPath);
            
            message.success('🤖 AI đã tạo lộ trình học tập thành công!');
            return newPath;
        } catch (error) {
            console.error('Error creating learning path:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo lộ trình học tập';
            setError(errorMessage);
            message.error(`Không thể tạo lộ trình học tập: ${errorMessage}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Create quick learning path
    const createQuickPath = useCallback(async (quickData = {}) => {
        if (!userId) {
            message.error('Vui lòng đăng nhập để tạo lộ trình học tập');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const requestData = {
                userId,
                title: 'Lộ trình nhanh 4 tuần',
                targetScore: 650,
                currentLevel: 'intermediate',
                duration: 4, // Đảm bảo duration = 4 tuần
                studyTimePerDay: 60,
                weakSkills: [],
                learningStyle: 'mixed',
                ...quickData
            };
            
            console.log('Creating quick path with userId:', userId, 'and data:', requestData);
            const response = await aiLearningPathService.generateQuickLearningPath(requestData);
            
            const newPath = response.data;
            setLearningPaths(prev => [newPath, ...prev]);
            setCurrentPath(newPath);
            
            message.success('🚀 Lộ trình nhanh 4 tuần đã được tạo!');
            return newPath;
        } catch (error) {
            console.error('Error creating quick path:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo lộ trình nhanh';
            setError(errorMessage);
            message.error(`Không thể tạo lộ trình nhanh: ${errorMessage}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch current week activities
    const fetchCurrentWeekActivities = useCallback(async (pathId) => {
        if (!pathId) return;
        
        try {
            const response = await aiLearningPathService.getCurrentWeekActivities(pathId);
            setCurrentWeekActivities(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching current week activities:', error);
            setCurrentWeekActivities([]);
        }
    }, []);

    // Update activity progress
    const updateActivityProgress = useCallback(async (pathId, activityData) => {
        try {
            console.log('Updating activity progress:', { pathId, activityData });
            const response = await aiLearningPathService.updateActivityProgress(pathId, activityData);
            console.log('Activity progress update response:', response);
            
            // Only update from backend response if we get valid data
            if (response.success && response.data) {
                console.log('Updating local state with backend response:', response.data);
                
                // Update current path if it matches
                setCurrentPath(prev => {
                    if (prev && prev._id === pathId) {
                        return { ...prev, ...response.data };
                    }
                    return prev;
                });

                // Update in the learning paths list as well
                setLearningPaths(prev => 
                    prev.map(path => 
                        path._id === pathId 
                            ? { ...path, ...response.data }
                            : path
                    )
                );
            }

            message.success('✅ Tiến độ đã được cập nhật!');
            return response.data;
        } catch (error) {
            console.error('Error updating activity progress:', error);
            console.error('Error details:', error.response?.data || error.message);
            message.error('Không thể cập nhật tiến độ');
            throw error;
        }
    }, []);

    // Fetch detailed stats
    const fetchDetailedStats = useCallback(async (pathId) => {
        if (!pathId) return;
        
        try {
            const response = await aiLearningPathService.getDetailedStats(pathId);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching detailed stats:', error);
            setStats(null);
        }
    }, []);

    // Analyze progress with AI
    const analyzeProgress = useCallback(async (pathId) => {
        if (!pathId) return;
        
        setLoading(true);
        try {
            const response = await aiLearningPathService.analyzeProgress(pathId);
            
            message.success('🧠 AI đã phân tích tiến độ của bạn!');
            return response.data;
        } catch (error) {
            console.error('Error analyzing progress:', error);
            message.error('Không thể phân tích tiến độ');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get AI recommendations
    const getAIRecommendations = useCallback(async (pathId, context = {}) => {
        try {
            const response = await aiLearningPathService.getAIRecommendations(pathId, context);
            return response.data;
        } catch (error) {
            console.error('Error getting AI recommendations:', error);
            message.error('Không thể lấy gợi ý từ AI');
            throw error;
        }
    }, []);

    // Update learning path
    const updateLearningPath = useCallback(async (pathId, updateData) => {
        try {
            const response = await aiLearningPathService.updateLearningPath(pathId, updateData);
            
            // Update local state
            setLearningPaths(prev => 
                prev.map(path => 
                    path._id === pathId ? response.data : path
                )
            );

            if (currentPath && currentPath._id === pathId) {
                setCurrentPath(response.data);
            }
            
            message.success('Lộ trình đã được cập nhật!');
            return response.data;
        } catch (error) {
            console.error('Error updating learning path:', error);
            message.error('Không thể cập nhật lộ trình');
            throw error;
        }
    }, [currentPath]);

    // Delete learning path
    const deleteLearningPath = useCallback(async (pathId) => {
        try {
            await aiLearningPathService.deleteLearningPath(pathId);
            
            // Update local state
            setLearningPaths(prev => prev.filter(path => path._id !== pathId));
            
            if (currentPath && currentPath._id === pathId) {
                setCurrentPath(null);
            }
            
            message.success('Lộ trình đã được xóa!');
        } catch (error) {
            console.error('Error deleting learning path:', error);
            message.error('Không thể xóa lộ trình');
            throw error;
        }
    }, [currentPath]);

    // Reset progress
    const resetProgress = useCallback(async (pathId) => {
        try {
            const response = await aiLearningPathService.resetProgress(pathId);
            
            // Update local state
            if (currentPath && currentPath._id === pathId) {
                setCurrentPath(response.data);
            }
            
            fetchCurrentWeekActivities(pathId);
            fetchDetailedStats(pathId);
            
            message.success('Tiến độ đã được reset!');
            return response.data;
        } catch (error) {
            console.error('Error resetting progress:', error);
            message.error('Không thể reset tiến độ');
            throw error;
        }
    }, [currentPath, fetchCurrentWeekActivities, fetchDetailedStats]);

    // Calculate current path progress reactively
    const currentPathProgress = useMemo(() => {
        if (!currentPath || !currentPath.progress) {
            console.log('No progress data available:', { currentPath: !!currentPath, progress: currentPath?.progress });
            return 0;
        }
        
        const { completedActivities = 0, totalActivities = 1 } = currentPath.progress;
        const percentage = Math.round((completedActivities / totalActivities) * 100);
        
        console.log('Progress calculation:', { 
            completedActivities, 
            totalActivities, 
            percentage,
            pathId: currentPath._id,
            pathTitle: currentPath.title
        });
        
        return percentage;
    }, [currentPath]);

    // Auto-fetch data when userId changes
    useEffect(() => {
        if (userId) {
            fetchUserLearningPaths();
        }
    }, [userId, fetchUserLearningPaths]);

    // Setup currentPath from fetched data (only on initial load)
    useEffect(() => {
        if (learningPaths.length > 0 && !currentPath) {
            const activePath = learningPaths.find(path => path.isActive) || learningPaths[0];
            
            // Try to load saved progress from localStorage
            try {
                const progressKey = `learningPath_${activePath._id}_progress`;
                const savedProgressStr = localStorage.getItem(progressKey);
                
                if (savedProgressStr) {
                    const savedProgress = JSON.parse(savedProgressStr);
                    const savedTime = new Date(savedProgress.lastUpdated).getTime();
                    const now = new Date().getTime();
                    
                    // Use saved progress if it's less than 1 hour old
                    if (now - savedTime < 3600000) { // 1 hour
                        console.log('Loading saved progress from localStorage:', savedProgress);
                        activePath.progress = {
                            ...activePath.progress,
                            completedActivities: savedProgress.completedActivities,
                            totalActivities: savedProgress.totalActivities
                        };
                        activePath.weeklySchedule = savedProgress.weeklySchedule || activePath.weeklySchedule;
                    } else {
                        console.log('Saved progress is too old, ignoring');
                        localStorage.removeItem(progressKey);
                    }
                } else {
                    console.log('No saved progress found');
                }
            } catch (error) {
                console.warn('Failed to load saved progress:', error);
            }
            
            console.log('Setting initial current path:', activePath.title, activePath._id);
            setCurrentPath(activePath);
        }
    }, [learningPaths, currentPath]);

    // Debug currentPath changes
    useEffect(() => {
        if (currentPath) {
            console.log('Current path changed:', {
                id: currentPath._id,
                title: currentPath.title,
                progress: currentPath.progress,
                weeklyScheduleLength: currentPath.weeklySchedule?.length
            });
        }
    }, [currentPath]);

    // Return all state and methods
    return {
        // State
        learningPaths,
        currentPath,
        currentWeekActivities,
        stats,
        loading,
        error,

        // Methods
        fetchUserLearningPaths,
        createLearningPath,
        createQuickPath,
        updateActivityProgress,
        fetchCurrentWeekActivities,
        fetchDetailedStats,
        analyzeProgress,
        getAIRecommendations,
        updateLearningPath,
        deleteLearningPath,
        resetProgress,
        setCurrentPath,
        setLearningPaths,

        // Utilities
        hasLearningPaths: learningPaths.length > 0,
        isPathSelected: !!currentPath,
        currentPathProgress
    };
};

export default useAILearningPath;

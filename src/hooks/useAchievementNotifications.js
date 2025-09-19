import { useCallback } from 'react';
import achievementService from '../services/achievementService';

const useAchievementNotifications = () => {
  // Xử lý kết quả từ achievement service
  const handleAchievementResult = useCallback((result) => {
    console.log("🎯 handleAchievementResult called with:", result);

    if (result.success && result.unlockedAchievements && Array.isArray(result.unlockedAchievements) && result.unlockedAchievements.length > 0) {
      console.log("✅ Found unlocked achievements:", result.unlockedAchievements.length, result.unlockedAchievements);
      // Socket.io sẽ handle realtime notification display
    } else {
      console.log("❌ No unlocked achievements found. Result:", result);
      console.log("   - success:", result.success);
      console.log("   - unlockedAchievements:", result.unlockedAchievements);
      console.log("   - isArray:", Array.isArray(result.unlockedAchievements));
      console.log("   - length:", result.unlockedAchievements?.length);
    }
  }, []);

  // Wrapper functions cho các actions với notification
  const recordCompleteQuestion = useCallback(async (userId, count, skill = null) => {
    const result = await achievementService.recordCompleteQuestionWithNotification(userId, count, skill);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordCompleteTest = useCallback(async (userId, score, examType = null) => {
    const result = await achievementService.recordCompleteTestWithNotification(userId, score, examType);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordLearnVocab = useCallback(async (userId, count, vocabId = null) => {
    const result = await achievementService.recordLearnVocabWithNotification(userId, count, vocabId);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordSaveVocab = useCallback(async (userId, count, vocabId = null) => {
    const result = await achievementService.recordSaveVocabWithNotification(userId, count, vocabId);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordContributeContent = useCallback(async (userId, contentType, contentId = null) => {
    const result = await achievementService.recordContributeContentWithNotification(userId, contentType, contentId);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordLogin = useCallback(async (userId) => {
    const result = await achievementService.recordActivityWithNotification(userId, 'login', {});
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  const recordActivity = useCallback(async (userId, action, data) => {
    const result = await achievementService.recordActivityWithNotification(userId, action, data);
    handleAchievementResult(result);
    return result;
  }, [handleAchievementResult]);

  return {
    // Achievement actions
    recordCompleteQuestion,
    recordCompleteTest,
    recordLearnVocab,
    recordSaveVocab,
    recordContributeContent,
    recordLogin,
    recordActivity,
  };
};

export default useAchievementNotifications;
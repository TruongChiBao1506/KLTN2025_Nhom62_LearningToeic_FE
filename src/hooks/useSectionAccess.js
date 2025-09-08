import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import sectionService from '../services/sectionsService';

/**
 * Custom hook to check section access and handle disabled sections
 * @param {string} sectionId - The section ID to check
 * @param {Object} options - Options for handling disabled sections
 * @returns {Object} - { section, loading, error, isAccessible }
 */
const useSectionAccess = (sectionId, options = {}) => {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccessible, setIsAccessible] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  
  const navigate = useNavigate();
  
  const {
    redirectTo = '/learner/dashboard',
    redirectDelay = 3000,
    showToast = true,
    disabledMessage = 'Phần học này hiện không khả dụng. Bạn sẽ được chuyển về trang chủ.',
    onDisabled = null,
    pollInterval = 30000, // Check every 30 seconds
  } = options;

  // Function to check section access
  const checkSectionAccess = useCallback(async () => {
    try {
      const response = await sectionService.get(sectionId);
      const sectionData = response.data || response;
      
      setSection(sectionData);
      
      // Check if section is disabled
      if (sectionData.status === 0) {
        setIsAccessible(false);
        
        if (showToast) {
          toast.error(disabledMessage);
        }
        
        if (onDisabled) {
          onDisabled(sectionData);
        }
        
        if (redirectTo && redirectDelay > 0) {
          setTimeout(() => {
            navigate(redirectTo);
          }, redirectDelay);
        }
      } else {
        setIsAccessible(true);
      }
      
      setError(null);
      setLastCheck(new Date().toLocaleTimeString());
      
    } catch (error) {
      setError('Không thể kiểm tra quyền truy cập. Vui lòng thử lại sau.');
      setIsAccessible(false);
    } finally {
      setLoading(false);
    }
  }, [sectionId, navigate, redirectTo, redirectDelay, showToast, disabledMessage, onDisabled]);

  useEffect(() => {
    if (!sectionId) {
      setLoading(false);
      return;
    }

    // Initial check
    checkSectionAccess();
    
    // Set up polling to check status periodically
    const pollTimer = setInterval(checkSectionAccess, pollInterval);
    
    // Clean up
    return () => {
      clearInterval(pollTimer);
    };
    
  }, [sectionId, navigate, redirectTo, redirectDelay, showToast, disabledMessage, onDisabled, pollInterval, checkSectionAccess]);

  return {
    section,
    loading,
    error,
    isAccessible,
    lastCheck
  };
};

export default useSectionAccess;

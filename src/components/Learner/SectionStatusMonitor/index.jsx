import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Global component to handle real-time section status changes
 * This component can be added to LearnerLayout to show notifications
 * when sections are disabled/enabled
 */
const SectionStatusMonitor = () => {
  useEffect(() => {
    // Listen for custom events from other components
    const handleSectionDisabled = (event) => {
      const { sectionName } = event.detail;
      toast.warning(`Phần học "${sectionName}" đã bị tạm ngưng.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    const handleSectionEnabled = (event) => {
      const { sectionName } = event.detail;
      toast.success(`Phần học "${sectionName}" đã được kích hoạt trở lại.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    // Add event listeners
    window.addEventListener('sectionDisabled', handleSectionDisabled);
    window.addEventListener('sectionEnabled', handleSectionEnabled);

    // Cleanup
    return () => {
      window.removeEventListener('sectionDisabled', handleSectionDisabled);
      window.removeEventListener('sectionEnabled', handleSectionEnabled);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default SectionStatusMonitor;

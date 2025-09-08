import React from 'react';
import useSectionAccess from '../../../hooks/useSectionAccess';
import SectionAccessGuard from '../SectionAccessGuard';

/**
 * Higher-Order Component to wrap Part components with section access control
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {string} sectionId - The section ID to check access for
 * @returns {React.Component} - Wrapped component with access control
 */
const withSectionAccess = (WrappedComponent, sectionId) => {
  const WithSectionAccessComponent = (props) => {
    const { 
      section, 
      loading, 
      error, 
      isAccessible 
    } = useSectionAccess(sectionId, {
      redirectTo: '/learner/dashboard',
      redirectDelay: 3000,
      showToast: true,
      pollInterval: 30000, // Check every 30 seconds
    });

    return (
      <SectionAccessGuard
        section={section}
        loading={loading}
        error={error}
        isAccessible={isAccessible}
      >
        <WrappedComponent {...props} section={section} />
      </SectionAccessGuard>
    );
  };

  // Set display name for debugging
  WithSectionAccessComponent.displayName = `withSectionAccess(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithSectionAccessComponent;
};

export default withSectionAccess;

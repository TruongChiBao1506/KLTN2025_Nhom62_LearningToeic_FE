import React from 'react';
import CallProvider from './CallProvider';

const VideoCallModal = ({ isOpen, onClose, meetingId, meetingName }) => {
  console.log('VideoCallModal render:', { isOpen, meetingId, meetingName });
  
  if (!isOpen) return null;

  return (
    <div 
      className="modal d-block" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      <CallProvider 
        meetingId={meetingId}
        meetingName={meetingName}
        onClose={onClose}
      />
    </div>
  );
};

export default VideoCallModal;

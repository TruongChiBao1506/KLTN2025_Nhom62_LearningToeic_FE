import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, Divider } from 'antd';
import { BugOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import socketService from '../services/socketService';

const { Title, Text } = Typography;

/**
 * Debug Component để giám sát notification listeners
 * Chỉ dùng trong development để troubleshoot duplicate notifications
 * 
 * Usage: Import và add vào layout:
 * import DebugNotifications from '../components/DebugNotifications';
 * <DebugNotifications />
 */
const DebugNotifications = () => {
  const [listenerCounts, setListenerCounts] = useState({});
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Update listener counts every 2 seconds
    const interval = setInterval(() => {
      const counts = socketService.getListenerCounts();
      setListenerCounts(counts);
      setUpdateCount(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    const counts = socketService.getListenerCounts();
    setListenerCounts(counts);
    setUpdateCount(prev => prev + 1);
  };

  const handleClearAll = () => {
    // Remove all notification listeners
    socketService.offAll('notification');
    handleRefresh();
  };

  // Get total listener count
  const totalListeners = Object.values(listenerCounts).reduce((sum, count) => sum + count, 0);

  // Determine status color
  const getStatusColor = (count) => {
    if (count === 0) return 'default';
    if (count === 1) return 'success';
    if (count <= 3) return 'warning';
    return 'error';
  };

  return (
    <Card
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 350,
        maxHeight: '60vh',
        overflow: 'auto',
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}
      title={
        <Space>
          <BugOutlined style={{ color: 'var(--color-chart-4)' }} />
          <Text strong>Debug: Notification Listeners</Text>
        </Space>
      }
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
          >
            Clear
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Summary */}
        <div>
          <Text strong>Total Listeners: </Text>
          <Tag color={getStatusColor(totalListeners)}>
            {totalListeners}
          </Tag>
        </div>

        <div>
          <Text strong>Socket Connected: </Text>
          <Tag color={socketService.isConnected ? 'success' : 'error'}>
            {socketService.isConnected ? 'Yes' : 'No'}
          </Tag>
        </div>

        <div>
          <Text strong>Updates: </Text>
          <Text type="secondary">{updateCount}</Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Event Listeners */}
        <div>
          <Title level={5} style={{ margin: '0 0 8px 0' }}>
            Event Listeners:
          </Title>
          
          {Object.keys(listenerCounts).length === 0 ? (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              No listeners registered
            </Text>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(listenerCounts).map(([event, count]) => (
                <div 
                  key={event}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 8px',
                    background: count > 1 ? '#fff1f0' : 'var(--color-success-bg)',
                    borderRadius: '4px',
                    border: `1px solid ${count > 1 ? '#ffccc7' : '#d9f7be'}`,
                  }}
                >
                  <Text 
                    style={{ 
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  >
                    {event}
                  </Text>
                  <Tag 
                    color={getStatusColor(count)}
                    style={{ margin: 0 }}
                  >
                    {count}
                  </Tag>
                </div>
              ))}
            </Space>
          )}
        </div>

        {/* Warnings */}
        {totalListeners > 5 && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <div 
              style={{
                padding: '8px',
                background: 'var(--color-warning-bg)',
                border: '1px solid #ffd591',
                borderRadius: '4px',
              }}
            >
              <Text strong style={{ color: 'var(--color-chart-6)', fontSize: '12px' }}>
                ⚠️ Warning: Too many listeners detected!
              </Text>
              <br />
              <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                This may cause duplicate notifications. Consider using useCallback and proper cleanup.
              </Text>
            </div>
          </>
        )}

        {/* Help Text */}
        <Divider style={{ margin: '12px 0' }} />
        <div>
          <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
            <strong>Expected:</strong> 1 listener per event
            <br />
            <strong>Issue:</strong> Multiple listeners = duplicate notifications
            <br />
            <strong>Fix:</strong> Use useCallback + proper cleanup in useEffect
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default DebugNotifications;

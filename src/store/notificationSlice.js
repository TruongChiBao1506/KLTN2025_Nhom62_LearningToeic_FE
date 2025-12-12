import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService.js';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId) => {
    const result = await notificationService.getUserNotifications(userId);
    return result.data || [];
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id) => {
    await notificationService.markAsRead(id);
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId) => {
    await notificationService.markAllAsRead(userId);
    return userId;
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/removeNotification',
  async (id) => {
    await notificationService.deleteNotification(id);
    return id;
  }
);

export const removeAllNotifications = createAsyncThunk(
  'notifications/removeAllNotifications',
  async (userId) => {
    // Implement API for delete all notifications if available
    // await notificationService.deleteAllNotifications(userId);
    return userId;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    // Counters cho từng loại notification
    counts: {
      achievement: 0,
      teacherRequest: 0,
      contentApproval: 0,
      roleChange: 0,
      system: 0,
      reminder: 0,
    }
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      
      // Cập nhật counter theo loại notification
      const type = action.payload.data?.originalType || action.payload.type;
      switch(type) {
        case 'achievement':
        case 'new_achievement':
          state.counts.achievement += 1;
          break;
        case 'teacher_request':
        case 'teacher_approved':
        case 'teacher_rejected':
          state.counts.teacherRequest += 1;
          break;
        case 'content_pending':
        case 'content_approved':
        case 'content_rejected':
        case 'content_withdrawn':
          state.counts.contentApproval += 1;
          break;
        case 'role_promoted':
        case 'role_demoted':
          state.counts.roleChange += 1;
          break;
        case 'system':
        case 'system_notification':
          state.counts.system += 1;
          break;
        case 'reminder':
        case 'reminder_notification':
          state.counts.reminder += 1;
          break;
        default:
          break;
      }
    },
    clearNotificationCounts: (state) => {
      state.counts = {
        achievement: 0,
        teacherRequest: 0,
        contentApproval: 0,
        roleChange: 0,
        system: 0,
        reminder: 0,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        
        // Tính toán counts cho từng loại
        state.counts = action.payload.reduce((acc, notification) => {
          if (notification.isRead) return acc; // Chỉ đếm unread
          
          const type = notification.data?.originalType || notification.type;
          switch(type) {
            case 'achievement':
            case 'new_achievement':
              acc.achievement += 1;
              break;
            case 'teacher_request':
            case 'teacher_approved':
            case 'teacher_rejected':
              acc.teacherRequest += 1;
              break;
            case 'content_pending':
            case 'content_approved':
            case 'content_rejected':
            case 'content_withdrawn':
              acc.contentApproval += 1;
              break;
            case 'role_promoted':
            case 'role_demoted':
              acc.roleChange += 1;
              break;
            case 'system':
            case 'system_notification':
              acc.system += 1;
              break;
            case 'reminder':
            case 'reminder_notification':
              acc.reminder += 1;
              break;
            default:
              break;
          }
          return acc;
        }, {
          achievement: 0,
          teacherRequest: 0,
          contentApproval: 0,
          roleChange: 0,
          system: 0,
          reminder: 0,
        });
        
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n =>
          (n.id === action.payload || n._id === action.payload)
        );
        
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          
          // Giảm counter tương ứng
          const type = notification.data?.originalType || notification.type;
          switch(type) {
            case 'achievement':
            case 'new_achievement':
              state.counts.achievement = Math.max(0, state.counts.achievement - 1);
              break;
            case 'teacher_request':
            case 'teacher_approved':
            case 'teacher_rejected':
              state.counts.teacherRequest = Math.max(0, state.counts.teacherRequest - 1);
              break;
            case 'content_pending':
            case 'content_approved':
            case 'content_rejected':
            case 'content_withdrawn':
              state.counts.contentApproval = Math.max(0, state.counts.contentApproval - 1);
              break;
            case 'role_promoted':
            case 'role_demoted':
              state.counts.roleChange = Math.max(0, state.counts.roleChange - 1);
              break;
            case 'system':
            case 'system_notification':
              state.counts.system = Math.max(0, state.counts.system - 1);
              break;
            case 'reminder':
            case 'reminder_notification':
              state.counts.reminder = Math.max(0, state.counts.reminder - 1);
              break;
            default:
              break;
          }
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
        state.counts = {
          achievement: 0,
          teacherRequest: 0,
          contentApproval: 0,
          roleChange: 0,
          system: 0,
          reminder: 0,
        };
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload || n._id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload && n._id !== action.payload);
      })
      .addCase(removeAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotificationCounts } = notificationSlice.actions;
export default notificationSlice.reducer;

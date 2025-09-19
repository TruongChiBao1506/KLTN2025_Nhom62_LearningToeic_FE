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
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(n =>
          (n.id === action.payload || n._id === action.payload)
            ? { ...n, isRead: true }
            : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
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

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

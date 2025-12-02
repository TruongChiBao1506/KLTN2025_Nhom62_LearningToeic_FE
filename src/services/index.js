// Services index - tránh circular dependency issues
export { default as notificationService } from './notificationService';
export { default as socketService } from './socketService';
export { default as axiosClient } from './axiosClient';
export { default as adminDashboardService } from './adminDashboardService';
export { default as teacherDashboardService } from './teacherDashboardService';
# Notification System - Frontend

## 📋 Tổng quan

Hệ thống notification real-time sử dụng Socket.io để nhận và hiển thị thông báo từ backend.

## 🔔 Các loại Notification

### 1. Teacher Request Notifications (Admin)
- **`teacher_request`**: Yêu cầu trở thành teacher mới
  - Icon: 📝
  - Color: Blue (#1890ff)
  - Action: Button "Xem yêu cầu" → Navigate to `/admin/teacher-requests`

- **`teacher_approved`**: Yêu cầu được chấp thuận (Teacher)
  - Icon: 🎉
  - Color: Green (#52c41a)
  - Message type: Success

- **`teacher_rejected`**: Yêu cầu bị từ chối (Teacher)
  - Icon: ❌
  - Color: Red (#ff4d4f)
  - Message type: Error
  - Extra: Hiển thị lý do từ chối

### 2. Content Approval Notifications

- **`content_pending`**: Nội dung mới cần duyệt (Admin)
  - Icon: ⏳
  - Color: Orange (#faad14)
  - Action: Button "Xem nội dung" → Navigate based on content type

- **`content_approved`**: Nội dung được phê duyệt (Teacher)
  - Icon: ✅
  - Color: Green (#52c41a)
  - Message type: Success
  - Extra: Hiển thị thông tin nội dung đã duyệt

- **`content_rejected`**: Nội dung bị từ chối (Teacher)
  - Icon: ❌
  - Color: Red (#ff4d4f)
  - Message type: Error
  - Extra: Hiển thị lý do từ chối

### 3. User Role Notifications

- **`role_promoted`**: User được thăng cấp
  - Icon: 🎊
  - Color: Purple (#722ed1)
  - Message type: Success
  - Extra: Hiển thị role mới

- **`role_demoted`**: User bị hạ cấp
  - Icon: ⚠️
  - Color: Orange-red (#fa8c16)
  - Message type: Error
  - Extra: Hiển thị lý do (nếu có)

### 4. System Notifications

- **`achievement`**: Thành tích mới
  - Icon: 🏆
  - Color: Cyan (#13c2c2)

- **`system`**: Thông báo hệ thống
  - Icon: 🔔
  - Color: Gray (#8c8c8c)

- **`reminder`**: Nhắc nhở
  - Icon: ⏰
  - Color: Magenta (#eb2f96)

## 🔌 Socket Events

### Backend emits:
```javascript
socket.emit('notification', {
  id: notificationId,
  type: 'system', // achievement/system/reminder
  title: 'Notification title',
  message: 'Notification message',
  data: {
    originalType: 'teacher_request', // Custom type
    relatedId: 'xxx',
    relatedModel: 'TeacherRequest'
  },
  createdAt: Date,
  isRead: false
});
```

### Frontend listens:
```javascript
// Generic event
socketService.on('new_notification', (data) => {
  // Add to notification list
  // Show toast message
});

// Specific events for custom handling
socketService.on('teacher_request_approved', (data) => {...});
socketService.on('content_approved', (data) => {...});
socketService.on('role_promoted', (data) => {...});
```

## 📦 Components

### NotificationDropdown
Main component - hiển thị dropdown với danh sách notifications
- Badge với unread count
- Dropdown menu với scroll
- Mark as read / Delete actions
- Real-time updates via Socket.io

### NotificationTypes
Helper components để render extra content cho từng loại notification
- Action buttons
- Extra information boxes
- Custom styling per type

## 🎨 UI Features

### Toast Messages
- **Success** (Green): approved, promoted
- **Error** (Red): rejected, demoted
- **Warning** (Orange): pending, request
- **Info** (Blue): general notifications

### Visual Indicators
- **Border left color**: Phân biệt loại notification
- **Background color**: Unread notifications có background xanh nhạt
- **Icon**: Emoji icon theo loại notification
- **Badge count**: Số lượng unread trên bell icon

### Interactions
- **Hover**: Background color change
- **Click notification**: Mark as read (optional)
- **Mark read button**: Đánh dấu đã đọc
- **Delete button**: Xóa notification
- **Mark all as read**: Đánh dấu tất cả đã đọc

## 🔧 API Endpoints

```javascript
// Get user notifications (paginated)
GET /api/notifications?page=1&limit=20

// Get unread count
GET /api/notifications/unread/count

// Mark as read
PUT /api/notifications/:id/read

// Mark all as read
PUT /api/notifications/read-all

// Delete notification
DELETE /api/notifications/:id
```

## 🚀 Usage Example

```jsx
import NotificationDropdown from './NotificationDropdown';

<NotificationDropdown userId={currentUser._id} />
```

## 📝 Notes

- Notification luôn được lưu trong DB trước khi emit qua Socket.io
- Nếu user offline, notification vẫn được lưu và hiển thị khi login lại
- Socket.io tự động reconnect khi mất kết nối
- Notification có timestamp và được sort theo thời gian mới nhất

# Backend Integration Examples

## Cách Backend gửi notifications

### 1. Teacher Request Notifications

```javascript
// controllers/teacherRequest.controller.js

// Khi user tạo teacher request
exports.createTeacherRequest = async (req, res) => {
  try {
    // ... create teacher request logic ...
    
    // Send notification to all admins
    await notificationService.notifyAdminNewTeacherRequest(
      req.user, // User object
      newRequest._id // Request ID
    );
    
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khi admin approve request
exports.approveRequest = async (req, res) => {
  try {
    // ... approve logic ...
    
    // Send notification to user
    await notificationService.notifyTeacherRequestApproved(
      request.userId, // User ID
      request._id // Request ID
    );
    
    res.status(200).json({ success: true, message: 'Approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khi admin reject request
exports.rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    // ... reject logic ...
    
    // Send notification to user
    await notificationService.notifyTeacherRequestRejected(
      request.userId, // User ID
      request._id, // Request ID
      rejectionReason // Rejection reason
    );
    
    res.status(200).json({ success: true, message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### 2. Content Approval Notifications

```javascript
// controllers/lesson.controller.js (or test/exam controller)

// Khi teacher tạo nội dung mới
exports.createLesson = async (req, res) => {
  try {
    // ... create lesson logic ...
    
    // Send notification to admins
    await notificationService.notifyAdminNewPendingContent(
      'Bài học', // Content type
      newLesson._id, // Content ID
      newLesson.title, // Content title
      req.user.name // Teacher name
    );
    
    res.status(201).json({ success: true, data: newLesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khi admin approve content
exports.approveLesson = async (req, res) => {
  try {
    // ... approve logic ...
    
    // Send notification to teacher
    await notificationService.notifyContentApproved(
      lesson.teacherId, // Teacher ID
      'Bài học', // Content type
      lesson._id, // Content ID
      lesson.title // Content title
    );
    
    res.status(200).json({ success: true, message: 'Approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khi admin reject content
exports.rejectLesson = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    // ... reject logic ...
    
    // Send notification to teacher
    await notificationService.notifyContentRejected(
      lesson.teacherId, // Teacher ID
      'Bài học', // Content type
      lesson._id, // Content ID
      lesson.title, // Content title
      rejectionReason // Rejection reason
    );
    
    res.status(200).json({ success: true, message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### 3. User Role Notifications

```javascript
// controllers/user.controller.js

// Khi admin promote user lên teacher
exports.promoteToTeacher = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // ... promote logic ...
    
    // Send notification to user
    await notificationService.notifyUserPromoted(
      userId, // User ID
      'ROLE_TEACHER', // Role name
      req.user.name // Promoted by (admin name)
    );
    
    res.status(200).json({ success: true, message: 'Promoted to teacher' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Khi admin demote teacher về learner
exports.demoteToLearner = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body; // Optional
    
    // ... demote logic ...
    
    // Send notification to user
    await notificationService.notifyUserDemoted(
      userId, // User ID
      'ROLE_TEACHER', // Role that was removed
      req.user.name, // Demoted by (admin name)
      reason // Optional reason
    );
    
    res.status(200).json({ success: true, message: 'Demoted to learner' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Socket.io Flow

```
Backend                          Socket Manager                     Frontend
   |                                    |                                |
   |  1. Save notification to DB        |                                |
   |-------------------------------->   |                                |
   |                                    |                                |
   |  2. Emit 'notification' event      |                                |
   |-------------------------------->   |                                |
   |                                    |                                |
   |                          3. Check user online                       |
   |                                    |                                |
   |                          4. Emit to specific user's socket          |
   |                                    |------------------------------>|
   |                                    |                                |
   |                                    |         5. Receive & process   |
   |                                    |                                |
   |                                    |         6. Show toast message  |
   |                                    |                                |
   |                                    |         7. Add to dropdown     |
   |                                    |                                |
   |                                    |         8. Update badge count  |
   |                                    |                                |
```

## Testing Notifications

### Manual Testing (Postman/Thunder Client)

```javascript
// 1. Login as admin
POST /api/auth/signin
Body: { email: "admin@test.com", password: "password" }
→ Save token

// 2. Promote a user to teacher
PATCH /api/users/teachers/:userId/promote
Headers: { Authorization: "Bearer <token>" }
→ User should receive notification

// 3. Create a test notification directly (for testing)
POST /api/notifications/test
Headers: { Authorization: "Bearer <token>" }
Body: {
  "userId": "user_id_here",
  "type": "teacher_approved",
  "title": "Test Notification",
  "message": "This is a test"
}
```

### Backend Console Logs

Notification service logs ra các thông tin:
```
=== CREATE NOTIFICATION ===
userId: 507f1f77bcf86cd799439011
notifData: {...}
✅ Notification created: 507f191e810c19729de860ea
📤 Attempting to emit notification to user 507f1f77bcf86cd799439011...
✅ Real-time notification sent via Socket.IO
```

### Frontend Console Logs

```
🔌 Connected to Socket.io server
👤 Registered user: 507f1f77bcf86cd799439011
🔔 New notification received: {...}
📢 Emitting to 1 listener(s) for event: new_notification
```

## Common Issues & Solutions

### Issue: Notification saved but not received in real-time
**Solution**: 
- Check if socket is connected: `socketService.isConnected`
- Check if user is registered: Look for '👤 Registered user' log
- Verify user is online when notification is sent

### Issue: Toast message not showing
**Solution**:
- Check if `handleNewNotification` is being called
- Verify `message` component is imported from Ant Design
- Check browser console for errors

### Issue: Badge count not updating
**Solution**:
- Verify `fetchUnreadCount()` is being called
- Check API response structure
- Ensure state is being updated correctly

### Issue: Notification not persisting after page refresh
**Solution**:
- Check if notification is saved to DB (should be saved before emit)
- Verify `fetchNotifications()` is called on component mount
- Check API endpoint `/api/notifications`

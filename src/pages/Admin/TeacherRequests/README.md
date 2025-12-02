# Teacher Requests Management - Admin Panel

## 📋 Overview
Trang quản lý yêu cầu trở thành Teacher cho Admin với giao diện được cải thiện hoàn toàn, đồng nhất với các trang khác trong hệ thống.

## 🎨 UI/UX Updates (Đồng nhất với Section page)

### ✨ Animations với AOS (Animate On Scroll)
- **Fade-up animation** cho toàn bộ container (600ms delay)
- **Fade-down animation** cho breadcrumb header (400ms)
- **Fade-up animation** cho statistics cards (500ms)
- **Fade-up animation** cho main content card (500ms)
- **Zoom-in animation** cho loading spinner

### 🎯 Breadcrumb Header
- Gradient background: `linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)`
- Icon home với gradient circle background
- Consistent với trang Section
- Border-radius: 16px
- Soft shadow effect

### 📊 Statistics Cards
- Soft box-shadow: `0 2px 8px rgba(80,120,255,0.10)`
- Smooth hover effects với transform translateY
- Consistent border-radius: 12px
- Gradient backgrounds cho mỗi card

## ✨ Features

### 1. **Statistics Dashboard**
- 4 thẻ thống kê với gradient màu đẹp:
  - 📊 Total Requests (Tổng số yêu cầu)
  - ⏳ Pending Requests (Yêu cầu đang chờ)
  - ✅ Approved Requests (Đã duyệt)
  - ❌ Rejected Requests (Đã từ chối)

### 2. **Advanced Filtering**
- Filter theo status:
  - 📋 All Status (Tất cả)
  - ⏳ Pending (Đang chờ)
  - ✅ Approved (Đã duyệt)
  - ❌ Rejected (Đã từ chối)
- Refresh button để tải lại dữ liệu

### 3. **Comprehensive Table View**
- **Columns:**
  - # (STT)
  - Applicant (Thông tin người dùng với avatar)
  - Full Name (Tên đầy đủ)
  - Contact (Email & Phone)
  - Experience (Kinh nghiệm)
  - Documents (Số lượng tài liệu)
  - Status (Trạng thái)
  - Submitted Date (Ngày gửi)
  - Actions (Các hành động)

- **Features:**
  - Pagination từ backend với tùy chọn 10, 20, 50, 100 items/page
  - Sortable columns
  - Responsive design với scroll horizontal
  - Quick jumper

### 4. **Detailed View Modal**
Hiển thị đầy đủ thông tin:
- **User Information**
  - Username
  - Email

- **Application Information**
  - Full Name
  - Phone Number
  - Experience (với scroll)
  - Reason for Applying (với scroll)

- **Documents**
  - CV download link
  - Certificates download links (multiple)

- **Status Information**
  - Current status
  - Rejection reason (if rejected)
  - Submitted date
  - Last updated date

### 5. **Approve/Reject Actions**

#### Approve
- Confirmation modal với thông tin đầy đủ
- Hiển thị applicant details
- Warning về quyền teacher sẽ được cấp

#### Reject
- Form nhập lý do từ chối
- Validation: 10-500 characters
- Character counter
- Warning về tác động của việc từ chối
- Preview thông tin applicant

### 6. **Real-time Updates**
- Socket.io integration
- Tự động cập nhật khi có request mới
- Notification khi có teacher request mới

### 7. **API Integration**

Tương thích với tất cả endpoints của backend:

**User Endpoints:**
- `POST /api/teacher-requests` - Submit request
- `GET /api/teacher-requests/my-request` - Get my request
- `DELETE /api/teacher-requests/cancel` - Cancel request

**Admin Endpoints:**
- `GET /api/teacher-requests/all` - Get all with pagination & filter
- `GET /api/teacher-requests/pending` - Get pending requests
- `GET /api/teacher-requests/pending/count` - Get pending count
- `GET /api/teacher-requests/statistics` - Get statistics
- `PATCH /api/teacher-requests/:id/approve` - Approve request
- `PATCH /api/teacher-requests/:id/reject` - Reject request

## 🎨 UI/UX Improvements

1. **Modern Design**
   - Gradient colors cho statistics cards
   - Smooth transitions
   - Hover effects
   - Professional color scheme

2. **Better Organization**
   - Grouped information in cards
   - Clear visual hierarchy
   - Consistent spacing
   - Icon usage for better recognition

3. **Enhanced Readability**
   - Color-coded status tags
   - Tooltips for truncated text
   - Badge counters
   - Clear typography

4. **Responsive Layout**
   - Works on all screen sizes
   - Horizontal scroll for table on small screens
   - Adaptive grid layout for statistics

## 🔧 Technical Details

### State Management
```javascript
- requests: Array of teacher requests
- currentPage: Current page number
- pageSize: Items per page
- totalRequests: Total count from backend
- statusFilter: Filter by status (null, 0, 1, 2)
- pendingCount: Count of pending requests
- statistics: Object with total, pending, approved, rejected
```

### Key Functions
- `fetchRequests(page, limit, status)` - Fetch requests with pagination
- `fetchPendingCount()` - Get pending count
- `fetchStatistics()` - Get statistics
- `handleApprove(request)` - Approve request
- `handleReject(request)` - Reject request
- `handleTableChange(pagination)` - Handle table pagination change
- `handleStatusFilterChange(value)` - Handle filter change

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages
- Loading states
- Empty states

## 📱 Usage

### For Admin Users:
1. **View All Requests**: See all teacher requests with pagination
2. **Filter**: Use status filter to see specific types
3. **View Details**: Click "View" to see full details
4. **Approve**: Click "Approve" for pending requests
5. **Reject**: Click "Reject" and provide reason

### Real-time Features:
- Automatic updates when new requests arrive
- Live statistics updates
- Socket connection for real-time notifications

## 🚀 Future Enhancements
- [ ] Export to CSV/Excel
- [ ] Bulk approve/reject
- [ ] Advanced search
- [ ] Request history timeline
- [ ] Email notification integration
- [ ] Comment system for requests
- [ ] Request analytics dashboard

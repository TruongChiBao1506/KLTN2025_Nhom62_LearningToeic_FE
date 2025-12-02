# Teacher Requests - Component Structure

## 📁 Cấu trúc mới (Đã refactor)

```
src/
├── pages/Admin/TeacherRequests/
│   ├── index.jsx              # Main page - logic & data fetching
│   ├── index_backup.jsx       # Backup của file cũ
│   └── style.css             # Page-level styles
│
└── components/Admin/TeacherRequestList/
    ├── index.jsx              # List component - UI & table
    ├── ViewRequestModal.jsx   # Modal xem chi tiết
    ├── RejectRequestModal.jsx # Modal reject với lý do
    └── style.css             # Component styles
```

## 🔄 So sánh Before & After

### ❌ Before (1 file lớn - 1190 lines)
```
TeacherRequests/index.jsx (1190 lines)
├── Import statements (40 lines)
├── State declarations (20 lines)
├── Fetch functions (100 lines)
├── Event handlers (80 lines)
├── Table columns definition (200 lines)
├── Modal components inline (300 lines)
├── Render logic (450 lines)
└── Duplicate code everywhere
```

**Problems:**
- ❌ File quá dài, khó maintain
- ❌ Logic & UI lẫn lộn
- ❌ Modal components inline
- ❌ Không reusable
- ❌ Khó test

### ✅ After (Tách thành 4 files)

#### 1. **pages/Admin/TeacherRequests/index.jsx** (330 lines)
**Trách nhiệm:** Data fetching & Business logic
```jsx
- State management
- API calls (fetchRequests, fetchStatistics)
- Socket.io setup
- Event handlers (approve, reject)
- Sidebar badge update
- Pass data to child components
```

#### 2. **components/Admin/TeacherRequestList/index.jsx** (440 lines)
**Trách nhiệm:** UI & Presentation
```jsx
- Statistics cards display
- Search & filter UI
- Table columns definition
- Table rendering with pagination
- Modal state management
- User interactions
```

#### 3. **components/Admin/TeacherRequestList/ViewRequestModal.jsx** (130 lines)
**Trách nhiệm:** View request details
```jsx
- Display full request information
- Applicant details with avatar
- Contact information
- Professional info (experience, documents)
- Request status & timestamps
```

#### 4. **components/Admin/TeacherRequestList/RejectRequestModal.jsx** (100 lines)
**Trách nhiệm:** Reject with reason
```jsx
- Rejection reason form
- Validation (10-500 chars)
- Character counter
- Submit handler
```

## 🎯 Lợi ích của việc refactor

### 1. ✅ Separation of Concerns
```
Page (index.jsx)           → Logic & Data
Component (List)           → UI & Presentation  
Modals                     → Specific features
```

### 2. ✅ Reusability
```jsx
// Có thể dùng TeacherRequestList ở nhiều nơi
import TeacherRequestList from '../../../components/Admin/TeacherRequestList';

<TeacherRequestList
  requests={requests}
  loading={loading}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

### 3. ✅ Maintainability
- Dễ tìm bug (biết ngay bug ở component nào)
- Dễ thêm features mới
- Dễ test riêng từng phần

### 4. ✅ Performance
- Code splitting tự động
- Lazy loading có thể áp dụng
- Re-render optimization dễ hơn

### 5. ✅ Team Collaboration
- Multiple developers có thể work trên các files khác nhau
- Ít conflict khi merge code
- Code review dễ hơn

## 📊 Component Flow

```
┌─────────────────────────────────────────┐
│  TeacherRequests Page (Main)            │
│  - Fetch data from API                  │
│  - Socket.io real-time updates          │
│  - Handle approve/reject                │
│  - Update sidebar badge                 │
└────────────┬────────────────────────────┘
             │ Props: requests, loading,
             │        statistics, handlers
             ▼
┌─────────────────────────────────────────┐
│  TeacherRequestList Component            │
│  - Display statistics cards              │
│  - Search & filter UI                    │
│  - Render table                          │
│  - Manage modal state                    │
└─────┬──────────────┬─────────────────────┘
      │              │
      ▼              ▼
┌─────────────┐  ┌──────────────────┐
│ ViewModal   │  │ RejectModal      │
│ - Details   │  │ - Reason form    │
│ - Avatar    │  │ - Validation     │
│ - Status    │  │ - Submit         │
└─────────────┘  └──────────────────┘
```

## 🔧 Props Interface

### TeacherRequestList Component Props

```typescript
interface TeacherRequestListProps {
  // Data
  requests: Array<Request>;           // List of teacher requests
  loading: boolean;                   // Loading state
  statistics: Statistics;             // Statistics object
  
  // Pagination
  currentPage: number;                // Current page number
  pageSize: number;                   // Items per page
  totalRequests: number;              // Total count
  
  // Filters
  statusFilter: number | null;        // 0=pending, 1=approved, 2=rejected, null=all
  
  // Handlers
  onApprove: (request) => void;       // Approve handler
  onReject: (request, reason) => void; // Reject handler
  onReload: () => void;               // Reload data
  onPageChange: (page) => void;       // Page change
  onPageSizeChange: (size) => void;   // Page size change
  onStatusFilterChange: (status) => void; // Filter change
}
```

## 🎨 Features Preserved

### ✅ All original features still working:
- ✅ Real-time updates via Socket.io
- ✅ Approve/Reject with confirmation
- ✅ Sidebar badge auto-update
- ✅ Statistics cards (Total, Pending, Approved, Rejected)
- ✅ Search by name/email/phone
- ✅ Filter by status
- ✅ Pagination with page size options
- ✅ View full request details
- ✅ Reject with reason validation
- ✅ AOS animations
- ✅ Responsive design

### 🆕 Additional improvements:
- ✅ Cleaner code organization
- ✅ Better error handling
- ✅ Improved validation messages
- ✅ Better UI/UX for modals
- ✅ More consistent styling

## 📝 Usage Example

### In Page Component:
```jsx
import TeacherRequestList from '../../../components/Admin/TeacherRequestList';

const TeacherRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleApprove = async (request) => {
    // API call
    // Update sidebar
    // Reload data
  };
  
  const handleReject = async (request, reason) => {
    // API call with reason
    // Update sidebar  
    // Reload data
  };
  
  return (
    <TeacherRequestList
      requests={requests}
      loading={loading}
      onApprove={handleApprove}
      onReject={handleReject}
      // ... other props
    />
  );
};
```

## 🧪 Testing Strategy

### Unit Tests:
```bash
# Test individual components
- ViewRequestModal.test.jsx
- RejectRequestModal.test.jsx
- TeacherRequestList.test.jsx
```

### Integration Tests:
```bash
# Test page with components
- TeacherRequests.test.jsx
```

## 🚀 Migration Notes

1. **Backup created:** `index_backup.jsx` chứa code cũ
2. **No breaking changes:** API calls vẫn giống y hệt
3. **Socket.io:** Vẫn hoạt động bình thường
4. **Sidebar update:** Custom events vẫn emit đúng

## 📚 Similar Patterns

Cấu trúc này tương tự các page khác:
- ✅ Grammar page (Grammar + GrammarList component)
- ✅ Topic page (Topic + TopicList component)
- ✅ Blog page (Blog + BlogList component)
- ✅ Exam page (Exam + ExamList component)

## 🎯 Next Steps

### Recommended improvements:
1. Add TypeScript interfaces
2. Add unit tests
3. Add Storybook stories
4. Add error boundaries
5. Add loading skeletons
6. Add empty states

### Future enhancements:
1. Export to Excel feature
2. Bulk approve/reject
3. Email notification preview
4. Request history timeline
5. Advanced filtering (date range, etc.)

---

**Status:** ✅ Refactoring Complete
**Date:** October 27, 2025
**Files Changed:** 5 files (1 page, 4 components)
**Lines Reduced:** From 1190 to ~1000 total (better organized)

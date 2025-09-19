# TOEIC Learning Platform - Trang Chủ

## 🎯 Tổng quan

Trang chủ hiện đại và responsive cho nền tảng học TOEIC, được thiết kế với UI/UX chuyên nghiệp và trải nghiệm người dùng tối ưu.

## ✨ Tính năng chính

### 🏠 **Trang chủ chính**
- **Hero Section**: Giới thiệu nền tảng với CTA hấp dẫn
- **Features Section**: 6 tính năng chính của nền tảng
- **Statistics**: Thống kê ấn tượng (50,000+ học viên, 95% đạt mục tiêu)
- **Testimonials**: Đánh giá từ học viên thực tế
- **CTA Section**: Kêu gọi hành động đăng ký

### 🎨 **Thiết kế hiện đại**
- **Responsive Design**: Hoạt động tốt trên mọi thiết bị
- **Modern UI**: Sử dụng Ant Design với gradient và animation
- **Dark Header**: Header trong suốt với backdrop blur
- **Floating Cards**: Animation cards trong hero section
- **Smooth Transitions**: Transition mượt mà cho mọi tương tác

### 🔐 **Authentication Integration**
- **Auto-detect User**: Tự động phát hiện user đã đăng nhập
- **Smart Redirects**: Chuyển hướng phù hợp theo role (Admin/Learner)
- **Dynamic CTA**: Nút CTA thay đổi theo trạng thái đăng nhập

### 📱 **Mobile-First**
- **Mobile Navigation**: Menu hamburger cho mobile
- **Touch-Friendly**: Tối ưu cho thao tác chạm
- **Responsive Grid**: Layout thích ứng với mọi kích thước màn hình

## 🚀 Cách sử dụng

### 1. **Truy cập trang chủ**
```
URL: /
```
Trang chủ sẽ hiển thị khi truy cập root path của ứng dụng.

### 2. **Đối với user chưa đăng nhập**
- Hiển thị nút "Đăng ký" và "Đăng nhập"
- CTA button: "Bắt đầu học ngay"
- Có thể xem demo và liên hệ

### 3. **Đối với user đã đăng nhập**
- Hiển thị avatar và tên user
- CTA button: "Tiếp tục học tập"
- Tự động redirect đến dashboard phù hợp khi click

## 🛠️ Cấu trúc file

```
src/pages/Home/
├── index.jsx          # Component chính
└── style.css          # Styling
```

## 🎨 Customization

### Thay đổi nội dung
```jsx
// Trong index.jsx
const features = [
  {
    icon: <BookOutlined />,
    title: 'Tên tính năng',
    description: 'Mô tả tính năng'
  }
];
```

### Thay đổi màu sắc
```css
/* Trong style.css */
:root {
  --primary-color: #1890ff;
  --secondary-color: #722ed1;
}
```

### Thêm section mới
```jsx
<section className="new-section">
  <div className="section-container">
    {/* Nội dung section mới */}
  </div>
</section>
```

## 📊 Statistics & Metrics

- **50,000+** học viên đã đăng ký
- **1,000+** bài học chất lượng
- **95%** học viên đạt mục tiêu đề ra
- **24/7** hỗ trợ kỹ thuật

## 🌟 Testimonials

Bao gồm đánh giá thực tế từ học viên với:
- Avatar ngẫu nhiên từ DiceBear API
- Rating 5 sao
- Nội dung đánh giá chi tiết
- Thông tin điểm TOEIC đạt được

## 🔗 Navigation & Routing

### Internal Links
- `/auth/signin` - Trang đăng nhập
- `/auth/signup` - Trang đăng ký
- `/learner/dashboard` - Dashboard học viên
- `/admin/dashboard` - Dashboard admin

### Anchor Links
- `#features` - Section tính năng
- `#about` - Section giới thiệu
- `#testimonials` - Section đánh giá
- `#contact` - Section liên hệ

## 📱 Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 576px - 768px
- **Mobile**: < 576px

## 🎭 Animations & Effects

- **Floating Cards**: Animation float cho cards trong hero
- **Hover Effects**: Transform và shadow cho cards
- **Gradient Backgrounds**: Linear gradient cho hero và CTA
- **Backdrop Blur**: Header trong suốt với blur effect

## 🔧 Dependencies

```json
{
  "react": "^18.3.1",
  "antd": "^5.26.3",
  "react-router-dom": "^7.6.2",
  "jwt-decode": "^4.0.0"
}
```

## 🚀 Performance

- **Lazy Loading**: Component được load khi cần
- **Optimized Images**: Sử dụng DiceBear API cho avatars
- **Minimal Bundle**: Chỉ load thư viện cần thiết
- **Fast Rendering**: Virtual DOM optimization

## 🎯 SEO & Accessibility

- **Meta Tags**: Title và description được set
- **Semantic HTML**: Sử dụng đúng cấu trúc HTML5
- **ARIA Labels**: Accessibility cho screen readers
- **Keyboard Navigation**: Hỗ trợ điều hướng bằng bàn phím

## 🔮 Future Enhancements

- [ ] **Multi-language Support**: Hỗ trợ đa ngôn ngữ
- [ ] **Dark Mode**: Chế độ tối
- [ ] **A/B Testing**: Test khác nhau cho conversion
- [ ] **Analytics**: Google Analytics integration
- [ ] **CMS Integration**: Quản lý nội dung động

---

**🎉 Trang chủ TOEIC Learning Platform đã sẵn sàng!**
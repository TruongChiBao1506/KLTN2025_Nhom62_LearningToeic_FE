import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  Input, 
  Button, 
  Select, 
  Space, 
  Avatar, 
  Typography,
  Divider,
  Empty,
  Spin
} from "antd";
import { 
  SendOutlined, 
  MessageOutlined, 
  FilterOutlined,
  UserOutlined
} from "@ant-design/icons";
import CommentComponent from "./CommentComponent";
import commentService from "../../../services/commentService";
import useAchievementNotifications from "../../../hooks/useAchievementNotifications";
import { toast } from "react-toastify";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const CommentsList = ({ examId }) => {
  const [filter, setFilter] = useState("all");
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); // Loading state cho submit
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const { recordContributeContent } = useAchievementNotifications();

  // Function để normalize comment data
  const normalizeComment = useCallback((comment) => {
    return {
      ...comment,
      user: comment.user || {
        name: comment.userName || "Người dùng",
        image: comment.userImage || null
      },
      replies: comment.replies ? comment.replies.map(reply => ({
        ...reply,
        user: reply.user || {
          name: reply.userName || "Người dùng",
          image: reply.userImage || null
        }
      })) : []
    };
  }, []);

  // Function để tính toán comments hiển thị dựa trên pagination
  const getPaginatedComments = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return comments.slice(startIndex, endIndex);
  }, [comments, currentPage, pageSize]);

  // Handler cho pagination change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
  };

  const retrieveComments = useCallback(async () => {
    try {
      let fetchedComments;
      if (filter === "user") {
        // ✅ Check sessionStorage for tokens
        const learnerToken = sessionStorage.getItem("learnerToken");
        if (learnerToken) {
          const decoded = jwtDecode(learnerToken);
          // Lấy comment của user cho exam này
          fetchedComments = await commentService.getUserComments(decoded.id);
          // Lọc theo examId
          fetchedComments = fetchedComments.filter(comment => comment.exam === examId);
        } else {
          toast.error("Vui lòng đăng nhập để xem bình luận của bạn");
          return;
        }
      } else {
        // Lấy tất cả comment cho exam này
        fetchedComments = await commentService.getCommentsByExamId(examId);
      }

      if (fetchedComments && fetchedComments.length > 0) {
        // Normalize comments để đảm bảo có user object
        const normalizedComments = fetchedComments.map(normalizeComment);
        setComments(normalizedComments);
        // Reset pagination khi load comments mới
        setCurrentPage(1);
        // Không cần set visibleComments nữa vì sẽ tính toán từ pagination
      } else {
        setComments([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      toast.error("Không thể tải bình luận, vui lòng thử lại sau");
    }
  }, [filter, examId, normalizeComment]);

  useEffect(() => {
    retrieveComments();
  }, [retrieveComments]);

  const addComment = async () => {
    if (!newCommentText.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      // ✅ Check sessionStorage for tokens
      const learnerToken = sessionStorage.getItem("learnerToken");
      if (!learnerToken) {
        toast.error("Vui lòng đăng nhập để bình luận");
        return;
      }

      const decoded = jwtDecode(learnerToken);
      const userId = decoded.id;

      const data = {
        text: newCommentText,
        userId: userId,
        examId: examId,
      };

      // Tạo optimistic comment (tạm thời hiển thị ngay)
      const optimisticComment = {
        commentId: `temp-${Date.now()}`, // ID tạm thời
        _id: `temp-${Date.now()}`, // ID tạm thời
        text: newCommentText,
        userId: userId,
        user: {
          name: decoded.name || "Bạn",
          image: decoded.image || null
        },
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        replies: [],
        isOptimistic: true, // Flag để biết là optimistic
        isSubmitting: true // Flag cho loading state
      };

      // Thêm vào UI ngay lập tức
      setComments(prev => [optimisticComment, ...prev]);
      // Không cần set visibleComments nữa vì sẽ tính toán từ pagination
      setNewCommentText(""); // Clear input ngay

      // Chạy API calls song song (parallel)
      const [createResult, recordResult] = await Promise.allSettled([
        commentService.createComment(data), // Tạo comment
        recordContributeContent(userId, 'comment', examId).catch(err => {
          console.warn("⚠️ Không thể ghi nhận achievement:", err);
          return null; // Không fail toàn bộ nếu achievement lỗi
        })
      ]);

      // Xử lý kết quả tạo comment
      if (createResult.status === 'fulfilled') {
        const response = createResult.value;
        console.log("✅ Comment created:", response);

        // Update optimistic comment với data thật (đã normalize)
        const normalizedResponse = normalizeComment(response);
        setComments(prev => prev.map(comment => 
          comment.commentId === optimisticComment.commentId 
            ? { ...normalizedResponse, isOptimistic: false, isSubmitting: false }
            : comment
        ));

        toast.success("Đã thêm bình luận");
      } else {
        // API thất bại: Remove optimistic comment
        console.error("❌ Failed to create comment:", createResult.reason);
        setComments(prev => prev.filter(comment => comment.commentId !== optimisticComment.commentId));
        toast.error("Lỗi khi bình luận, vui lòng thử lại sau");
      }

      // Log achievement result (không ảnh hưởng UX)
      if (recordResult.status === 'fulfilled' && recordResult.value) {
        console.log("🎉 Achievement recorded:", recordResult.value);
      }

    } catch (error) {
      console.error("Lỗi khi bình luận:", error);
      toast.error("Lỗi khi bình luận, vui lòng thử lại sau");
      
      // Revert optimistic update nếu có lỗi unexpected
      setComments(prev => prev.filter(comment => comment.commentId !== `temp-${Date.now()}`));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="modern-comments-container">
      {/* Header with Title and Filter */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <Title level={3} style={{ margin: 0, color: "var(--color-primary)" }}>
            <MessageOutlined style={{ marginRight: "8px" }} />
            Thảo luận ({comments.length})
          </Title>
          
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 200 }}
            placeholder="Lọc bình luận"
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Tất cả bình luận</Option>
            <Option value="user">Bình luận của bạn</Option>
          </Select>
        </div>
        
        <Divider style={{ margin: "16px 0" }} />
      </div>

      {/* Comment Input Form */}
      <div style={{ 
        background: "var(--color-bg-hover)", 
        padding: "20px", 
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #f0f0f0"
      }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Text strong style={{ color: "#595959" }}>
            Chia sẻ ý kiến của bạn về bài thi này
          </Text>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: "var(--color-primary)", 
                flexShrink: 0,
                marginTop: "4px"
              }} 
            />
            
            <div style={{ flex: 1 }}>
              <TextArea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Nhập bình luận của bạn..."
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{ 
                  borderRadius: "8px",
                  resize: "none"
                }}
              />
              
              <div style={{ 
                display: "flex", 
                justifyContent: "flex-end", 
                marginTop: "12px" 
              }}>
                <Button
                  type="primary"
                  icon={isSubmittingComment ? null : <SendOutlined />}
                  onClick={addComment}
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  loading={isSubmittingComment} // Hiển thị loading trên button
                  style={{ 
                    borderRadius: "6px",
                    background: "linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)",
                    border: "none"
                  }}
                >
                  {isSubmittingComment ? "Đang gửi..." : "Gửi bình luận"}
                </Button>
              </div>
            </div>
          </div>
        </Space>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {getPaginatedComments().length > 0 ? (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {getPaginatedComments().map((comment) => (
              <div key={comment.commentId || comment._id} style={{ position: "relative" }}>
                <CommentComponent
                  comment={comment}
                  parentId={null} // Comment gốc không có parent
                  retrieveComments={retrieveComments}
                  examId={examId} // Truyền examId xuống CommentComponent
                  className="comment"
                />
                {/* Loading overlay cho optimistic comment */}
                {comment.isSubmitting && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(255, 255, 255, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "12px",
                    zIndex: 10
                  }}>
                    <Spin size="small" tip="Đang gửi..." />
                  </div>
                )}
              </div>
            ))}
          </Space>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
              </Text>
            }
            style={{ 
              padding: "40px 20px",
              background: "var(--color-bg-hover)",
              borderRadius: "12px",
              border: "1px dashed #d9d9d9"
            }}
          />
        )}
      </div>

      {/* Pagination */}
      {comments.length > pageSize && (
        <div style={{ 
          marginTop: "24px",
          padding: "20px",
          background: "var(--color-bg-hover)",
          borderRadius: "12px",
          border: "1px solid #f0f0f0"
        }}>
          {/* Pagination Info */}
          <div className="d-flex justify-content-center mt-3 fw-lighter fst-italic mb-3">
            <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "12px" }}>
              {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, comments.length)} trên {comments.length} bình luận
            </p>
          </div>

          {/* Pagination Controls */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center" style={{ margin: 0 }}>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1, pageSize)}
                  disabled={currentPage === 1}
                  style={{
                    borderRadius: currentPage === 1 ? '20px 0 0 20px' : '0',
                    border: '1px solid #e9ecef',
                    color: currentPage === 1 ? 'var(--color-draft)' : 'var(--color-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &laquo;
                </button>
              </li>

              {Array.from({ length: Math.ceil(comments.length / pageSize) }, (_, i) => i + 1).map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pageNumber, pageSize)}
                    style={{
                      border: '1px solid #e9ecef',
                      color: currentPage === pageNumber ? 'var(--color-bg-primary)' : 'var(--color-primary)',
                      backgroundColor: currentPage === pageNumber ? 'var(--color-primary)' : 'var(--color-bg-primary)',
                      borderLeft: pageNumber === 1 ? 'none' : '1px solid #e9ecef',
                      borderRight: pageNumber === Math.ceil(comments.length / pageSize) ? 'none' : '1px solid #e9ecef',
                      padding: '8px 12px',
                      minWidth: '40px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === Math.ceil(comments.length / pageSize) ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1, pageSize)}
                  disabled={currentPage === Math.ceil(comments.length / pageSize)}
                  style={{
                    borderRadius: currentPage === Math.ceil(comments.length / pageSize) ? '0 20px 20px 0' : '0',
                    border: '1px solid #e9ecef',
                    color: currentPage === Math.ceil(comments.length / pageSize) ? 'var(--color-draft)' : 'var(--color-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    padding: '8px 12px',
                    transition: 'all 0.2s ease',
                    cursor: currentPage === Math.ceil(comments.length / pageSize) ? 'not-allowed' : 'pointer'
                  }}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CommentsList;

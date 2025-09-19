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
  Spin // Thêm Spin cho loading
} from "antd";
import { 
  SendOutlined, 
  MessageOutlined, 
  FilterOutlined,
  UserOutlined,
  LoadingOutlined // Thêm icon loading
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
  const [visibleComments, setVisibleComments] = useState([]);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false); // Loading state cho submit
  const loadMoreComments = 10;
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

  const retrieveComments = useCallback(async () => {
    try {
      let fetchedComments;
      if (filter === "user") {
        const learnerToken = localStorage.getItem("learnerToken");
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
        setShowLoadMoreButton(normalizedComments.length > loadMoreComments);
        setVisibleComments(normalizedComments.slice(0, loadMoreComments));
      } else {
        setComments([]);
        setVisibleComments([]);
        setShowLoadMoreButton(false);
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
      const learnerToken = localStorage.getItem("learnerToken");
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
      setVisibleComments(prev => [optimisticComment, ...prev.slice(0, loadMoreComments - 1)]);
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
        setVisibleComments(prev => prev.map(comment => 
          comment.commentId === optimisticComment.commentId 
            ? { ...normalizedResponse, isOptimistic: false, isSubmitting: false }
            : comment
        ));

        toast.success("Đã thêm bình luận");
      } else {
        // API thất bại: Remove optimistic comment
        console.error("❌ Failed to create comment:", createResult.reason);
        setComments(prev => prev.filter(comment => comment.commentId !== optimisticComment.commentId));
        setVisibleComments(prev => prev.filter(comment => comment.commentId !== optimisticComment.commentId));
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
      setVisibleComments(prev => prev.filter(comment => comment.commentId !== `temp-${Date.now()}`));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadMore = () => {
    if (visibleComments.length + loadMoreComments >= comments.length) {
      setShowLoadMoreButton(false);
    }
    setVisibleComments(
      comments.slice(0, visibleComments.length + loadMoreComments)
    );
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
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
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
        background: "#fafafa", 
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
                backgroundColor: "#1890ff", 
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
                  icon={isSubmittingComment ? <LoadingOutlined spin /> : <SendOutlined />}
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
        {visibleComments.length > 0 ? (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {visibleComments.map((comment) => (
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
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px dashed #d9d9d9"
            }}
          />
        )}
      </div>

      {/* Load More Button */}
      {showLoadMoreButton && visibleComments.length < comments.length && (
        <div style={{ 
          textAlign: "center", 
          marginTop: "24px",
          padding: "16px"
        }}>
          <Button
            onClick={loadMore}
            size="large"
            style={{ 
              borderRadius: "8px",
              height: "44px",
              minWidth: "140px"
            }}
          >
            Xem thêm bình luận
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentsList;

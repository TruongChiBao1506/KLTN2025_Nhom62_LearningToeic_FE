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
  Empty
} from "antd";
import { 
  SendOutlined, 
  MessageOutlined, 
  FilterOutlined,
  UserOutlined 
} from "@ant-design/icons";
import CommentComponent from "./CommentComponent";
import commentService from "../../../services/commentService";
import { toast } from "react-toastify";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const CommentsList = () => {
  const [filter, setFilter] = useState("all");
  const [comments, setComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState([]);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const loadMoreComments = 10;

  const retrieveComments = useCallback(async () => {
    try {
      let fetchedComments;
      if (filter === "user") {
        const learnerToken = localStorage.getItem("learnerToken");
        if (learnerToken) {
          const decoded = jwtDecode(learnerToken);
          fetchedComments = await commentService.getUserComments(decoded.id);
        } else {
          toast.error("Vui lòng đăng nhập để xem bình luận của bạn");
          return;
        }
      } else {
        fetchedComments = await commentService.getAllComments();
      }

      if (fetchedComments && fetchedComments.length > 0) {
        setComments(fetchedComments);
        setShowLoadMoreButton(fetchedComments.length > loadMoreComments);
        setVisibleComments(fetchedComments.slice(0, loadMoreComments));
      } else {
        setComments([]);
        setVisibleComments([]);
        setShowLoadMoreButton(false);
      }
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
      toast.error("Không thể tải bình luận, vui lòng thử lại sau");
    }
  }, [filter]);

  useEffect(() => {
    retrieveComments();
  }, [retrieveComments]);

  const addComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const learnerToken = localStorage.getItem("learnerToken");
      if (!learnerToken) {
        toast.error("Vui lòng đăng nhập để bình luận");
        return;
      }

      const decoded = jwtDecode(learnerToken);

      const data = {
        text: newCommentText,
        userId: decoded.id,
        // Không có parentCommentId cho comment gốc
      };

      console.log("Creating root comment with data:", data); // Debug log
      const response = await commentService.createComment(data);
      console.log("Create comment response:", response); // Debug log
      
      setNewCommentText("");
      retrieveComments();
      toast.success("Đã thêm bình luận");
    } catch (error) {
      console.error("Lỗi khi bình luận:", error);
      toast.error("Lỗi khi bình luận, vui lòng thử lại sau");
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
                  icon={<SendOutlined />}
                  onClick={addComment}
                  disabled={!newCommentText.trim()}
                  style={{ 
                    borderRadius: "6px",
                    background: "linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)",
                    border: "none"
                  }}
                >
                  Gửi bình luận
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
              <CommentComponent
                key={comment.commentId || comment._id}
                comment={comment}
                parentId={null} // Comment gốc không có parent
                retrieveComments={retrieveComments}
                className="comment"
              />
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

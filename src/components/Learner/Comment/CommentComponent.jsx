import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import commentService from "../../../services/commentService";
import {
  Card,
  Avatar,
  Typography,
  Button,
  Input,
  Space,
  Dropdown
} from "antd";
import {
  UserOutlined,
  MessageOutlined,
  DeleteOutlined,
  MoreOutlined,
  SendOutlined
} from "@ant-design/icons";
import "./style.css";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const CommentComponent = ({ comment, parentId, retrieveComments, examId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return "Vừa xong";
      }

      // Xử lý cho optimistic comments
      if (comment.isOptimistic) {
        return "Đang gửi...";
      }

      // Xử lý các định dạng ngày khác nhau
      let date;
      if (typeof dateString === 'string') {
        // Xử lý ISO string từ MongoDB (2025-09-08T08:03:57.086+00:00)
        date = new Date(dateString);
      } else if (typeof dateString === 'number') {
        // Nếu là timestamp
        date = new Date(dateString);
      } else {
        // Nếu đã là Date object
        date = dateString;
      }

      // Kiểm tra xem date có hợp lệ không
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date value:", dateString);
        return "Vừa xong";
      }

      // Tính khoảng cách thời gian với hiện tại
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      // Nếu comment được tạo trong vòng 1 phút (60 giây), hiển thị "Vừa xong"
      if (diffInSeconds < 60) {
        return "Vừa xong";
      }

      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error("Lỗi khi format ngày:", error, "Input:", dateString);
      return "Vừa xong";
    }
  };

  const addReply = async () => {
    if (!replyText.trim()) return;

    try {
      // ✅ Check sessionStorage for tokens
      const learnerToken = sessionStorage.getItem("learnerToken");
      if (!learnerToken) {
        toast.error("Vui lòng đăng nhập để trả lời bình luận");
        return;
      }

      const decoded = jwtDecode(learnerToken);
      const userId = decoded.id;

      console.log("Current comment:", comment);
      console.log("Parent comment ID should be:", comment.commentId);
      console.log("Comment._id:", comment._id);

      const data = {
        text: replyText,
        userId: userId,
        examId: examId,
        parentId: comment._id || comment.commentId,
      };

      console.log("Creating reply with data:", data);
      await commentService.createComment(data);

      setReplyText("");
      setShowReplyForm(false);
      retrieveComments();
      toast.success("Đã thêm phản hồi");
    } catch (error) {
      console.error("Lỗi khi phản hồi bình luận:", error);
      toast.error("Lỗi khi phản hồi, vui lòng thử lại sau");
    }
  };

  const deleteComment = async () => {
    try {
      await commentService.deleteComment(comment.commentId);
      retrieveComments();
      toast.success("Đã xóa bình luận");
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      toast.error("Lỗi khi xóa bình luận, vui lòng thử lại sau");
    }
  };

  const isOwner = () => {
    try {
      // ✅ Check sessionStorage for tokens
      const learnerToken = sessionStorage.getItem("learnerToken");
      if (!learnerToken) return false;

      const decoded = jwtDecode(learnerToken);
      return decoded.id === comment.userId;
    } catch (error) {
      return false;
    }
  };

  const isOptimistic = comment.isOptimistic || false;

  return (
    <Card
      className="modern-comment-card"
      style={{
        background: isOptimistic ? "var(--color-success-bg)" : "var(--color-bg-primary)", // Highlight optimistic comments
        borderRadius: "12px",
        border: `1px solid ${isOptimistic ? "#b7eb8f" : "#f0f0f0"}`,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        marginBottom: comment.replies?.length > 0 ? "16px" : "8px",
        opacity: isOptimistic ? 0.8 : 1 // Làm mờ optimistic comments
      }}
      bodyStyle={{ padding: "16px" }}
    >
      {/* Comment Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {comment.user?.image ? (
            <>
              <Avatar
                src={comment.user?.image}
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-bg-primary)" }}
                size={40}
              />
            </>
          ) : (
            <Avatar
              icon={<UserOutlined />}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-bg-primary)"
              }}
              size={40}
            />
          )}

          <div>
            <Text strong style={{ fontSize: "12px", color: "#262626" }}>
              {comment.user?.name || comment.userName || "Người dùng"}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {comment.date ? formatDate(comment.date) : (comment.createdAt ? formatDate(comment.createdAt) : "Vừa xong")}
            </Text>
          </div>
        </div>

        {isOwner() && (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'delete',
                  label: 'Xóa bình luận',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: deleteComment
                }
              ]
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{ color: "#8c8c8c" }}
            />
          </Dropdown>
        )}
      </div>

      {/* Comment Content */}
      <div style={{ marginBottom: "12px", marginLeft: "52px" }}>
        <Paragraph
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: "1.6",
            color: "#262626"
          }}
        >
          {comment.text}
        </Paragraph>
      </div>

      {/* Comment Actions */}
      <div style={{ marginLeft: "52px" }}>
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => setShowReplyForm(!showReplyForm)}
            style={{
              color: showReplyForm ? "var(--color-primary)" : "#8c8c8c",
              padding: "0 8px",
              height: "28px"
            }}
            disabled={isOptimistic} // Disable reply cho optimistic comments
          >
            {showReplyForm ? "Hủy" : "Trả lời"}
          </Button>
        </Space>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div style={{
          marginTop: "16px",
          marginLeft: "52px",
          background: "var(--color-bg-hover)",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #f0f0f0"
        }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <TextArea
              placeholder="Viết phản hồi..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ borderRadius: "6px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                size="small"
                onClick={() => setShowReplyForm(false)}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={addReply}
                disabled={!replyText.trim()}
                style={{
                  background: "linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)",
                  border: "none"
                }}
              >
                Gửi
              </Button>
            </div>
          </Space>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{
          marginTop: "16px",
          marginLeft: "52px",
          borderLeft: "2px solid #f0f0f0",
          paddingLeft: "16px"
        }}>
          <Text type="secondary" style={{ fontSize: "12px", marginBottom: "12px", display: "block" }}>
            {comment.replies.length} phản hồi
          </Text>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {comment.replies.map((reply) => (
              <CommentComponent
                key={reply.commentId || reply._id}
                comment={reply}
                parentId={comment._id || comment.commentId} // Sử dụng _id của comment cha
                retrieveComments={retrieveComments}
                examId={examId} // Truyền examId xuống reply
              />
            ))}
          </Space>
        </div>
      )}
    </Card>
  );
};

export default CommentComponent;

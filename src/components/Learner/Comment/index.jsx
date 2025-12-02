import React from "react";
import { Card } from "antd";
import CommentsList from "./CommentsList";
import "./style.css";

const Comment = ({ examId }) => {
  return (
    <Card 
      className="modern-comment-section"
      style={{
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "none",
        background: "var(--color-bg-primary)"
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <CommentsList examId={examId} />
    </Card>
  );
};

export default Comment;

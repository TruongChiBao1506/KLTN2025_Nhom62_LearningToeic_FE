import React from "react";
import { Card } from "antd";
import CommentsList from "./CommentsList";
import "./style.css";

const Comment = () => {
  return (
    <Card 
      className="modern-comment-section"
      style={{
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        border: "none",
        background: "#fff"
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <CommentsList />
    </Card>
  );
};

export default Comment;

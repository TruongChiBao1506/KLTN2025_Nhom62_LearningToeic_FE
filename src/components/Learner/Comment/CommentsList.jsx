import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import CommentComponent from "./CommentComponent";
import commentService from "../../../services/commentService";
import { toast } from "react-toastify";

const CommentsList = () => {
  const [filter, setFilter] = useState("all");
  const [comments, setComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState([]);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [userId, setUserId] = useState(null);
  const loadMoreComments = 10;

  const retrieveComments = useCallback(async () => {
    try {
      let fetchedComments;
      if (filter === "user") {
        const learnerToken = localStorage.getItem("learnerToken");
        if (learnerToken) {
          const decoded = jwtDecode(learnerToken);
          setUserId(decoded.id);
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
      setUserId(decoded.id);

      const data = {
        text: newCommentText,
        userId: decoded.id,
      };

      await commentService.createComment(data);
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

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      <div className="d-flex justify-content-end my-3 me-3">
        <select
          value={filter}
          onChange={handleFilterChange}
          className="form-select border-secondary w-25 mb-3"
        >
          <option disabled>LỌC BÌNH LUẬN</option>
          <option value="user">Bình luận của bạn</option>
          <option value="all">Tất cả bình luận</option>
        </select>
      </div>

      <div className="d-flex justify-content-center">
        <div className="comment-form mt-2 input-group w-75">
          <input
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            type="text"
            className="form-control border-secondary"
            placeholder="Thêm bình luận"
          />
          <button onClick={addComment} className="btn btn-secondary">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {visibleComments.map((comment) => (
        <CommentComponent
          key={comment.commentId}
          comment={comment}
          parentId={comment.commentId}
          retrieveComments={retrieveComments}
          className="comment"
        />
      ))}

      {showLoadMoreButton && visibleComments.length < comments.length && (
        <div>
          <button
            onClick={loadMore}
            className="btn btn-link link-offset-3 ms-3 mb-3"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsList;

import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import commentService from '../../../services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import './style.css';

const CommentComponent = ({ comment, parentId, retrieveComments }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  };

  const addReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      const learnerToken = localStorage.getItem('learnerToken');
      if (!learnerToken) {
        toast.error('Vui lòng đăng nhập để trả lời bình luận');
        return;
      }
      
      const decoded = jwtDecode(learnerToken);
      const userId = decoded.id;
      
      const data = {
        text: replyText,
        userId: userId,
        parentCommentId: parentId
      };
      
      await commentService.createComment(data);
      setReplyText('');
      setShowReplyForm(false);
      retrieveComments();
      toast.success('Đã thêm phản hồi');
    } catch (error) {
      console.error('Lỗi khi phản hồi bình luận:', error);
      toast.error('Lỗi khi phản hồi, vui lòng thử lại sau');
    }
  };

  const deleteComment = async () => {
    try {
      await commentService.deleteComment(comment.commentId);
      retrieveComments();
      toast.success('Đã xóa bình luận');
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
      toast.error('Lỗi khi xóa bình luận, vui lòng thử lại sau');
    }
  };

  const isOwner = () => {
    try {
      const learnerToken = localStorage.getItem('learnerToken');
      if (!learnerToken) return false;
      
      const decoded = jwtDecode(learnerToken);
      return decoded.id === comment.userId;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="comment-container ms-3 mt-3">
      <div className="comment-header d-flex justify-content-between">
        <div className="user-info">
          <h6 className="mb-0">{comment.userName || 'Người dùng'}</h6>
          <small className="text-muted">{formatDate(comment.createdAt)}</small>
        </div>
        {isOwner() && (
          <div className="comment-actions">
            <button onClick={deleteComment} className="btn btn-sm btn-link text-danger">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        )}
      </div>
      
      <div className="comment-content mt-1">{comment.text}</div>
      
      <div className="comment-footer mt-2">
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="btn btn-sm btn-link text-decoration-none"
        >
          {showReplyForm ? 'Hủy' : 'Trả lời'}
        </button>
      </div>
      
      {showReplyForm && (
        <div className="reply-form mt-2 d-flex">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Viết phản hồi..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button onClick={addReply} className="btn btn-primary ms-2">
            Gửi
          </button>
        </div>
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container ms-4 mt-2">
          {comment.replies.map(reply => (
            <CommentComponent 
              key={reply.commentId}
              comment={reply}
              parentId={parentId}
              retrieveComments={retrieveComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentComponent;

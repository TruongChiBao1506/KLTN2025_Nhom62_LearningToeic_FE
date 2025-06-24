import React from 'react';
import CommentsList from './CommentsList';
import './style.css';

const Comment = () => {
  return (
    <div className="card my-3 bg-light">
      <CommentsList />
    </div>
  );
};

export default Comment;

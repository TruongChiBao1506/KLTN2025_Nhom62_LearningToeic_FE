import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import BlogEdit from '../../../../pages/Admin/Blog/BlogEdit';

const EditBlogModal = ({ show, onHide, blogId, retrieveBlogs }) => {
    console.log('EditBlogModal render:', { show, blogId });

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 1050 }}
            className="zoom"
        >
            <Modal.Header closeButton className="bg-warning text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Blog
                </Modal.Title>
            </Modal.Header>
            
            {blogId ? (
                <BlogEdit 
                    blogId={blogId}
                    retrieveBlogs={retrieveBlogs} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>No blog ID provided</p>
                </div>
            )}
        </Modal>
    );
};

export default EditBlogModal;
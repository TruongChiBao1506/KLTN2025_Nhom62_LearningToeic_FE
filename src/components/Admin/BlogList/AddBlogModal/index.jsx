import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import BlogAdd from '../../../../pages/Admin/Blog/BlogAdd';

const AddBlogModal = ({ show, onHide, retrieveBlogs }) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            className="zoom"
        >
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-white me-2" />
                    Add New Blog
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <BlogAdd 
                    retrieveBlogs={retrieveBlogs} 
                    onClose={onHide}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddBlogModal;
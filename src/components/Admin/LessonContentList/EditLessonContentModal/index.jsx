import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import LessonContentEdit from '../../../../pages/Admin/LessonContent/LessonContentEdit';

const EditLessonContentModal = ({ show, onHide, lessonContentId, lessonId, retrieveLessonContents }) => {
    console.log('EditLessonContentModal render:', { show, lessonContentId, lessonId });

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
                    Edit Lesson Content
                </Modal.Title>
            </Modal.Header>
            
            {lessonContentId && lessonId ? (
                <LessonContentEdit 
                    lessonContentId={lessonContentId}
                    lessonId={lessonId}
                    retrieveLessonContents={retrieveLessonContents} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có lesson content ID hoặc lesson ID</p>
                </div>
            )}
        </Modal>
    );
};
export default EditLessonContentModal;

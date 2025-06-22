import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import LessonEdit from '../../../pages/LessonBySection/LessonEdit';

const EditLessonModal = ({ show, onHide, lessonId, sectionId, retrieveLessons }) => {
    console.log('EditLessonModal render:', { show, lessonId, sectionId });

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            className="zoom"
            style={{ zIndex: 1050 }}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Lesson
                </Modal.Title>
            </Modal.Header>
            
            {lessonId && sectionId ? (
                <LessonEdit 
                    lessonId={lessonId}
                    sectionId={sectionId}
                    retrieveLessons={retrieveLessons} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có lesson ID hoặc section ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditLessonModal;
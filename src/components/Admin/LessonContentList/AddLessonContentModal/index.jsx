import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import LessonContentAdd from '../../../../pages/Admin/LessonContent/LessonContentAdd';

const AddLessonContentModal = ({ show, onHide, lessonId, retrieveLessonContents }) => {
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
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-success me-2" />
                    Add Lesson Content
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <LessonContentAdd 
                    lessonId={lessonId}
                    retrieveLessonContents={retrieveLessonContents} 
                    onClose={onHide}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddLessonContentModal;
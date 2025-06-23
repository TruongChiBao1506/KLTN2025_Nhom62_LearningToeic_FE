import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import LessonAdd from '../../../../pages/Admin/LessonBySection/LessonAdd';

const AddLessonModal = ({ show, onHide, sectionId, retrieveLessons }) => {
    console.log('AddLessonModal render:', { show, sectionId });

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
                    Add Lesson
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {sectionId ? (
                    <LessonAdd 
                        sectionId={sectionId}
                        retrieveLessons={retrieveLessons} 
                        onClose={onHide}
                    />
                ) : (
                    <div className="modal-body text-center py-4">
                        <p>Không có section ID</p>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AddLessonModal;
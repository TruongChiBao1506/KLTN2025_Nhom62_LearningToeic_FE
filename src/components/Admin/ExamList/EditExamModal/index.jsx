import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import ExamEdit from '../../../../pages/Admin/Exam/ExamEdit';

const EditExamModal = ({ show, onHide, examId, retrieveExams }) => {
    console.log('EditExamModal render:', { show, examId });

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
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Exam
                </Modal.Title>
            </Modal.Header>
            
            {examId ? (
                <ExamEdit 
                    examId={examId}
                    retrieveExams={retrieveExams} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có exam ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditExamModal;
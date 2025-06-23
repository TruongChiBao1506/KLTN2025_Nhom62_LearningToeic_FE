import React from 'react';
import { Modal } from 'react-bootstrap';
import ExamQuestionAdd from '../../../../pages/Admin/ExamQuestion/ExamQuestionAdd';

const AddExamQuestionModal = ({ show, onHide, examId, retrieveExamQuestions }) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            backdrop="static"
            keyboard={false}
            className="zoom"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fa-solid fa-circle-plus text-success me-2"></i>
                    Import Exam Questions
                </Modal.Title>
            </Modal.Header>
            
            <ExamQuestionAdd
                examId={examId}
                retrieveExamQuestions={retrieveExamQuestions}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddExamQuestionModal;
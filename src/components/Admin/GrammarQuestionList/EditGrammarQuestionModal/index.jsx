import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarQuestionEdit from '../../../../pages/Admin/GrammarQuestion/GrammarQuestionEdit';

const EditGrammarQuestionModal = ({ 
    show, 
    onHide, 
    grammarQuestionId, 
    grammarId, 
    retrieveGrammarQuestions 
}) => {
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
                    <i className="fas fa-edit me-2"></i>
                    Chỉnh sửa Grammar Question
                </Modal.Title>
            </Modal.Header>
            
            <GrammarQuestionEdit
                grammarQuestionId={grammarQuestionId}
                grammarId={grammarId}
                retrieveGrammarQuestions={retrieveGrammarQuestions}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditGrammarQuestionModal;
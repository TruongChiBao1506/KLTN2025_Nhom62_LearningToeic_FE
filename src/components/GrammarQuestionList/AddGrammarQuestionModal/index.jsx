import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarQuestionAdd from '../../../pages/GrammarQuestion/GrammarQuestionAdd';

const AddGrammarQuestionModal = ({ show, onHide, grammarId, retrieveGrammarQuestions }) => {
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
                    <i className="fas fa-plus-circle me-2"></i>
                    Thêm Grammar Question
                </Modal.Title>
            </Modal.Header>
            
            <GrammarQuestionAdd
                grammarId={grammarId}
                retrieveGrammarQuestions={retrieveGrammarQuestions}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddGrammarQuestionModal;
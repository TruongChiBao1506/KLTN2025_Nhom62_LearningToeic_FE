import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarQuestionAdd from '../../../../pages/Admin/GrammarQuestion/GrammarQuestionAdd';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
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
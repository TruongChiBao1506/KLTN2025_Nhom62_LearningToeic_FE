import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyQuestionAdd from '../../../../pages/Admin/VocabularyQuestion/VocabularyQuestionAdd';

const AddVocabularyQuestionModal = ({ show, onHide, topicId, retrieveVocabularyQuestions }) => {
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
                    <i className="fa-solid fa-circle-plus me-2"></i>
                    Add Vocabulary Question
                </Modal.Title>
            </Modal.Header>
            
            <VocabularyQuestionAdd 
                topicId={topicId}
                retrieveVocabularyQuestions={retrieveVocabularyQuestions}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddVocabularyQuestionModal;
import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyQuestionEdit from '../../../../pages/Admin/VocabularyQuestion/VocabularyQuestionEdit';

const EditVocabularyQuestionModal = ({ show, onHide, vocabularyQuestionId, topicId, retrieveVocabularyQuestions }) => {
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
            <Modal.Header closeButton className="bg-warning text-dark">
                <Modal.Title>
                    <i className="fas fa-edit me-2"></i>
                    Edit Vocabulary Question
                </Modal.Title>
            </Modal.Header>
            
            <VocabularyQuestionEdit 
                vocabularyQuestionId={vocabularyQuestionId}
                topicId={topicId}
                retrieveVocabularyQuestions={retrieveVocabularyQuestions}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditVocabularyQuestionModal;
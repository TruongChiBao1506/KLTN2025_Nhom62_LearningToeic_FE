import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyQuestionEdit from '../../../../pages/Admin/VocabularyQuestion/VocabularyQuestionEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

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
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
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
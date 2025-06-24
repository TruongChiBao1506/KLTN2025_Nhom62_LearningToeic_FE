import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyQuestionAdd from '../../../../pages/Admin/VocabularyQuestion/VocabularyQuestionAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

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
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
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
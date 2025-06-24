import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyEdit from '../../../../pages/Admin/VocabularyByTopic/VocabularyEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditVocabularyModal = ({ show, onHide, vocabularyId, topicId, retrieveVocabularies }) => {
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
                    Edit Vocabulary
                </Modal.Title>
            </Modal.Header>
            
            <VocabularyEdit 
                vocabularyId={vocabularyId}
                topicId={topicId}
                retrieveVocabularies={retrieveVocabularies}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditVocabularyModal;
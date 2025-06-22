import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyEdit from '../../../pages/VocabularyByTopic/VocabularyEdit';

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
                    <i className="fas fa-edit me-2"></i>
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
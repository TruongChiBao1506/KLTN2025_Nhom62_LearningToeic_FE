import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyAdd from '../../../../pages/Admin/VocabularyByTopic/VocabularyAdd';

const AddVocabularyModal = ({ show, onHide, topicId, retrieveVocabularies }) => {
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
                    Add Vocabulary
                </Modal.Title>
            </Modal.Header>
            
            <VocabularyAdd 
                topicId={topicId}
                retrieveVocabularies={retrieveVocabularies}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddVocabularyModal;
import React from 'react';
import { Modal } from 'react-bootstrap';
import VocabularyAdd from '../../../../pages/Admin/VocabularyByTopic/VocabularyAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

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
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
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
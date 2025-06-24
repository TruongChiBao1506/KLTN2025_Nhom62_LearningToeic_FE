import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import TopicAdd from '../../../../pages/Admin/Topic/TopicAdd';

const AddTopicModal = ({ show, onHide, retrieveTopics }) => {
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
                    Add Topic
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <TopicAdd 
                    retrieveTopics={retrieveTopics} 
                    onClose={onHide}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddTopicModal;
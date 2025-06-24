import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import TopicEdit from '../../../../pages/Admin/Topic/TopicEdit';

const EditTopicModal = ({ show, onHide, topicId, retrieveTopics }) => {
    console.log('EditTopicModal render:', { show, topicId });

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            style={{ zIndex: 1050 }}
            className="zoom"
        >
            <Modal.Header closeButton className="bg-warning text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Topic
                </Modal.Title>
            </Modal.Header>
            
            {topicId ? (
                <TopicEdit 
                    topicId={topicId}
                    retrieveTopics={retrieveTopics} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có topic ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditTopicModal;
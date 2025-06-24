import React from 'react';
import { Modal } from 'react-bootstrap';
import TestEdit from '../../../../pages/Admin/TestBySection/TestEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditTestModal = ({ show, onHide, testId, sectionId, retrieveTests }) => {
    console.log('EditTestModal render:', { show, testId, sectionId });

    return (
        <Modal 
            show={show} 
            onHide={onHide}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            className='zoom'
        >
            <Modal.Header closeButton className="bg-warning text-dark">
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Chỉnh sửa Test
                </Modal.Title>
            </Modal.Header>
            
            <TestEdit 
                testId={testId}
                sectionId={sectionId}
                retrieveTests={retrieveTests}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditTestModal;
import React from 'react';
import { Modal } from 'react-bootstrap';
import TestAdd from '../../../../pages/Admin/TestBySection/TestAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const AddTestModal = ({ show, onHide, sectionId, retrieveTests }) => {
    console.log('AddTestModal render:', { show, sectionId });

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
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
                    Thêm Test Mới
                </Modal.Title>
            </Modal.Header>
            
            <TestAdd 
                sectionId={sectionId}
                retrieveTests={retrieveTests}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddTestModal;
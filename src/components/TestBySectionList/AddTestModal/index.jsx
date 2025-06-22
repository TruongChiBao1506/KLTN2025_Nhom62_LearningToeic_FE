import React from 'react';
import { Modal } from 'react-bootstrap';
import TestAdd from '../../../pages/TestBySection/TestAdd';

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
                    <i className="fas fa-plus-circle me-2"></i>
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
import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import FreeMaterialAdd from '../../../pages/FreeMaterial/FreeMaterialAdd';

const AddFreeMaterialModal = ({ show, onHide, retrieveFreeMaterials }) => {
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
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-success me-2" />
                    Add Free Material
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <FreeMaterialAdd 
                    retrieveFreeMaterials={retrieveFreeMaterials} 
                    onClose={onHide}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddFreeMaterialModal;
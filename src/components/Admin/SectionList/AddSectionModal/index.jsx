import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import SectionAdd from '../../../../pages/Admin/Section/SectionAdd';

const AddSectionModal = ({ show, onHide, retrieveSections }) => {
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
                    Add Section
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <SectionAdd 
                    retrieveSections={retrieveSections} 
                    onClose={onHide}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddSectionModal;
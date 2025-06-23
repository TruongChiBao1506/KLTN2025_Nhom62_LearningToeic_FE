import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import SectionEdit from '../../../../pages/Admin/Section/SectionEdit';

const EditSectionModal = ({ show, onHide, sectionId, retrieveSections }) => {
    console.log('EditSectionModal render:', { show, sectionId });

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
            <Modal.Header closeButton>
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Section
                </Modal.Title>
            </Modal.Header>
            
            {sectionId ? (
                <SectionEdit 
                    sectionId={sectionId}
                    retrieveSections={retrieveSections} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có section ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditSectionModal;
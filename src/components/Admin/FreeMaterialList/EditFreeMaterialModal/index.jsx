import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import FreeMaterialEdit from '../../../../pages/Admin/FreeMaterial/FreeMaterialEdit';

const EditFreeMaterialModal = ({ show, onHide, materialId, retrieveFreeMaterials }) => {
    console.log('EditFreeMaterialModal render:', { show, materialId });

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
                    Edit Free Material
                </Modal.Title>
            </Modal.Header>
            
            {materialId ? (
                <FreeMaterialEdit 
                    materialId={materialId}
                    retrieveFreeMaterials={retrieveFreeMaterials} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có material ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditFreeMaterialModal;
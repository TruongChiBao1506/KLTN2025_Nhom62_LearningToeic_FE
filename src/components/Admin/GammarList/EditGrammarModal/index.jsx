import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import GrammarEdit from '../../../../pages/Admin/Grammar/GrammarEdit';

const EditGrammarModal = ({ show, onHide, grammarId, retrieveGrammars }) => {
    console.log('EditGrammarModal render:', { show, grammarId });

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
                    Edit Grammar
                </Modal.Title>
            </Modal.Header>
            
            {grammarId ? (
                <GrammarEdit 
                    grammarId={grammarId}
                    retrieveGrammars={retrieveGrammars} 
                    onClose={onHide}
                />
            ) : (
                <div className="modal-body text-center py-4">
                    <p>Không có grammar ID</p>
                </div>
            )}
        </Modal>
    );
};

export default EditGrammarModal;
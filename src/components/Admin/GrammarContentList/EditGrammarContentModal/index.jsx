import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarContentEdit from '../../../../pages/Admin/GrammarContent/GrammarContentEdit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditGrammarContentModal = ({ show, onHide, grammarContentId, grammarId, retrieveGrammarContents }) => {
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
            <Modal.Header closeButton className="bg-warning text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="me-2" style={{color: 'rgb(192, 129, 13)'}} />
                    Edit Grammar Content
                </Modal.Title>
            </Modal.Header>
            
            <GrammarContentEdit 
                grammarContentId={grammarContentId}
                grammarId={grammarId}
                retrieveGrammarContents={retrieveGrammarContents}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditGrammarContentModal;
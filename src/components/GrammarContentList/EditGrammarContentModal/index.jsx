import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarContentEdit from '../../../pages/GrammarContent/GrammarContentEdit';

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
                    <i className="fa-solid fa-edit me-2"></i>
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
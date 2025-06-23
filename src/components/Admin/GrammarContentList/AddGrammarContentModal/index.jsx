import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarContentAdd from '../../../../pages/Admin/GrammarContent/GrammarContentAdd';

const AddGrammarContentModal = ({ show, onHide, grammarId, retrieveGrammarContents }) => {
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
                    <i className="fa-solid fa-circle-plus me-2"></i>
                    Add Grammar Content
                </Modal.Title>
            </Modal.Header>
            
            <GrammarContentAdd 
                grammarId={grammarId}
                retrieveGrammarContents={retrieveGrammarContents}
                onClose={onHide}
            />
        </Modal>
    );
};

export default AddGrammarContentModal;
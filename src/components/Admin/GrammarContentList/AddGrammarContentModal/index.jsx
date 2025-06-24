import React from 'react';
import { Modal } from 'react-bootstrap';
import GrammarContentAdd from '../../../../pages/Admin/GrammarContent/GrammarContentAdd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

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
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
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
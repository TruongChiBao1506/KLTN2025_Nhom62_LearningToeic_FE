import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';

import ScoreTableEdit from '../../../../pages/Admin/ScoreTable/ScoreTableEdit';

const EditScoreTableModal = ({ 
    show, 
    onHide, 
    scoreTableId, 
    getTableScores 
}) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="md"
            centered
            className="zoom"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-edit" style={{ color: 'rgb(192, 129, 13)' }}></i>
                    {' '}Edit Score
                </Modal.Title>
            </Modal.Header>
            
            <ScoreTableEdit
                scoreTableId={scoreTableId}
                getTableScores={getTableScores}
                onClose={onHide}
            />
        </Modal>
    );
};

export default EditScoreTableModal;
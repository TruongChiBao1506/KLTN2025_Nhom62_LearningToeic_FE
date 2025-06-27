import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

// Import tất cả các QuestionEdit components
import QuestionEditSection1 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection1';
import QuestionEditSection2 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection2';
import QuestionEditSection3 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection3';
import QuestionEditSection4 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection4';
import QuestionEditSection5 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection5';
import QuestionEditSection6 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection6';
import QuestionEditSection7Single from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection7_1';
import QuestionEditSection7Double from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection7_2';
import QuestionEditSection7Triple from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditSection7_3';
import QuestionEditNo1To2 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo1To2';
import QuestionEditNo3To4 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo3To4';
import QuestionEditNo5To7 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo5To7';
import QuestionEditNo8To10 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo8To10';
import QuestionEditNo11 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo11';
import QuestionEditNo1To5 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo1To5';
import QuestionEditNo6To7 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo6To7';
import QuestionEditNo8 from '../../../../pages/Admin/QuestionBySection/QuestionEdit/QuestionEditNo8';

const EditQuestionModal = ({ show, onHide, sectionId, questionId, retrieveQuestions }) => {
    const renderQuestionEditComponent = () => {
        switch (sectionId) {
            case "685d00f73264907d89c121dc":
                return (
                    <QuestionEditSection1
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d0b33abd7f3cf92add5f1":
                return (
                    <QuestionEditSection2
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d0be9abd7f3cf92add5fd":
                return (
                    <QuestionEditSection3
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d0eababd7f3cf92add604":
                return (
                    <QuestionEditSection4
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d0fa7abd7f3cf92add60b":
                return (
                    <QuestionEditSection5
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d0ff9abd7f3cf92add612":
                return (
                    <QuestionEditSection6
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d10aaabd7f3cf92add619":
                return (
                    <QuestionEditSection7Single
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d10f3abd7f3cf92add620":
                return (
                    <QuestionEditSection7Double
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d12f0abd7f3cf92add643":
                return (
                    <QuestionEditSection7Triple
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d16f6abd7f3cf92add64a":
                return (
                    <QuestionEditNo1To2
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d170eabd7f3cf92add651":
                return (
                    <QuestionEditNo3To4
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1721abd7f3cf92add658":
                return (
                    <QuestionEditNo5To7
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1732abd7f3cf92add65f":
                return (
                    <QuestionEditNo8To10
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1744abd7f3cf92add666":
                return (
                    <QuestionEditNo11
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1761abd7f3cf92add66d":
                return (
                    <QuestionEditNo1To5
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1773abd7f3cf92add674":
                return (
                    <QuestionEditNo6To7
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d178babd7f3cf92add67b":
                return (
                    <QuestionEditNo8
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
        switch (sectionId) {
            case "685d00f73264907d89c121dc":
                return "Chỉnh sửa câu hỏi Section 1";
            case "685d0b33abd7f3cf92add5f1":
                return "Chỉnh sửa câu hỏi Section 2";
            case "685d0be9abd7f3cf92add5fd":
                return "Chỉnh sửa câu hỏi Section 3";
            case "685d0eababd7f3cf92add604":
                return "Chỉnh sửa câu hỏi Section 4";
            case "685d0fa7abd7f3cf92add60b":
                return "Chỉnh sửa câu hỏi Section 5";
            case "685d0ff9abd7f3cf92add612":
                return "Chỉnh sửa câu hỏi Section 6";
            case "685d10aaabd7f3cf92add619":
                return "Chỉnh sửa câu hỏi Section 7 Single";
            case "685d10f3abd7f3cf92add620":
                return "Chỉnh sửa câu hỏi Section 7 Double";
            case "685d12f0abd7f3cf92add643":
                return "Chỉnh sửa câu hỏi Section 7 Triple";
            case "685d16f6abd7f3cf92add64a":
                return "Chỉnh sửa câu hỏi No.1-2";
            case "685d170eabd7f3cf92add651":
                return "Chỉnh sửa câu hỏi No.3-4";
            case "685d1721abd7f3cf92add658":
                return "Chỉnh sửa câu hỏi No.5-7";
            case "685d1732abd7f3cf92add65f":
                return "Chỉnh sửa câu hỏi No.8-10";
            case "685d1744abd7f3cf92add666":
                return "Chỉnh sửa câu hỏi No.11";
            case "685d1761abd7f3cf92add66d":
                return "Chỉnh sửa câu hỏi No.1-5";
            case "685d1773abd7f3cf92add674":
                return "Chỉnh sửa câu hỏi No.6-7";
            case "685d178babd7f3cf92add67b":
                return "Chỉnh sửa câu hỏi No.8";
            default:
                return "Chỉnh sửa câu hỏi";
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="xl"
            centered
            backdrop="static"
            keyboard={false}
            className="zoom"
        >
            <Modal.Header closeButton className="bg-warning text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faEdit} className="text-primary me-2" />
                    {getModalTitle()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {renderQuestionEditComponent()}
            </Modal.Body>
        </Modal>
    );
};

export default EditQuestionModal;
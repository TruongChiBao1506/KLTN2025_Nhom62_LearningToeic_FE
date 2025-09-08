import React from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

// Import tất cả các QuestionAdd components
import QuestionAddSection1 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection1';
import QuestionAddSection2 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection2';
import QuestionAddSection3 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection3';
import QuestionAddSection4 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection4';
import QuestionAddSection5 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection5';
import QuestionAddSection6 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection6';
import QuestionAddSection7Single from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_1';
import QuestionAddSection7Double from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_2';
import QuestionAddSection7Triple from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddSection7_3';
import QuestionAddNo1To2 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo1To2';
import QuestionAddNo3To4 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo3To4';
import QuestionAddNo5To7 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo5To7';
import QuestionAddNo8To10 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo8To10';
import QuestionAddNo11 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo11';
import QuestionAddNo1To5 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo1To5';
import QuestionAddNo6To7 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo6To7';
import QuestionAddNo8 from '../../../../pages/Admin/QuestionBySection/QuestionAdd/QuestionAddNo8';

const AddQuestionModal = ({ show, onHide, sectionId, retrieveQuestions }) => {
    const renderQuestionAddComponent = () => {
        switch (sectionId) {
            case "686ce171b614dda1fc08f1d0":
                return (
                    <QuestionAddSection1
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d1":
                return (
                    <QuestionAddSection2
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d2":
                return (
                    <QuestionAddSection3
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d3":
                return (
                    <QuestionAddSection4
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d4":
                return (
                    <QuestionAddSection5
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d5":
                return (
                    <QuestionAddSection6
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "686ce171b614dda1fc08f1d6":
                return (
                    <QuestionAddSection7Single
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d10f3abd7f3cf92add620":
                return (
                    <QuestionAddSection7Double
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d12f0abd7f3cf92add643":
                return (
                    <QuestionAddSection7Triple
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d16f6abd7f3cf92add64a":
                return (
                    <QuestionAddNo1To2
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d170eabd7f3cf92add651":
                return (
                    <QuestionAddNo3To4
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1721abd7f3cf92add658":
                return (
                    <QuestionAddNo5To7
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1732abd7f3cf92add65f":
                return (
                    <QuestionAddNo8To10
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1744abd7f3cf92add666":
                return (
                    <QuestionAddNo11
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1761abd7f3cf92add66d":
                return (
                    <QuestionAddNo1To5
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d1773abd7f3cf92add674":
                return (
                    <QuestionAddNo6To7
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            case "685d178babd7f3cf92add67b":
                return (
                    <QuestionAddNo8
                        sectionId={sectionId}
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
            case "686ce171b614dda1fc08f1d0":
                return "Thêm câu hỏi Section 1";
            case "686ce171b614dda1fc08f1d1":
                return "Thêm câu hỏi Section 2";
            case "686ce171b614dda1fc08f1d2":
                return "Thêm câu hỏi Section 3";
            case "686ce171b614dda1fc08f1d3":
                return "Thêm câu hỏi Section 4";
            case "686ce171b614dda1fc08f1d4":
                return "Thêm câu hỏi Section 5";
            case "686ce171b614dda1fc08f1d5":
                return "Thêm câu hỏi Section 6";
            case "686ce171b614dda1fc08f1d6":
                return "Thêm câu hỏi Section 7 Single";
            case "685d10f3abd7f3cf92add620":
                return "Thêm câu hỏi Section 7 Double";
            case "685d12f0abd7f3cf92add643":
                return "Thêm câu hỏi Section 7 Triple";
            case "685d16f6abd7f3cf92add64a":
                return "Thêm câu hỏi No.1-2";
            case "685d170eabd7f3cf92add651":
                return "Thêm câu hỏi No.3-4";
            case "685d1721abd7f3cf92add658":
                return "Thêm câu hỏi No.5-7";
            case "685d1732abd7f3cf92add65f":
                return "Thêm câu hỏi No.8-10";
            case "685d1744abd7f3cf92add666":
                return "Thêm câu hỏi No.11";
            case "685d1761abd7f3cf92add66d":
                return "Thêm câu hỏi No.1-5";
            case "685d1773abd7f3cf92add674":
                return "Thêm câu hỏi No.6-7";
            case "685d178babd7f3cf92add67b":
                return "Thêm câu hỏi No.8";
            default:
                return "Thêm câu hỏi";
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
            style={{ overflow: 'hidden' }}
        >
            <Modal.Header closeButton className="bg-success text-white">
                <Modal.Title>
                    <FontAwesomeIcon icon={faCirclePlus} className="text-primary me-2" />
                    {getModalTitle()}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {renderQuestionAddComponent()}
            </Modal.Body>
        </Modal>
    );
};

export default AddQuestionModal;
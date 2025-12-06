import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import sectionsService from '../../../../services/sectionsService';

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
    const [section, setSection] = useState(null);
    const [sectionLoading, setSectionLoading] = useState(false);

    useEffect(() => {
        const fetchSection = async () => {
            if (!sectionId || !show) return;
            
            setSectionLoading(true);
            try {
                const response = await sectionsService.get(sectionId);
                setSection(response);
            } catch (error) {
                console.error("Error fetching section:", error);
                setSection(null);
            } finally {
                setSectionLoading(false);
            }
        };

        fetchSection();
    }, [sectionId, show]);

    const renderQuestionEditComponent = () => {
        if (sectionLoading) {
            return <div className="text-center p-4">Đang tải thông tin phần thi...</div>;
        }
        if (!section) {
            return <div className="text-center p-4 text-danger">Không tìm thấy thông tin phần thi.</div>;
        }

        // Extract part number from name
        const partMatch = section.name.match(/Part (\d+)/i);
        const partNumber = partMatch ? parseInt(partMatch[1]) : null;

        // Determine component based on type and part number
        if (section.type === 1) {  // Listening sections
            switch (partNumber) {
                case 1:
                    return (
                        <QuestionEditSection1
                            sectionId={sectionId}
                            questionId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 2:
                    return (
                        <QuestionEditSection2
                            sectionId={sectionId}
                            questionId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 3:
                    return (
                        <QuestionEditSection3
                            sectionId={sectionId}
                            groupId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 4:
                    return (
                        <QuestionEditSection4
                            sectionId={sectionId}
                            groupId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                default:
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ chỉnh sửa câu hỏi cho phần thi Listening này.</div>;
            }
        } else if (section.type === 2) {  // Reading sections
            switch (partNumber) {
                case 5:
                    return (
                        <QuestionEditSection5
                            sectionId={sectionId}
                            questionId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 6:
                    return (
                        <QuestionEditSection6
                            sectionId={sectionId}
                            groupId={questionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 7:
                    // Handle Part 7 variants based on name keywords
                    if (section.name.toLowerCase().includes("single")) {
                        return (
                            <QuestionEditSection7Single
                                sectionId={sectionId}
                                groupId={questionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else if (section.name.toLowerCase().includes("double")) {
                        return (
                            <QuestionEditSection7Double
                                sectionId={sectionId}
                                groupId={questionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else if (section.name.toLowerCase().includes("triple")) {
                        return (
                            <QuestionEditSection7Triple
                                sectionId={sectionId}
                                groupId={questionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else {
                        return (
                            <QuestionEditSection7Single
                                sectionId={sectionId}
                                groupId={questionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    }
                default:
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ chỉnh sửa câu hỏi cho phần thi Reading này.</div>;
            }
        } else if (section.type === 3) {  // Grammar sections
            const nameLower = section.name.toLowerCase();
            
            if (nameLower.includes("1") && nameLower.includes("2")) {
                return (
                    <QuestionEditNo1To2
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("3") && nameLower.includes("4")) {
                return (
                    <QuestionEditNo3To4
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("5") && nameLower.includes("7")) {
                return (
                    <QuestionEditNo5To7
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("8") && nameLower.includes("10")) {
                return (
                    <QuestionEditNo8To10
                        sectionId={sectionId}
                        groupId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("11")) {
                return (
                    <QuestionEditNo11
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ chỉnh sửa câu hỏi cho phần ngữ pháp này.</div>;
        } else if (section.type === 4) {  // Vocabulary sections
            const nameLower = section.name.toLowerCase();
            
            if (nameLower.includes("1") && nameLower.includes("5")) {
                return (
                    <QuestionEditNo1To5
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("6") && nameLower.includes("7")) {
                return (
                    <QuestionEditNo6To7
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("8")) {
                return (
                    <QuestionEditNo8
                        sectionId={sectionId}
                        questionId={questionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ chỉnh sửa câu hỏi cho phần từ vựng này.</div>;
        }

        return <div className="text-center p-4 text-warning">Không xác định được loại phần thi.</div>;
    };

    const getModalTitle = () => {
        if (!section) return "Chỉnh sửa câu hỏi";
        return `Chỉnh sửa câu hỏi - ${section.name}`;
    };

    // Keep old hardcoded version as fallback (commented out)
    const getModalTitleOld = () => {
        switch (sectionId) {
            case "686ce171b614dda1fc08f1d0":
                return "Chỉnh sửa câu hỏi Section 1";
            case "686ce171b614dda1fc08f1d1":
                return "Chỉnh sửa câu hỏi Section 2";
            case "686ce171b614dda1fc08f1d2":
                return "Chỉnh sửa câu hỏi Section 3";
            case "686ce171b614dda1fc08f1d3":
                return "Chỉnh sửa câu hỏi Section 4";
            case "686ce171b614dda1fc08f1d4":
                return "Chỉnh sửa câu hỏi Section 5";
            case "686ce171b614dda1fc08f1d5":
                return "Chỉnh sửa câu hỏi Section 6";
            case "686ce171b614dda1fc08f1d6":
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
    }; // End of old version

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
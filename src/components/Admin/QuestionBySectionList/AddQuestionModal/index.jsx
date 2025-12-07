import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import sectionsService from '../../../../services/sectionsService';

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
// Speaking components
// Speaking Add components removed - not supported
// Writing components
// Writing Add components removed - not supported

const AddQuestionModal = ({ show, onHide, sectionId, retrieveQuestions }) => {
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
    const renderQuestionAddComponent = () => {
        if (sectionLoading) {
            return <div className="text-center p-4">Đang tải thông tin phần thi...</div>;
        }
        if (!section) {
            return <div className="text-center p-4 text-danger">Không tìm thấy thông tin phần thi.</div>;
        }

        // Extract part number from name (e.g., "Part 1: Photographs" -> 1)
        const partMatch = section.name.match(/Part (\d+)/i);
        const partNumber = partMatch ? parseInt(partMatch[1]) : null;

        // Determine component based on type and part number
        if (section.type === 1) {  // Listening sections
            switch (partNumber) {
                case 1:
                    return (
                        <QuestionAddSection1
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 2:
                    return (
                        <QuestionAddSection2
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 3:
                    return (
                        <QuestionAddSection3
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 4:
                    return (
                        <QuestionAddSection4
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                default:
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi cho phần thi Listening này.</div>;
            }
        } else if (section.type === 2) {  // Reading sections
            switch (partNumber) {
                case 5:
                    return (
                        <QuestionAddSection5
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 6:
                    return (
                        <QuestionAddSection6
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                case 7:
                    // Handle Part 7 variants based on name keywords
                    if (section.name.toLowerCase().includes("single")) {
                        return (
                            <QuestionAddSection7Single
                                sectionId={sectionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else if (section.name.toLowerCase().includes("double")) {
                        return (
                            <QuestionAddSection7Double
                                sectionId={sectionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else if (section.name.toLowerCase().includes("triple")) {
                        return (
                            <QuestionAddSection7Triple
                                sectionId={sectionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    } else {
                        return (
                            <QuestionAddSection7Single
                                sectionId={sectionId}
                                retrieveQuestions={retrieveQuestions}
                                onClose={onHide}
                            />
                        );
                    }
                default:
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi cho phần thi Reading này.</div>;
            }
        } else if (section.type === 3) {  // Grammar sections hoặc Speaking sections
            const nameLower = section.name.toLowerCase();
            
            // Speaking Add components are no longer available; show fallback message
            if (nameLower.includes("speaking") || nameLower.includes("nói") || nameLower.includes("speak")) {
                return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi Speaking cho phần này.</div>;
            }
            
            // Nếu không phải Speaking, xử lý như Grammar sections
            if (nameLower.includes("1") && nameLower.includes("2")) {
                return (
                    <QuestionAddNo1To2
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("3") && nameLower.includes("4")) {
                return (
                    <QuestionAddNo3To4
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("5") && nameLower.includes("7")) {
                return (
                    <QuestionAddNo5To7
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("8") && nameLower.includes("10")) {
                return (
                    <QuestionAddNo8To10
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("11")) {
                return (
                    <QuestionAddNo11
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi cho phần này.</div>;
        } else if (section.type === 4) {  // Vocabulary sections hoặc Writing sections
            const nameLower = section.name.toLowerCase();
            
            // Kiểm tra nếu là Writing section (ưu tiên kiểm tra Writing trước)
            if (nameLower.includes("writing") || nameLower.includes("viết") || nameLower.includes("write")) {
                // Writing sections
                if (nameLower.includes("1") && nameLower.includes("5")) {
                    return (
                        <QuestionAddNo1To5
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                } else if (nameLower.includes("6") && nameLower.includes("7")) {
                    return (
                        <QuestionAddNo6To7
                            sectionId={sectionId}
                            retrieveQuestions={retrieveQuestions}
                            onClose={onHide}
                        />
                    );
                } else if (nameLower.includes("8")) {
                    return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi Writing cho phần này.</div>;
                }
                return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi Writing cho phần này.</div>;
            }
            
            // Nếu không phải Writing, xử lý như Vocabulary sections
            if (nameLower.includes("1") && nameLower.includes("5")) {
                return (
                    <QuestionAddNo1To5
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("6") && nameLower.includes("7")) {
                return (
                    <QuestionAddNo6To7
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            } else if (nameLower.includes("8")) {
                return (
                    <QuestionAddNo8
                        sectionId={sectionId}
                        retrieveQuestions={retrieveQuestions}
                        onClose={onHide}
                    />
                );
            }
            return <div className="text-center p-4 text-warning">Chưa hỗ trợ thêm câu hỏi cho phần này.</div>;
        }

        return <div className="text-center p-4 text-warning">Không xác định được loại phần thi.</div>;
    };

    const getModalTitle = () => {
        if (!section) return "Thêm câu hỏi";
        return `Thêm câu hỏi - ${section.name}`;
    };

    // Keep old hardcoded version as fallback (commented out)
    const getModalTitleOld = () => {
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
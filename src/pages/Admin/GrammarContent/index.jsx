import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import GrammarContentService from '../../../services/grammarContentService';
import GrammarContentList from '../../../components/Admin/GrammarContentList';
import '../../../assets/breadcrumb.css';

const GrammarContent = () => {
    const { grammarId } = useParams(); // Lấy grammarId từ URL params
    const [grammarContents, setGrammarContents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    useEffect(() => {
        document.title = "Nội dung bài học ngữ pháp";
    }, []);

    // Initialize AOS
    useEffect(() => {
        AOS.init({
            duration: 100,
            delay: 0,
            easing: 'ease-out',
            once: true,
            disable: 'mobile'
        });
    }, []);

    const retrieveGrammarContents = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Grammar ID:', grammarId);

            // Gọi API để lấy danh sách grammar contents dựa trên grammarId
            const result = await GrammarContentService.getGrammarContentsByGrammar(grammarId);

            console.log('🔍 Raw API response:', result);

            // Handle the correct response structure from server
            if (result && typeof result === 'object') {
                // Server returns: { grammarContents: [...], currentPage: 1, totalPages: 1, ... }
                const contents = result;

                setGrammarContents(contents);
                setPagination({
                    currentPage: result.currentPage || 1,
                    totalPages: result.totalPages || 1,
                    totalItems: result.totalItems || 0,
                    itemsPerPage: result.itemsPerPage || 10
                });

                console.log('  Grammar Contents extracted:', contents);
                console.log('  Pagination info:', {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalItems: result.totalItems,
                    itemsPerPage: result.itemsPerPage
                });
            } else if (Array.isArray(result)) {
                // Fallback: if result is directly an array
                setGrammarContents(result);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: result.length,
                    itemsPerPage: result.length || 10
                });
                console.log('  Grammar Contents (direct array):', result);
            } else {
                // Empty or null result
                setGrammarContents([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                console.log('📝 No grammar contents found');
            }

        } catch (error) {
            console.log('❌ Error fetching grammar contents:', error);

            // Check if it's a 404 (no data) vs real error
            if (error.response?.status === 404) {
                console.log('📝 Grammar chưa có contents - hiển thị empty state');
                setGrammarContents([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
                setError(null); // Don't show error for empty data
            } else {
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
                setGrammarContents([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (grammarId) {
            retrieveGrammarContents();
        }
    }, [grammarId]);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with solid colors */}
            <div
                style={{
                    background: 'var(--color-primary)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 4px 8px rgba(44, 95, 141, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 32px',
                    marginBottom: 16,
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <Breadcrumb separator={null} style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'var(--color-primary-light)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(44, 95, 141, 0.15)'
                        }}>
                            <BookOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 20 }} />
                        </span>
                        <Link to="/admin/grammar" style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginLeft: 4 }}>Bài học ngữ pháp</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'var(--color-primary-light)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(44, 95, 141, 0.15)'
                        }}>
                            <BookOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 20 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 18 }}>Nội dung ngữ pháp</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* GrammarContentList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {/* Loading State */}
                {isLoading ? (
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">
                            Đang tải dữ liệu grammar contents cho grammar {grammarId}...
                        </p>
                    </div>
                ) : (
                    /* Error State */
                    error ? (
                        <div
                            className="alert alert-danger text-center"
                            data-aos="fade-in"
                            data-aos-duration="500"
                        >
                            <BookOutlined style={{ color: '#d32f2f', fontSize: 22, marginBottom: 8 }} />
                            <h5>Lỗi tải dữ liệu</h5>
                            <p>{error}</p>
                            <button
                                className="btn btn-outline-danger"
                                onClick={retrieveGrammarContents}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        /* Grammar Content List */
                        <GrammarContentList
                            grammarContents={grammarContents}
                            grammarId={grammarId}
                            retrieveGrammarContents={retrieveGrammarContents}
                            isLoading={isLoading}
                            pagination={pagination}
                        />
                    )
                )}
            </div>
        </div>
    );
};

export default GrammarContent;
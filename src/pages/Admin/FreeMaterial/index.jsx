import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import FreeMaterialList from '../../../components/Admin/FreeMaterialList';
import FreeMaterialService from '../../../services/freeMaterialService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './style.css';

const FreeMaterial = () => {
    const [freeMaterials, setFreeMaterials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Free Material";
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

    const retrieveFreeMaterials = async () => {
        try {
            setIsLoading(true);
            const data = await FreeMaterialService.all();
            console.log(data);

            // Handle response structure
            if (data && Array.isArray(data)) {
                setFreeMaterials(data);
            } else if (data && data.freeMaterials && Array.isArray(data.freeMaterials)) {
                setFreeMaterials(data.freeMaterials);
            } else {
                setFreeMaterials([]);
            }
        } catch (error) {
            console.log(error);
            setFreeMaterials([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        retrieveFreeMaterials();
    }, []);

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 shadow-lg rounded-4 px-2 py-1"
                style={{
                    background: 'linear-gradient(90deg, #e0eaff 0%, #f8fbff 100%)',
                    minHeight: 70,
                    border: 'none'
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator d-flex align-items-center mb-0" style={{ gap: 16 }}>
                        <li className="current d-flex align-items-center">
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                                    borderRadius: '50%',
                                    width: 40,
                                    height: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                                }}
                            >
                                <FontAwesomeIcon icon={faLayerGroup} color="var(--color-bg-primary)" />
                            </span>
                            <span className="fw-bold" style={{ color: '#4f8cff', fontSize: 22 }}>
                                Free Material
                            </span>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* FreeMaterialList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="200"
            >
                {isLoading ? (
                    <div
                        className="text-center py-5"
                        data-aos="zoom-in"
                        data-aos-duration="600"
                    >
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Đang tải dữ liệu free materials...</p>
                    </div>
                ) : (
                    <FreeMaterialList
                        freeMaterials={freeMaterials}
                        retrieveFreeMaterials={retrieveFreeMaterials}
                    />
                )}
            </div>
        </div>
    );
};

export default FreeMaterial;
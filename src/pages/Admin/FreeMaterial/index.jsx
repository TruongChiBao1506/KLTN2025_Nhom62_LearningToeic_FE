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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
            {/* Breadcrumb with AOS */}
            <div
                className="mt-2 bg-white shadow-lg rounded-1"
                data-aos="fade-down"
                data-aos-duration="800"
                data-aos-delay="100"
            >
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faLayerGroup} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Free Material
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* FreeMaterialList with AOS */}
            <div
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-delay="400"
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
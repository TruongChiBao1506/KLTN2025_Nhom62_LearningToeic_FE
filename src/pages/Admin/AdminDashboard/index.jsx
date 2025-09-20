import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faFolderOpen,
    faComments,
    faFile
} from '@fortawesome/free-solid-svg-icons';
import Highcharts from 'highcharts';


import AOS from 'aos';
import 'aos/dist/aos.css';

// Import services
import userService from '../../../services/userService';
import examService from '../../../services/examService';
import feedbackService from '../../../services/feedbackService';
import freeMaterialService from '../../../services/freeMaterialService';
import userExamService from '../../../services/userExamService';
import './style.css';

const Dashboard = () => {
    // State for counters
    const [countLearners, setCountLearners] = useState(0);
    const [countExams, setCountExams] = useState(0);
    const [countFeedbacks, setCountFeedbacks] = useState(0);
    const [countFreeMaterials, setCountFreeMaterials] = useState(0);

    // State for chart data
    const [statisticExamByExamName, setStatisticExamByExamName] = useState({});
    const [statisticExamByDate, setStatisticExamByDate] = useState({});
    const [statisticRatePercentages, setStatisticRatePercentages] = useState({});

    // Loading states
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Admin - Dashboard";
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

    // Fetch all counter data
    const fetchCounters = async () => {
        try {
            const [learners, exams, feedbacks, materials] = await Promise.all([
                countAllLearners(),
                countTotalExams(),
                countTotalFeedbacks(),
                countTotalFreeMaterials()
            ]);

            setCountLearners(learners);
            setCountExams(exams);
            setCountFeedbacks(feedbacks);
            setCountFreeMaterials(materials);
        } catch (error) {
            console.error('Error fetching counters:', error);
        }
    };

    // Individual counter functions
    const countAllLearners = async () => {
        try {
            const result = await userService.countLearners();
            console.log('Count learners result:', result.learnerCount);
            const count = result.learnerCount || 0;
            return count;
        } catch (error) {
            console.error('Error counting learners:', error);
            return 0;
        }
    };

    const countTotalExams = async () => {
        try {
            const result = await examService.countTotalExams();
            const count = result || 0;
            console.log('Count exams:', count);
            return count;
        } catch (error) {
            console.error('Error counting exams:', error);
            return 0;
        }
    };

    const countTotalFeedbacks = async () => {
        try {
            const result = await feedbackService.countTotalFeedbacks();
            console.log('Count feedbacks result:', result.data);
            const count = result || 0;
            return count.data;
        } catch (error) {
            console.error('Error counting feedbacks:', error);
            return 0;
        }
    };

    const countTotalFreeMaterials = async () => {
        try {
            const result = await freeMaterialService.countTotalFreeMaterials();
            const count = result || 0;
            console.log('Count free materials:', count);
            return count;
        } catch (error) {
            console.error('Error counting free materials:', error);
            return 0;
        }
    };

    // Chart functions
    const getTotalExamCountsByExamNameAndType = async () => {
        try {
            const result = await userExamService.getTotalExamCountsByExamNameAndType();
            console.log('Result from getTotalExamCountsByExamNameAndType:', result);
            const data = result;

            setStatisticExamByExamName(data);
            console.log('Exam statistics by name:', data);

            const columnChartData = Object.keys(data || {}).map((examName) => {
                const statistic = data[examName];
                return {
                    name: examName || 'N/A',
                    y: Number(statistic) || 0,
                };
            });

            setTimeout(() => {
                const columnChartContainer = document.querySelector("#columnChartContainer");
                if (columnChartContainer) {
                    Highcharts.chart(columnChartContainer, {
                        chart: {
                            type: 'column',
                            backgroundColor: 'transparent',
                            height: 350,
                            style: {
                                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                            }
                        },
                        title: {
                            text: 'Thống kê tổng số lượt tham gia từng bài thi FULL TEST',
                            style: {
                                color: '#333',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }
                        },
                        xAxis: {
                            categories: columnChartData.map((item) => item.name),
                            gridLineWidth: 0,
                            lineWidth: 0,
                            tickWidth: 0,
                            labels: {
                                style: {
                                    color: '#666',
                                    fontSize: '13px'
                                }
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Số lượt tham gia',
                                style: {
                                    color: '#666',
                                    fontSize: '13px'
                                }
                            },
                            gridLineWidth: 1,
                            gridLineColor: '#f0f0f0',
                            labels: {
                                style: {
                                    color: '#666',
                                    fontSize: '12px'
                                }
                            }
                        },
                        plotOptions: {
                            column: {
                                borderRadius: 10,
                                borderWidth: 0,
                                pointPadding: 0.1,
                                groupPadding: 0.15,
                                colorByPoint: true
                            }
                        },
                        colors: [
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [[0, '#4f8cff'], [1, '#a6c1ee']]
                            },
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [[0, '#43e97b'], [1, '#38f9d7']]
                            },
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                stops: [[0, '#fa709a'], [1, '#fee140']]
                            }
                        ],
                        series: [{
                            name: 'Số lượt tham gia',
                            data: columnChartData.map((item) => item.y),
                            dataLabels: {
                                enabled: true,
                                style: {
                                    color: '#333',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }
                            }
                        }],
                        legend: {
                            enabled: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            style: {
                                color: '#fff',
                                fontSize: '13px'
                            },
                            borderWidth: 0,
                            borderRadius: 10
                        },
                        accessibility: {
                            enabled: false
                        }
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Error getting exam statistics:', error);
        }
    };

    const getDailyExamCounts = async () => {
        try {
            const result = await userExamService.getDailyExamCounts();
            const data = result?.success ? result.data : result;

            setStatisticExamByDate(data);
            console.log('Daily exam counts:', data);

            // Create chart data
            const lineChartData = Object.keys(data || {}).map((date) => {
                const statistic = data[date];
                return {
                    date: date || 'N/A',
                    y: Number(statistic) || 0,
                };
            });

            // Create line chart
            setTimeout(() => {
                const lineChartContainer = document.querySelector("#lineChartContainer");
                if (lineChartContainer) {
                    Highcharts.chart(lineChartContainer, {
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: 'Thống kê tổng số lượt thi hằng ngày'
                        },
                        xAxis: {
                            categories: lineChartData.map((item) => item.date)
                        },
                        yAxis: {
                            title: {
                                text: 'Participants'
                            }
                        },
                        series: [{
                            name: 'Participants',
                            data: lineChartData.map((item) => item.y),
                            color: '#17a2b8'
                        }],
                        accessibility: {
                            enabled: false
                        }
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Error getting daily exam counts:', error);
        }
    };

    const getFeedbackPercentagesByRating = async () => {
        try {
            const result = await feedbackService.getFeedbackPercentagesByRating();
            const data = result?.success ? result.data : result;

            setStatisticRatePercentages(data);
            console.log('Feedback percentages:', data);

            // Create chart data
            const pieChartData = Object.keys(data || {}).map((rate) => {
                const percentage = data[rate];
                return {
                    name: `Đánh giá ${rate} ⭐`,
                    y: Number(percentage) || 0,
                };
            });

            // Create pie chart
            setTimeout(() => {
                const pieChartContainer = document.querySelector("#pieChartContainer");
                if (pieChartContainer) {
                    Highcharts.chart(pieChartContainer, {
                        chart: {
                            type: 'pie',
                            backgroundColor: 'transparent',
                            height: 350,
                            style: {
                                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                            }
                        },
                        title: {
                            text: 'Thống kê tỉ lệ đánh giá hệ thống',
                            style: {
                                color: '#333',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                    style: {
                                        color: '#333',
                                        fontSize: '13px',
                                        fontWeight: 'bold'
                                    }
                                },
                                showInLegend: true,
                                borderWidth: 2,
                                borderColor: '#fff'
                            }
                        },
                        colors: [
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                                stops: [[0, '#4f8cff'], [1, '#a6c1ee']]
                            },
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                                stops: [[0, '#43e97b'], [1, '#38f9d7']]
                            },
                            {
                                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                                stops: [[0, '#fa709a'], [1, '#fee140']]
                            }
                        ],
                        series: [{
                            name: 'Tỉ lệ %',
                            data: pieChartData,
                            colorByPoint: true
                        }],
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom',
                            itemStyle: {
                                color: '#666',
                                fontSize: '13px'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            style: {
                                color: '#fff',
                                fontSize: '13px'
                            },
                            borderWidth: 0,
                            borderRadius: 10,
                            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        accessibility: {
                            enabled: false
                        }
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Error getting feedback percentages:', error);
        }
    };

    // Main useEffect
    useEffect(() => {
        const initializeDashboard = async () => {
            setIsLoading(true);
            try {
                await fetchCounters();
                await Promise.all([
                    getTotalExamCountsByExamNameAndType(),
                    getDailyExamCounts(),
                    getFeedbackPercentagesByRating()
                ]);
            } catch (error) {
                console.error('Error initializing dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeDashboard();
    }, []);

    // Toggle effect function (if needed)
    const toggleEffect = () => {
        console.log('Card clicked');
    };

    return (
        <div data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
            {/* Breadcrumb Ant Design + Gradient */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
                    minHeight: 70,
                    border: 'none',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 32px',
                    marginBottom: 16,
                }}
                data-aos="fade-down"
                data-aos-duration="400"
                data-aos-delay="50"
            >
                <Breadcrumb separator={null} style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>
                    <Breadcrumb.Item>
                        <span style={{
                            background: 'linear-gradient(135deg, #4f8cff 60%, #a6c1ee 100%)',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            boxShadow: '0 2px 8px rgba(80,120,255,0.10)'
                        }}>
                            <HomeOutlined style={{ color: '#fff', fontSize: 22 }} />
                        </span>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>Dashboard</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="admin-dashboard-body">
                <div className="admin-dashboard-dashboard-bg">
                    {/* Statistics Cards */}
                    <div className="row g-4 mb-4">
                        {/* Card 1 - Learners */}
                        <div
                            className="col-md-3 col-6"
                            data-aos="fade-right"
                            data-aos-delay="100"
                        >
                            <div
                                className="admin-dashboard-dashboard-card admin-dashboard-stat-card admin-dashboard-stat-blue"
                                onClick={toggleEffect}
                            >
                                <div className="admin-dashboard-stat-icon">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <div>
                                    <div className="admin-dashboard-stat-label">Tổng số học viên</div>
                                    <div className="admin-dashboard-stat-value">
                                        {isLoading ? '...' : countLearners}
                                    </div>
                                    <div className="admin-dashboard-font-13 admin-dashboard-text-success">+2 từ tuần trước</div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 - Exams */}
                        <div
                            className="col-md-3 col-6"
                            data-aos="fade-right"
                            data-aos-delay="200"
                        >
                            <div className="admin-dashboard-dashboard-card admin-dashboard-stat-card admin-dashboard-stat-green">
                                <div className="admin-dashboard-stat-icon">
                                    <FontAwesomeIcon icon={faFolderOpen} />
                                </div>
                                <div>
                                    <div className="admin-dashboard-stat-label">Tổng số bài thi</div>
                                    <div className="admin-dashboard-stat-value">
                                        {isLoading ? '...' : countExams}
                                    </div>
                                    <div className="admin-dashboard-font-13 admin-dashboard-text-success">+2 từ tuần trước</div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 - Feedbacks */}
                        <div
                            className="col-md-3 col-6"
                            data-aos="fade-right"
                            data-aos-delay="300"
                        >
                            <div className="admin-dashboard-dashboard-card admin-dashboard-stat-card admin-dashboard-stat-pink">
                                <div className="admin-dashboard-stat-icon">
                                    <FontAwesomeIcon icon={faComments} />
                                </div>
                                <div>
                                    <div className="admin-dashboard-stat-label">Tổng số đánh giá</div>
                                    <div className="admin-dashboard-stat-value">
                                        {isLoading ? '...' : countFeedbacks}
                                    </div>
                                    <div className="admin-dashboard-font-13 admin-dashboard-text-danger">+5 từ tuần trước</div>
                                </div>
                            </div>
                        </div>

                        {/* Card 4 - Free Materials */}
                        <div
                            className="col-md-3 col-6"
                            data-aos="fade-right"
                            data-aos-delay="400"
                        >
                            <div className="admin-dashboard-dashboard-card admin-dashboard-stat-card admin-dashboard-stat-yellow">
                                <div className="admin-dashboard-stat-icon">
                                    <FontAwesomeIcon icon={faFile} />
                                </div>
                                <div>
                                    <div className="admin-dashboard-stat-label">Tổng số tài liệu</div>
                                    <div className="admin-dashboard-stat-value">
                                        {isLoading ? '...' : countFreeMaterials}
                                    </div>
                                    <div className="admin-dashboard-font-13 admin-dashboard-text-warning">+2 từ tuần trước</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="row g-4">
                        {/* Column Chart */}
                        <div
                            className="col-md-6"
                            data-aos="fade-up"
                            data-aos-delay="600"
                        >
                            <div className="admin-dashboard-card admin-dashboard-custom-card admin-dashboard-border admin-dashboard-border-0 admin-dashboard-shadow-lg admin-dashboard-rounded-4">
                                <div className="admin-dashboard-card-body admin-dashboard-custom-card-body-special">
                                    <div id="columnChartContainer"></div>
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div
                            className="col-md-6"
                            data-aos="fade-up"
                            data-aos-delay="700"
                        >
                            <div className="admin-dashboard-card admin-dashboard-custom-card admin-dashboard-border admin-dashboard-border-0 admin-dashboard-shadow-lg admin-dashboard-rounded-4">
                                <div className="admin-dashboard-card-body admin-dashboard-custom-card-body-special">
                                    <div id="pieChartContainer"></div>
                                </div>
                            </div>
                        </div>

                        {/* Line Chart */}
                        <div
                            className="col-md-12"
                            data-aos="fade-up"
                            data-aos-delay="800"
                        >
                            <div className="admin-dashboard-card admin-dashboard-custom-card admin-dashboard-border admin-dashboard-border-0 admin-dashboard-shadow-lg admin-dashboard-rounded-4">
                                <div className="admin-dashboard-card-body admin-dashboard-custom-card-body-special">
                                    <div id="lineChartContainer"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="admin-dashboard-loading-spinner"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
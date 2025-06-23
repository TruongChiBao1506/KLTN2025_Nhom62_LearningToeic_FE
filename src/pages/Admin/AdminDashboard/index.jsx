import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
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
            duration: 150,
            delay: 0,
            easing: 'ease-in-out',
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
            const count = result.totalExams;
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
            console.log('Count feedbacks result:', result);
            const count = result.success ? result.data : result;
            return count;
        } catch (error) {
            console.error('Error counting feedbacks:', error);
            return 0;
        }
    };

    const countTotalFreeMaterials = async () => {
        try {
            const result = await freeMaterialService.countTotalFreeMaterials();
            const count = result.success ? result.data : result;
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
            const data = result?.success ? result.data : result;

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
                            type: 'column'
                        },
                        title: {
                            text: 'Thống kê tổng số lượt tham gia từng bài thi FULL TEST'
                        },
                        xAxis: {
                            categories: columnChartData.map((item) => item.name)
                        },
                        yAxis: {
                            title: {
                                text: 'Participants'
                            }
                        },
                        series: [{
                            name: 'Participants',
                            data: columnChartData.map((item) => item.y),
                            color: '#17a2b8'
                        }],
                        // ✅ Tắt accessibility thay vì bật
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
                        },
                        title: {
                            text: 'Thống kê tỉ lệ đánh giá hệ thống',
                        },
                        series: [{
                            name: 'Tỉ lệ %',
                            data: pieChartData,
                            colorByPoint: true
                        }],
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
        <div data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
            {/* Breadcrumb */}
            <div className="mt-2 bg-white shadow-lg rounded-1">
                <nav>
                    <ol className="cd-breadcrumb custom-separator">
                        <li className="current">
                            <FontAwesomeIcon icon={faHouse} />
                            <button className="btn btn-link text-decoration-none fw-bolder">
                                Dash Board
                            </button>
                        </li>
                    </ol>
                </nav>
            </div>

            <div className="mt-3">
                {/* Statistics Cards */}
                <div className="row">
                    {/* Card 1 - Learners */}
                    <div className="col-md-3">
                        <div
                            className="card radius-10 border-start border-0 border-3 border-info card-with-effect"
                            onClick={toggleEffect}
                        >
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <p className="mb-0 text-secondary">Tổng số học viên</p>
                                        <h4 className="my-1 text-info">
                                            {isLoading ? '...' : countLearners}
                                        </h4>
                                        <p className="mb-0 font-13">+2 từ tuần trước</p>
                                    </div>
                                    <div className="widgets-icons-2 rounded-circle bg-gradient-scooter text-white ms-auto">
                                        <FontAwesomeIcon icon={faUsers} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - Exams */}
                    <div className="col-md-3">
                        <div className="card radius-10 border-start border-0 border-3 border-success card-with-effect">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <p className="mb-0 text-secondary">Tổng số bài thi</p>
                                        <h4 className="my-1 text-success">
                                            {isLoading ? '...' : countExams}
                                        </h4>
                                        <p className="mb-0 font-13">+2 từ tuần trước</p>
                                    </div>
                                    <div className="widgets-icons-2 rounded-circle bg-gradient-ohhappiness text-white ms-auto">
                                        <FontAwesomeIcon icon={faFolderOpen} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 - Feedbacks */}
                    <div className="col-md-3">
                        <div className="card radius-10 border-start border-0 border-3 border-danger card-with-effect">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <p className="mb-0 text-secondary">Tổng số đánh giá</p>
                                        <h4 className="my-1 text-danger">
                                            {isLoading ? '...' : countFeedbacks}
                                        </h4>
                                        <p className="mb-0 font-13">+5 từ tuần trước</p>
                                    </div>
                                    <div className="widgets-icons-2 rounded-circle bg-gradient-bloody text-white ms-auto">
                                        <FontAwesomeIcon icon={faComments} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4 - Free Materials */}
                    <div className="col-md-3">
                        <div className="card radius-10 border-start border-0 border-3 border-warning card-with-effect">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div>
                                        <p className="mb-0 text-secondary">Tổng số tài liệu</p>
                                        <h4 className="my-1 text-warning">
                                            {isLoading ? '...' : countFreeMaterials}
                                        </h4>
                                        <p className="mb-0 font-13">+2 từ tuần trước</p>
                                    </div>
                                    <div className="widgets-icons-2 rounded-circle bg-gradient-blooker text-white ms-auto">
                                        <FontAwesomeIcon icon={faFile} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="row">
                    {/* Column Chart */}
                    <div className="col-md-6">
                        <div className="card mb-4 custom-card border border-0">
                            <div className="card-body custom-card-body-special">
                                <div id="columnChartContainer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="col-md-6">
                        <div className="card mb-4 custom-card border border-0">
                            <div className="card-body custom-card-body-special">
                                <div id="pieChartContainer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="col-md-12">
                        <div className="card mb-4 custom-card border border-0">
                            <div className="card-body custom-card-body-special">
                                <div id="lineChartContainer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
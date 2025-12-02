import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Card,
    Button,
    Result,
    Spin,
    Typography,
    Row,
    Col,
    Space,
    Progress,
    Statistic,
    List,
    Modal,
    Form,
    Slider,
    Checkbox,
    message,
    Alert,
    Tabs,
    Badge,
    Timeline,
    Select,
    DatePicker as AntdDatePicker
} from 'antd';
import {
    BookOutlined,
    PlusOutlined,
    DashboardOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    FireOutlined,
    BulbOutlined,
    CalendarOutlined,
    RocketOutlined,
    StarOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import '../../../assets/css/aiLearningPath.css';
import useAILearningPath from '../../../hooks/useAILearningPath';

// Style constants
const loadingBoxStyle = {
    minWidth: 320,
    minHeight: 220,
    background: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    boxShadow: '0 12px 48px 0 rgba(24,144,255,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '36px 24px',
    gap: 20,
};
const loadingOuterStyle = {
    minHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fbff 0%, #e6f0ff 100%)',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(24,144,255,0.10)',
    margin: '48px auto',
    maxWidth: 480,
    width: '100%',
};
const inputStyle = {
    width: '100%',
    borderRadius: 8,
    border: '1.5px solid #1890ff',
    padding: '10px 14px',
    fontSize: 15,
    outline: 'none',
    transition: 'border 0.2s',
    boxShadow: '0 2px 8px rgba(24,144,255,0.04)'
};

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const LearningPathPage = () => {
    // Get user data từ localStorage với fallback options
    const getUserData = () => {
        try {
            // Thử các key khác nhau cho userData
            let userData = localStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                return { id: parsed.id || parsed._id, ...parsed };
            }

            // Thử learnerUser
            userData = localStorage.getItem('learnerUser');
            if (userData) {
                const parsed = JSON.parse(userData);
                return { id: parsed.id || parsed._id, ...parsed };
            }

            // Thử user
            userData = localStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                return { id: parsed.id || parsed._id, ...parsed };
            }

            return {};
        } catch (error) {
            console.error('Error parsing user data:', error);
            return {};
        }
    };

    const userData = getUserData();
    const userId = userData.id;

    // Set page title
    useEffect(() => {
        document.title = 'Lộ trình học tập AI | TOEIC Learning Platform';
        return () => {
            document.title = 'TOEIC Admin'; // Reset title khi rời khỏi trang
        };
    }, []);

    console.log('User data:', userData, 'User ID:', userId);

    // Use AI Learning Path hook
    const {
        learningPaths,
        currentPath,
        loading,
        error,
        createLearningPath,
        createQuickPath,
        updateActivityProgress,
        analyzeProgress,
        deleteLearningPath,
        setCurrentPath,
        setLearningPaths,
        hasLearningPaths,
        currentPathProgress
    } = useAILearningPath(userId);

        const [activeTab, setActiveTab] = useState('dashboard');
        const [showCreateModal, setShowCreateModal] = useState(false);
        const [createForm] = Form.useForm();
        const [startDate, setStartDate] = useState(null);

    useEffect(() => {
        if (learningPaths && learningPaths.length > 0) {
            console.log('=== LỘ TRÌNH HỌC TẬP ĐƯỢC LOAD ===');
            console.log('Tất cả lộ trình:', learningPaths);
            console.log('Lộ trình hiện tại:', currentPath);
            console.log('Tiến độ lộ trình hiện tại:', currentPathProgress);
            console.log('=====================================');
        } else if (!loading) {
            console.log('Không có lộ trình học tập nào được tìm thấy');
        }
    }, [learningPaths, currentPath, currentPathProgress, loading]);

    // Handle Quick Path Creation
    const handleQuickPathCreate = async () => {
        if (!userId) {
            message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            console.error('No userId found for quick path creation');
            return;
        }

        try {
            console.log('Creating quick path for userId:', userId);
            // Thêm ngày bắt đầu mặc định là ngày hôm nay
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            await createQuickPath({ startDate: today });
            setActiveTab('dashboard');
        } catch (error) {
            console.error('Error creating quick path:', error);
        }
    };

    // Handle Custom Path Creation
    const handleCustomPathCreate = async (values) => {
        if (!userId) {
            message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            console.error('No userId found for custom path creation');
            return;
        }
        try {
            console.log('Creating custom path for userId:', userId, 'with values:', values);
            // Chuyển đổi startDate từ dayjs sang string YYYY-MM-DD nếu có
            if (values.startDate) {
                values.startDate = dayjs(values.startDate).format('YYYY-MM-DD');
            }
            await createLearningPath(values);
            setShowCreateModal(false);
            createForm.resetFields();
            setActiveTab('dashboard');
        } catch (error) {
            console.error('Error creating custom path:', error);
        }
    };

    // Handle Activity Progress Update
    const handleActivityComplete = async (activityId, isCompleted) => {
        if (!currentPath) return;

        try {
            console.log('Completing activity:', {
                pathId: currentPath._id,
                activityId,
                isCompleted
            });

            // Update local state immediately (optimistic update)
            const updatedPath = { ...currentPath };
            let activityFound = false;

            if (updatedPath.weeklySchedule) {
                updatedPath.weeklySchedule = updatedPath.weeklySchedule.map(week => ({
                    ...week,
                    days: week.days.map(day => ({
                        ...day,
                        activities: day.activities.map(activity => {
                            if (activity._id === activityId) {
                                activityFound = true;
                                return { ...activity, isCompleted };
                            }
                            return activity;
                        })
                    }))
                }));

                // Recalculate progress
                let completedCount = 0;
                let totalCount = 0;

                updatedPath.weeklySchedule.forEach(week => {
                    week.days.forEach(day => {
                        day.activities.forEach(activity => {
                            totalCount++;
                            if (activity.isCompleted) completedCount++;
                        });
                    });
                });

                updatedPath.progress = {
                    ...updatedPath.progress,
                    completedActivities: completedCount,
                    totalActivities: totalCount
                };

                console.log('Updated progress:', {
                    completedActivities: completedCount,
                    totalActivities: totalCount,
                    percentage: Math.round((completedCount / totalCount) * 100)
                });

                // Persist progress to localStorage to survive page reloads
                try {
                    const progressKey = `learningPath_${currentPath._id}_progress`;
                    const progressData = {
                        completedActivities: completedCount,
                        totalActivities: totalCount,
                        weeklySchedule: updatedPath.weeklySchedule,
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(progressKey, JSON.stringify(progressData));
                    console.log('Progress saved to localStorage:', progressKey);
                } catch (storageError) {
                    console.warn('Failed to save progress to localStorage:', storageError);
                }
            }

            if (activityFound) {
                // Update current path
                setCurrentPath(updatedPath);

                // Update in learning paths list
                setLearningPaths(prev =>
                    prev.map(path =>
                        path._id === currentPath._id
                            ? updatedPath
                            : path
                    )
                );



                // Try to sync with backend in background (optional)
                try {
                    await updateActivityProgress(currentPath._id, {
                        activityId,
                        completed: isCompleted,
                        completedAt: isCompleted ? new Date().toISOString() : null
                    });
                    console.log('Backend sync successful');
                } catch (backendError) {
                    console.warn('Backend sync failed, but local state is already updated:', backendError);
                    // Don't show error to user since UI already updated successfully
                }
            }

        } catch (error) {
            console.error('Error updating activity:', error);
            message.error('Không thể cập nhật hoạt động. Vui lòng thử lại.');
        }
    };

    // Handle Path Deletion
    const handleDeletePath = (pathId) => {
        confirm({
            title: 'Xóa lộ trình học tập?',
            content: 'Bạn có chắc chắn muốn xóa lộ trình này? Hành động này không thể hoàn tác.',
            icon: <ExclamationCircleOutlined />,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteLearningPath(pathId);
                    // Đã có message.success trong hook, không cần thông báo ở đây nữa
                } catch (error) {
                    console.error('Error deleting path:', error);
                }
            }
        });
    };

    // Handle Progress Analysis
    const handleAnalyzeProgress = async () => {
        if (!currentPath) return;
        try {
            const analysis = await analyzeProgress(currentPath._id);
            console.log('AI analysis response from backend:', analysis);
            // Ưu tiên lấy analysis.analysis hoặc analysis.insights nếu có
            const aiData =
                analysis?.analysis ||
                analysis?.insights ||
                analysis?.data?.analysis ||
                analysis?.data?.insights ||
                analysis;
            console.log('AI analysis data used for aiInsights:', aiData);
            setCurrentPath(prev => ({ ...(prev || {}), aiInsights: { ...aiData } }));
            Modal.success({
                title: 'Phân tích AI thành công',
                content: 'AI đã phân tích tiến độ học tập của bạn. Kéo xuống để xem chi tiết phân tích.',
                okText: 'Xem phân tích',
                onOk: () => {
                    // Scroll đến dashboard phân tích AI
                    const dashboard = document.getElementById('ai-learning-path-dashboard');
                    if (dashboard) {
                        dashboard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                },
            });
        } catch (error) {
            console.error('Error analyzing progress:', error);
        }
    };


    // Loading Component
    const Loading = React.memo(() => (
        <div className="ai-learning-path-loading" style={loadingOuterStyle}>
            <div style={loadingBoxStyle}>
                <Spin size="large" style={{ marginBottom: 10, fontSize: 40, color: 'var(--color-primary)' }} />
                <p style={{
                    fontSize: 20,
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: 1.1,
                    textShadow: '0 2px 8px #e6f0ff',
                    fontFamily: 'Segoe UI, Arial, sans-serif',
                }}>
                    Đang tải dữ liệu...
                </p>
            </div>
        </div>
    ));

    // Empty State Component
    const EmptyState = React.memo(() => (
        <div className="ai-learning-path-empty">
            <Result
                icon={<BookOutlined style={{ color: 'var(--color-primary)' }} />}
                title="Chưa có lộ trình học tập nào"
                subTitle="Hãy tạo lộ trình học tập AI đầu tiên để bắt đầu hành trình TOEIC của bạn!"
                extra={[
                    <Button
                        key="quick"
                        type="primary"
                        icon={<RocketOutlined />}
                        onClick={handleQuickPathCreate}
                        loading={loading}
                        size="large"
                    >
                        Tạo lộ trình nhanh 4 tuần
                    </Button>,
                    <Button
                        key="custom"
                        icon={<PlusOutlined />}
                        onClick={() => setShowCreateModal(true)}
                        size="large"
                    >
                        Tạo lộ trình tùy chỉnh
                    </Button>
                ]}
            />
        </div>
    ));

    // Dashboard Component
    const [showAllDays, setShowAllDays] = useState(false);
    const LearningPathDashboard = () => {
        if (!hasLearningPaths) {
            return <EmptyState />;
        }

        // Lấy ngày bắt đầu lộ trình
        const pathStartDate = currentPath?.startDate ? dayjs(currentPath.startDate) : null;
        const today = dayjs();
        const disableAllCheckbox = pathStartDate && today.isBefore(pathStartDate, 'day');

        return (
            <div className="ai-learning-path-dashboard" id="ai-learning-path-dashboard">
                <Row gutter={[24, 24]}>
                    {/* Current Path Overview */}
                    {currentPath && (
                        <Col span={24}>
                            <Card className="current-path-card">
                                <div className="current-path-header">
                                    <div>
                                        <Title level={4}>
                                            <TrophyOutlined /> {currentPath.title}
                                        </Title>
                                        <Text type="secondary">
                                            Mục tiêu: {currentPath.targetScore} điểm |
                                            Thời gian: {currentPath.estimatedDuration || currentPath.duration} tuần
                                        </Text>
                                    </div>
                                    <Space>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<BulbOutlined />}
                                            onClick={handleAnalyzeProgress}
                                            loading={loading}
                                            style={{
                                                background: 'linear-gradient(90deg, #1890ff 0%, #36cfc9 100%)',
                                                border: 'none',
                                                color: 'var(--color-bg-primary)',
                                                fontWeight: 700,
                                                boxShadow: '0 4px 16px rgba(24,144,255,0.18)',
                                                letterSpacing: 0.5,
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            Phân tích AI
                                        </Button>
                                    </Space>
                                </div>

                                <div className="progress-section">
                                    <Progress
                                        percent={currentPathProgress}
                                        strokeColor={{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }}
                                        format={percent => `${Math.round(percent)}%`}
                                    />
                                    <Text>Tiến độ hoàn thành: {Math.round(currentPathProgress)}%</Text>
                                </div>

                                {/* Current Week Activities */}
                                {currentPath.weeklySchedule && currentPath.weeklySchedule.length > 0 && (
                                    <div className="week-activities">
                                        <Title level={5}>
                                            <CalendarOutlined /> Hoạt động tuần hiện tại
                                        </Title>
                                        {(() => {
                                            const todayDate = dayjs().format('YYYY-MM-DD');

                                            // Tìm tuần chứa ngày hôm nay trước, nếu không có thì dùng logic cũ
                                            let weekData = null;

                                            // Ưu tiên tìm tuần có chứa ngày hôm nay
                                            weekData = currentPath.weeklySchedule.find(week =>
                                                week.days && week.days.some(day => day.date === todayDate)
                                            );

                                            // Nếu không tìm thấy tuần chứa ngày hôm nay, dùng logic dựa trên ngày thực tế
                                            if (!weekData) {
                                                // Tính tuần hiện tại dựa trên ngày bắt đầu lộ trình và ngày hôm nay
                                                const pathStartDate = currentPath.startDate ? dayjs(currentPath.startDate) : null;
                                                const today = dayjs();

                                                let currentWeek = 1; // Mặc định tuần 1

                                                if (pathStartDate) {
                                                    // Tính số ngày đã trải qua từ ngày bắt đầu
                                                    const daysPassed = today.diff(pathStartDate, 'day');

                                                    // Xác định startDate là thứ mấy trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
                                                    const startDayOfWeek = pathStartDate.day();

                                                    console.log('=== WEEK CALCULATION DEBUG ===');
                                                    console.log('Path start date:', pathStartDate.format('YYYY-MM-DD dddd'));
                                                    console.log('Start day of week:', startDayOfWeek, '(0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7)');
                                                    console.log('Today:', today.format('YYYY-MM-DD dddd'));
                                                    console.log('Days passed:', daysPassed);

                                                    if (daysPassed >= 0) {
                                                        // Tính tuần hiện tại: mỗi 7 ngày = 1 tuần
                                                        currentWeek = Math.floor(daysPassed / 7) + 1;
                                                    }

                                                    console.log('Calculated current week:', currentWeek);
                                                    console.log('Logic: Tuần 1 bắt đầu từ', pathStartDate.format('DD/MM (dddd)'), 'và kéo dài 7 ngày');
                                                }

                                                // Đảm bảo currentWeek không vượt quá số tuần có trong lộ trình
                                                currentWeek = Math.min(currentWeek, currentPath.weeklySchedule.length);

                                                // Tìm tuần dựa trên currentWeek đã tính
                                                weekData = currentPath.weeklySchedule.find(w => w.week === currentWeek);

                                                // Nếu tìm thấy tuần và còn hoạt động chưa hoàn thành trong tuần đó
                                                if (weekData && weekData.days) {
                                                    const hasIncompleteActivities = weekData.days.some(day =>
                                                        day.activities && day.activities.some(activity => !activity.isCompleted)
                                                    );

                                                    // Nếu tuần hiện tại vẫn có hoạt động chưa hoàn thành, giữ nguyên
                                                    // Nếu tuần hiện tại đã hoàn thành hết, chuyển sang tuần tiếp theo (nếu có)
                                                    if (!hasIncompleteActivities && currentWeek < currentPath.weeklySchedule.length) {
                                                        const nextWeekData = currentPath.weeklySchedule.find(w => w.week === currentWeek + 1);
                                                        if (nextWeekData) {
                                                            weekData = nextWeekData;
                                                        }
                                                    }
                                                }
                                            }

                                            // Nếu vẫn không tìm thấy, lấy tuần đầu tiên
                                            if (!weekData && currentPath.weeklySchedule.length > 0) {
                                                weekData = currentPath.weeklySchedule[0];
                                            }

                                            if (!weekData || !weekData.days) {
                                                return <Text type="secondary">Không có hoạt động nào cho tuần này</Text>;
                                            }

                                            // Tìm ngày đầu tiên chưa hoàn thành tất cả hoạt động (bỏ qua weekend)
                                            let firstIncompleteDay = null;
                                            let firstIncompleteDayIdx = -1;

                                            for (let i = 0; i < weekData.days.length; i++) {
                                                const day = weekData.days[i];
                                                const isWeekend = dayjs(day.date).day() === 0 || dayjs(day.date).day() === 6;

                                                if (!isWeekend && day.activities.some(a => !a.isCompleted)) {
                                                    firstIncompleteDay = day;
                                                    firstIncompleteDayIdx = i;
                                                    break;
                                                }
                                            }

                                            // Xác định ngày nào được ưu tiên hiển thị lên đầu
                                            let priorityDay = null;
                                            let shouldShowAlert = false;

                                            // Ưu tiên 1: Luôn ưu tiên ngày hôm nay nếu có trong tuần
                                            const todayInWeek = weekData.days.find(day => day.date === todayDate);

                                            if (todayInWeek) {
                                                // Có ngày hôm nay trong tuần -> luôn ưu tiên ngày hôm nay
                                                priorityDay = todayInWeek;
                                            } else if (firstIncompleteDay) {
                                                // Không có ngày hôm nay và có ngày chưa hoàn thành
                                                const dayIndex = firstIncompleteDayIdx;

                                                // Kiểm tra tất cả ngày trước đã hoàn thành chưa
                                                const allPreviousDaysCompleted = weekData.days.slice(0, dayIndex).every(prevDay => {
                                                    const isPrevWeekend = dayjs(prevDay.date).day() === 0 || dayjs(prevDay.date).day() === 6;
                                                    return isPrevWeekend || prevDay.activities.every(a => a.isCompleted);
                                                });

                                                if (!allPreviousDaysCompleted) {
                                                    // Có ngày trước chưa hoàn thành -> ưu tiên ngày trước đó
                                                    for (let i = 0; i < dayIndex; i++) {
                                                        const prevDay = weekData.days[i];
                                                        const isPrevWeekend = dayjs(prevDay.date).day() === 0 || dayjs(prevDay.date).day() === 6;
                                                        if (!isPrevWeekend && prevDay.activities.some(a => !a.isCompleted)) {
                                                            priorityDay = prevDay;
                                                            shouldShowAlert = true;
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    // Tất cả ngày trước đã hoàn thành -> ưu tiên ngày chưa hoàn thành này
                                                    priorityDay = firstIncompleteDay;
                                                }
                                            } else {
                                                // Tất cả ngày đã hoàn thành và không có ngày hôm nay -> hiển thị ngày gần nhất
                                                priorityDay = weekData.days[weekData.days.length - 1];
                                            }

                                            let daysToShow = [];
                                            if (showAllDays) {
                                                // Hiển thị toàn bộ, đưa ngày ưu tiên lên đầu
                                                daysToShow = [...weekData.days];
                                                if (priorityDay) {
                                                    const priorityIdx = daysToShow.findIndex(day => day.date === priorityDay.date);
                                                    if (priorityIdx > -1) {
                                                        const priorityDayObj = daysToShow[priorityIdx];
                                                        daysToShow = [priorityDayObj, ...daysToShow.slice(0, priorityIdx), ...daysToShow.slice(priorityIdx + 1)];
                                                    }
                                                }
                                            } else {
                                                // Chỉ hiển thị ngày ưu tiên
                                                daysToShow = priorityDay ? [priorityDay] : [];
                                            }
                                            return <>
                                                {shouldShowAlert && (
                                                    <Alert
                                                        type="warning"
                                                        showIcon
                                                        style={{ marginBottom: 16 }}
                                                        message="Bạn cần hoàn thành tất cả hoạt động của các ngày trước để tiếp tục!"
                                                    />
                                                )}
                                                {daysToShow.map((day, dayIdx) => {
                                                    const isWeekend = dayjs(day.date).day() === 0 || dayjs(day.date).day() === 6;
                                                    if (showAllDays && isWeekend) {
                                                        return (
                                                            <div key={day.date} style={{
                                                                marginBottom: 16,
                                                                padding: 12,
                                                                border: '1px solid #f0f0f0',
                                                                borderRadius: 8,
                                                                background: '#fffbe6',
                                                                textAlign: 'center',
                                                            }}>
                                                                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-warning)', fontSize: 16 }}>
                                                                    {day.dayName} ({day.date}) <span style={{ marginLeft: 8, color: 'var(--color-warning)', fontWeight: 500 }}>[Ngày nghỉ]</span>
                                                                </div>
                                                                <div style={{ color: '#bfbfbf', fontSize: 18, margin: '16px 0' }}>
                                                                    <CalendarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                                                    <div>Thư giãn và nạp năng lượng!</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Xác định trạng thái của ngày
                                                    const todayDate = dayjs().format('YYYY-MM-DD');
                                                    const isToday = day.date === todayDate;
                                                    const dayIndex = weekData.days.findIndex(d => d.date === day.date);
                                                    const allActivitiesDone = day.activities.every(a => a.isCompleted);
                                                    const isFuture = dayjs(day.date).isAfter(todayDate, 'day');

                                                    // Kiểm tra tất cả ngày trước đã hoàn thành chưa (bỏ qua weekend)
                                                    const allPreviousDaysCompleted = weekData.days.slice(0, dayIndex).every(prevDay => {
                                                        const isPrevWeekend = dayjs(prevDay.date).day() === 0 || dayjs(prevDay.date).day() === 6;
                                                        return isPrevWeekend || prevDay.activities.every(a => a.isCompleted);
                                                    });

                                                    // Logic disable checkbox và styling
                                                    let checkboxDisabled = true;
                                                    let backgroundColor = 'var(--color-bg-hover)';
                                                    let subLabel = '';
                                                    let dayColor = '#aaa';
                                                    let borderStyle = '1px solid #f0f0f0';
                                                    let boxShadow = 'none';

                                                    if (disableAllCheckbox) {
                                                        // Chưa đến ngày bắt đầu lộ trình
                                                        checkboxDisabled = true;
                                                        subLabel = 'Chưa đến ngày bắt đầu lộ trình';
                                                    } else if (allActivitiesDone) {
                                                        // Ngày đã hoàn thành tất cả hoạt động -> disable và màu xanh
                                                        checkboxDisabled = true;
                                                        backgroundColor = 'var(--color-success-bg)';
                                                        subLabel = 'Đã hoàn thành - Đã khóa';
                                                        dayColor = 'var(--color-success)';
                                                        borderStyle = '1px solid #b7eb8f';
                                                    } else if (!allPreviousDaysCompleted) {
                                                        // Các ngày trước chưa hoàn thành -> cho phép hoàn thành ngày này nếu không phải tương lai
                                                        if (isFuture) {
                                                            checkboxDisabled = true;
                                                            subLabel = 'Chưa đến ngày này';
                                                        } else {
                                                            checkboxDisabled = false;
                                                            backgroundColor = '#fff2e8';
                                                            subLabel = 'Cần hoàn thành để mở khóa ngày tiếp theo';
                                                            dayColor = 'var(--color-chart-6)';
                                                            borderStyle = '2px solid #ffa940';
                                                            boxShadow = '0 2px 8px rgba(250,140,22,0.15)';
                                                        }
                                                    } else if (allPreviousDaysCompleted && !isFuture) {
                                                        // Các ngày trước đã hoàn thành và không phải ngày tương lai -> cho phép
                                                        checkboxDisabled = false;
                                                        backgroundColor = 'var(--color-info-bg)';
                                                        dayColor = 'var(--color-primary)';
                                                        borderStyle = '2px solid #1890ff';
                                                        boxShadow = '0 2px 8px rgba(24,144,255,0.15)';
                                                        if (isToday) {
                                                            subLabel = 'Ngày hoạt động hôm nay';
                                                            backgroundColor = '#f0f9ff';
                                                        } else {
                                                            subLabel = 'Sẵn sàng hoàn thành';
                                                        }
                                                    } else if (isFuture) {
                                                        // Ngày tương lai -> disable
                                                        checkboxDisabled = true;
                                                        subLabel = 'Chưa đến ngày này';
                                                    }

                                                    return (
                                                        <div key={day.date} style={{
                                                            marginBottom: 16,
                                                            padding: 12,
                                                            border: borderStyle,
                                                            borderRadius: 8,
                                                            background: backgroundColor,
                                                            boxShadow: boxShadow,
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <div style={{
                                                                fontWeight: 600,
                                                                marginBottom: 8,
                                                                color: dayColor,
                                                                fontSize: !checkboxDisabled ? 16 : 14
                                                            }}>
                                                                {day.dayName} ({day.date})
                                                                {subLabel && (
                                                                    <span style={{
                                                                        marginLeft: 8,
                                                                        color: allActivitiesDone ? 'var(--color-success)' : (!checkboxDisabled ? 'var(--color-primary)' : 'var(--color-warning)'),
                                                                        fontWeight: 400,
                                                                        fontSize: 12
                                                                    }}>
                                                                        [{subLabel}]
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <List
                                                                dataSource={day.activities}
                                                                renderItem={(activity) => (
                                                                    <List.Item
                                                                        actions={[
                                                                            <Checkbox
                                                                                key="complete"
                                                                                checked={activity.isCompleted}
                                                                                disabled={checkboxDisabled}
                                                                                onChange={(e) => handleActivityComplete(
                                                                                    activity._id,
                                                                                    e.target.checked
                                                                                )}
                                                                            >
                                                                                {activity.isCompleted ? 'Hoàn thành' : 'Đánh dấu hoàn thành'}
                                                                            </Checkbox>
                                                                        ]}
                                                                    >
                                                                        <List.Item.Meta
                                                                            title={activity.content?.customContent || activity.type}
                                                                            description={`${activity.type} - ${activity.duration} phút`}
                                                                        />
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                                {!showAllDays && weekData.days.length > daysToShow.length && (
                                                    <Button type="link" onClick={() => setShowAllDays(true)} style={{ fontWeight: 600, marginTop: 8 }}>
                                                        Hiển thị thêm hoạt động các ngày khác trong tuần
                                                    </Button>
                                                )}
                                                {showAllDays && weekData.days.length > 1 && (
                                                    <Button type="link" onClick={() => setShowAllDays(false)} style={{ fontWeight: 600, marginTop: 8 }}>
                                                        Thu gọn
                                                    </Button>
                                                )}
                                            </>;
                                        })()}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    )}

                    {/* Statistics */}
                    {currentPath && currentPath.progress && (
                        <Col span={24}>
                            <Row gutter={[16, 16]}>
                                <Col xs={12} sm={8} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Hoạt động hoàn thành"
                                            value={currentPath.progress.completedActivities || 0}
                                            suffix={`/ ${currentPath.progress.totalActivities || 0}`}
                                            valueStyle={{ color: '#3f8600' }}
                                            prefix={<CheckCircleOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Tuần hoàn thành"
                                            value={currentPath.progress.completedWeeks || 0}
                                            suffix={`/ ${currentPath.estimatedDuration || 0}`}
                                            valueStyle={{ color: '#cf1322' }}
                                            prefix={<FireOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Thời gian/ngày"
                                            value={currentPath.studyTimePerDay || 0}
                                            suffix="phút"
                                            valueStyle={{ color: 'var(--color-primary)' }}
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Điểm mục tiêu"
                                            value={currentPath.targetScore || 0}
                                            valueStyle={{ color: 'var(--color-chart-4)' }}
                                            prefix={<StarOutlined />}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    )}

                    {/* AI Insights */}
                    {currentPath && currentPath.aiInsights && (
                        <Col span={24}>
                            <Card title={<><BulbOutlined /> Phân tích AI</>} className="ai-insights-card">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={8}>
                                        <div className="insight-section">
                                            <Title level={5}>
                                                <TrophyOutlined style={{ color: 'var(--color-success)' }} /> Điểm mạnh
                                            </Title>
                                            <ul>
                                                {Array.isArray(currentPath.aiInsights.strengths) && currentPath.aiInsights.strengths.length > 0
                                                    ? currentPath.aiInsights.strengths.map((strength, index) => (
                                                        <li key={index}>{strength}</li>
                                                    ))
                                                    : <li>Không có dữ liệu</li>}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <div className="insight-section">
                                            <Title level={5}>
                                                <ExclamationCircleOutlined style={{ color: 'var(--color-warning)' }} /> Cần cải thiện
                                            </Title>
                                            <ul>
                                                {Array.isArray(currentPath.aiInsights.weaknesses) && currentPath.aiInsights.weaknesses.length > 0
                                                    ? currentPath.aiInsights.weaknesses.map((weakness, index) => (
                                                        <li key={index}>{weakness}</li>
                                                    ))
                                                    : <li>Không có dữ liệu</li>}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <div className="insight-section">
                                            <Title level={5}>
                                                <BookOutlined style={{ color: 'var(--color-primary)' }} /> Tập trung tiếp theo
                                            </Title>
                                            <Text strong>{currentPath.aiInsights.nextFocus || 'Không có dữ liệu'}</Text>
                                        </div>
                                    </Col>
                                </Row>
                                {currentPath.aiInsights.progressAssessment && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Đánh giá tiến độ: </Text>
                                        <span>{currentPath.aiInsights.progressAssessment}</span>
                                    </div>
                                )}
                                {currentPath.aiInsights.motivationalMessage && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Động lực: </Text>
                                        <span>{currentPath.aiInsights.motivationalMessage}</span>
                                    </div>
                                )}
                                {Array.isArray(currentPath.aiInsights.adjustments) && currentPath.aiInsights.adjustments.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Điều chỉnh đề xuất:</Text>
                                        <ul>
                                            {currentPath.aiInsights.adjustments.map((adj, idx) => (
                                                <li key={idx}>{adj}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {Array.isArray(currentPath.aiInsights.riskFactors) && currentPath.aiInsights.riskFactors.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Rủi ro:</Text>
                                        <ul>
                                            {currentPath.aiInsights.riskFactors.map((risk, idx) => (
                                                <li key={idx}>{risk}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {Array.isArray(currentPath.aiInsights.successIndicators) && currentPath.aiInsights.successIndicators.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <Text strong>Chỉ số thành công:</Text>
                                        <ul>
                                            {currentPath.aiInsights.successIndicators.map((succ, idx) => (
                                                <li key={idx}>{succ}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5}>
                                        <CheckCircleOutlined style={{ color: 'var(--color-chart-4)' }} /> Gợi ý từ AI
                                    </Title>
                                    <ul>
                                        {Array.isArray(currentPath.aiInsights.recommendations) && currentPath.aiInsights.recommendations.length > 0
                                            ? currentPath.aiInsights.recommendations.map((rec, index) => (
                                                <li key={index}>{rec}</li>
                                            ))
                                            : <li>Không có dữ liệu</li>}
                                    </ul>
                                </div>
                            </Card>
                        </Col>
                    )}

                    {/* Weekly Milestones */}
                    {currentPath && currentPath.milestones && (
                        <Col span={24}>
                            <Card title={<><CalendarOutlined /> Cột mốc theo tuần</>} >
                                <Timeline>
                                    {currentPath.milestones.map((milestone, index) => (
                                        <Timeline.Item
                                            key={milestone._id}
                                            color={milestone.isCompleted ? 'green' : 'blue'}
                                            dot={milestone.isCompleted ?
                                                <CheckCircleOutlined style={{ fontSize: '16px' }} /> :
                                                <ClockCircleOutlined style={{ fontSize: '16px' }} />
                                            }
                                        >
                                            <div className="milestone-item">
                                                <Title level={5}>
                                                    Tuần {milestone.week}: {milestone.title}
                                                </Title>
                                                <Paragraph>{milestone.description}</Paragraph>
                                                <div className="milestone-target">
                                                    <Text type="secondary">
                                                        Mục tiêu điểm: {milestone.expectedScore?.overall || 'N/A'}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Card>
                        </Col>
                    )}
                </Row>
            </div>
        );
    };


    // Create Path Interface
    const CreatePathInterface = React.memo(() => (
        <div className="ai-create-path-interface">
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card className="quick-create-card">
                        <div className="quick-create-content">
                            <div className="quick-create-info">
                                <RocketOutlined className="quick-create-icon" />
                                <div>
                                    <Title level={4}>Lộ trình nhanh 4 tuần</Title>
                                    <Paragraph>
                                        AI sẽ tự động tạo lộ trình học tập 4 tuần phù hợp với trình độ hiện tại của bạn,
                                        tập trung vào các kỹ năng cần thiết để cải thiện điểm số TOEIC. Lộ trình sẽ bắt đầu từ hôm nay.
                                    </Paragraph>
                                    <ul>
                                        <li>📅 Bắt đầu ngay hôm nay ({dayjs().format('DD/MM/YYYY')})</li>
                                        <li>🤖 Đánh giá trình độ tự động</li>
                                        <li>🎯 Lộ trình được cá nhân hóa</li>
                                        <li>📊 Theo dõi tiến độ real-time</li>
                                        <li>⚡ Điều chỉnh linh hoạt theo kết quả</li>
                                    </ul>
                                </div>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<RocketOutlined />}
                                onClick={handleQuickPathCreate}
                                loading={loading}
                                className="quick-create-button"
                            >
                                Tạo ngay
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card>
                        <Title level={4}>
                            <PlusOutlined /> Tạo lộ trình tùy chỉnh
                        </Title>
                        <Button
                            type="default"
                            size="large"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Tạo lộ trình chi tiết
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    ));


    // My Paths Component
    const MyPathsList = React.memo(() => (
        <div className="my-paths-list">
            {learningPaths.length === 0 ? (
                <EmptyState />
            ) : (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 2,
                        lg: 2,
                        xl: 3,
                        xxl: 3,
                    }}
                    dataSource={learningPaths}
                    renderItem={(path) => (
                        <List.Item>
                            <Card
                                className={`path-card ${currentPath?._id === path._id ? 'active' : ''}`}
                                actions={[
                                    <Button
                                        type="text"
                                        onClick={() => setCurrentPath(path)}
                                        disabled={currentPath?._id === path._id}
                                    >
                                        {currentPath?._id === path._id ? 'Đang active' : 'Chọn'}
                                    </Button>,
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeletePath(path._id)}
                                    >
                                        Xóa
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div className="path-title">
                                            <TrophyOutlined />
                                            <span>{path.title}</span>
                                            {currentPath?._id === path._id && (
                                                <Badge status="processing" text="Active" />
                                            )}
                                        </div>
                                    }
                                    description={
                                        <div className="path-description">
                                            <p>Mục tiêu: {path.targetScore} điểm</p>
                                            <p>Thời gian: {path.estimatedDuration || path.duration} tuần</p>
                                            <p>Trạng thái: {path.isActive ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                                            <Progress
                                                percent={path.progress ?
                                                    Math.round((path.progress.completedActivities / path.progress.totalActivities) * 100)
                                                    : 0
                                                }
                                                size="small"
                                            />
                                            <div style={{ marginTop: 8 }}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {path.progress?.completedActivities || 0}/{path.progress?.totalActivities || 0} hoạt động hoàn thành
                                                </Text>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    ));

    if (loading && !hasLearningPaths) {
        return <Loading />;
    }

    return (
        <div className="ai-learning-path-container" style={{padding: '24px'}}>
            <div className="ai-learning-path-header">
                <Title level={2}>
                    <BulbOutlined className="header-icon" />
                    Lộ trình học tập
                </Title>
                <Paragraph className="header-description">
                    Hệ thống lộ trình học TOEIC được cá nhân hóa bằng AI, giúp bạn đạt mục tiêu một cách hiệu quả nhất.
                </Paragraph>
            </div>

            {error && (
                <Alert
                    message="Có lỗi xảy ra"
                    description={error}
                    type="error"
                    closable
                    style={{ marginBottom: 16 }}
                />
            )}

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="ai-learning-path-tabs"
            >
                <TabPane
                    tab={
                        <span>
                            <DashboardOutlined />
                            Dashboard
                        </span>
                    }
                    key="dashboard"
                >
                    <LearningPathDashboard />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <PlusOutlined />
                            Tạo lộ trình
                        </span>
                    }
                    key="create"
                >
                    <CreatePathInterface />
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <BookOutlined />
                            Lộ trình của tôi
                        </span>
                    }
                    key="my-paths"
                >
                    <MyPathsList />
                </TabPane>
            </Tabs>

            {/* Create Custom Path Modal */}
            <Modal
                title={
                    <span>
                        <PlusOutlined /> Tạo lộ trình học tập tùy chỉnh
                    </span>
                }
                open={showCreateModal}
                onCancel={() => {
                    setShowCreateModal(false);
                    createForm.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCustomPathCreate}
                >

                    <Form.Item
                        name="title"
                        label={<span style={{ fontWeight: 600, fontSize: 16 }}>Tên lộ trình <span style={{ color: 'red' }}>*</span></span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên lộ trình!' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <input
                            type="text"
                            placeholder="VD: Lộ trình TOEIC 750 trong 8 tuần"
                            style={inputStyle}
                        />
                    </Form.Item>

                    <Form.Item
                        name="startDate"
                        label={<span style={{ fontWeight: 600, fontSize: 16 }}>Ngày bắt đầu <span style={{ color: 'red' }}>*</span></span>}
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        style={{ marginBottom: 20 }}
                    >
                        <AntdDatePicker
                            style={{ width: '100%', borderRadius: 8, padding: '10px 14px' }}
                            size="large"
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày bắt đầu lộ trình"
                            disabledDate={current => current && current < dayjs().startOf('day')}
                            onChange={date => {
                                setStartDate(date);
                                createForm.setFieldsValue({ startDate: date });
                            }}
                            value={startDate}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="currentLevel"
                                label="Trình độ hiện tại"
                                rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
                            >
                                <Select
                                    placeholder="Chọn trình độ"
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    size="large"
                                >
                                    <Select.Option value="beginner">Beginner (0-400)</Select.Option>
                                    <Select.Option value="intermediate">Intermediate (400-600)</Select.Option>
                                    <Select.Option value="upper-intermediate">Upper-Intermediate (600-750)</Select.Option>
                                    <Select.Option value="advanced">Advanced (750+)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="targetScore"
                                label="Điểm mục tiêu"
                                rules={[{ required: true, message: 'Vui lòng nhập điểm mục tiêu!' }]}
                            >
                                <Slider
                                    min={300}
                                    max={990}
                                    step={10}
                                    marks={{
                                        400: '400',
                                        600: '600',
                                        750: '750',
                                        900: '900'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label="Thời gian (tuần)"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                                initialValue={8}
                            >
                                <Select
                                    placeholder="Chọn thời gian"
                                    style={{ width: '100%' }}
                                    size="large"
                                >
                                    <Select.Option value={4}>4 tuần (Cấp tốc)</Select.Option>
                                    <Select.Option value={8}>8 tuần (Tiêu chuẩn)</Select.Option>
                                    <Select.Option value={12}>12 tuần (Từ từ)</Select.Option>
                                    <Select.Option value={16}>16 tuần (Dài hạn)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="studyTimePerDay"
                                label="Thời gian học/ngày (phút)"
                                rules={[{ required: true }]}
                            >
                                <Slider
                                    min={30}
                                    max={180}
                                    step={15}
                                    marks={{
                                        30: '30p',
                                        60: '1h',
                                        90: '1.5h',
                                        120: '2h',
                                        180: '3h'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="focusAreas"
                        label="Kỹ năng cần cải thiện"
                    >
                        <Checkbox.Group
                            options={[
                                { label: 'Listening', value: 'listening' },
                                { label: 'Reading', value: 'reading' },
                                { label: 'Grammar', value: 'grammar' },
                                { label: 'Vocabulary', value: 'vocabulary' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="learningStyle"
                        label="Phong cách học tập"
                    >
                        <Select
                            placeholder="Chọn phong cách học tập"
                            style={{ width: '100%' }}
                            size="large"
                        >
                            <Select.Option value="balanced">Cân bằng (Lý thuyết + Thực hành)</Select.Option>
                            <Select.Option value="practice-focused">Tập trung thực hành</Select.Option>
                            <Select.Option value="theory-focused">Tập trung lý thuyết</Select.Option>
                            <Select.Option value="exam-focused">Tập trung luyện thi</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="form-actions">
                        <Space>
                            <Button onClick={() => {
                                setShowCreateModal(false);
                                createForm.resetFields();
                                setStartDate(null);
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<BulbOutlined />}
                            >
                                Tạo lộ trình học
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LearningPathPage;
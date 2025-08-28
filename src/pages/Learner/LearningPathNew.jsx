import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
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
    Timeline
} from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
import '../../assets/css/aiLearningPath.css';
import useAILearningPath from '../../hooks/useAILearningPath';


// Cấu hình dayjs sử dụng locale tiếng Việt
dayjs.locale('vi');

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
            
            // Chuyển đổi startDate từ react-datepicker (kiểu Date) sang string YYYY-MM-DD
            if (values.startDate instanceof Date) {
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
                    message.success('Đã xóa lộ trình học tập');
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
            Modal.info({
                title: '🧠 Phân tích AI về tiến độ học tập',
                content: (
                    <div>
                        <p><strong>Điểm mạnh:</strong></p>
                        <ul>
                            {analysis.strengths?.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                        <p><strong>Cần cải thiện:</strong></p>
                        <ul>
                            {analysis.improvements?.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                            ))}
                        </ul>
                        <p><strong>Gợi ý:</strong></p>
                        <p>{analysis.recommendation}</p>
                    </div>
                ),
                width: 600
            });
        } catch (error) {
            console.error('Error analyzing progress:', error);
        }
    };


    // Loading Component
    const Loading = React.memo(() => (
        <div className="ai-learning-path-loading" style={loadingOuterStyle}>
            <div style={loadingBoxStyle}>
                <Spin size="large" style={{ marginBottom: 10, fontSize: 40, color: '#1890ff' }} />
                <p style={{
                    fontSize: 20,
                    color: '#1890ff',
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
                icon={<BookOutlined style={{ color: '#1890ff' }} />}
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
            <div className="ai-learning-path-dashboard">
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
                                            icon={<BulbOutlined />} 
                                            onClick={handleAnalyzeProgress}
                                            loading={loading}
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
                                            const completedActivities = currentPath.progress?.completedActivities || 0;
                                            const currentWeek = Math.floor(completedActivities / 15) + 1;
                                            const weekData = currentPath.weeklySchedule.find(w => w.week === Math.min(currentWeek, currentPath.weeklySchedule.length));
                                            if (!weekData || !weekData.days) {
                                                return <Text type="secondary">Không có hoạt động nào cho tuần này</Text>;
                                            }
                                            // Tìm ngày hiện tại: là ngày đầu tiên có isAccessible=true và tất cả các ngày trước đã hoàn thành hết hoạt động
                                            let currentDayIdx = -1;
                                            for (let i = 0; i < weekData.days.length; i++) {
                                                const day = weekData.days[i];
                                                const allPrevDone = weekData.days.slice(0, i).every(d => d.activities.every(a => a.isCompleted));
                                                if (day.isAccessible && allPrevDone) {
                                                    currentDayIdx = i;
                                                    break;
                                                }
                                            }
                                            // Hiển thị ngày hiện tại hoặc ngày bắt đầu đầu tiên
                                            const daysToShow = showAllDays ? weekData.days : weekData.days.slice(0, currentDayIdx === -1 ? 1 : currentDayIdx + 1);
                                            return <>
                                                {daysToShow.map((day, dayIdx) => {
                                                    const isCurrentDay = dayIdx === currentDayIdx || (currentDayIdx === -1 && dayIdx === 0);
                                                    return (
                                                        <div key={day.date} style={{
                                                            marginBottom: 16,
                                                            padding: 12,
                                                            border: '1px solid #f0f0f0',
                                                            borderRadius: 8,
                                                            background: (isCurrentDay && !disableAllCheckbox) ? '#f6ffed' : '#fafafa'
                                                        }}>
                                                            <div style={{ fontWeight: 600, marginBottom: 8, color: isCurrentDay ? '#389e0d' : '#aaa' }}>
                                                                {day.dayName} ({day.date})
                                                                {!isCurrentDay && (
                                                                    <span style={{ marginLeft: 8, color: '#faad14', fontWeight: 400 }}>
                                                                        {disableAllCheckbox ? 'Chưa đến ngày này' : '(Không thể chỉnh sửa)'}
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
                                                                                disabled={!isCurrentDay || disableAllCheckbox}
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
                                            valueStyle={{ color: '#1890ff' }}
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={12} sm={8} md={6}>
                                    <Card>
                                        <Statistic
                                            title="Điểm mục tiêu"
                                            value={currentPath.targetScore || 0}
                                            valueStyle={{ color: '#722ed1' }}
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
                                                <TrophyOutlined style={{ color: '#52c41a' }} /> Điểm mạnh
                                            </Title>
                                            <ul>
                                                {currentPath.aiInsights.strengths?.map((strength, index) => (
                                                    <li key={index}>{strength}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <div className="insight-section">
                                            <Title level={5}>
                                                <ExclamationCircleOutlined style={{ color: '#faad14' }} /> Cần cải thiện
                                            </Title>
                                            <ul>
                                                {currentPath.aiInsights.weaknesses?.map((weakness, index) => (
                                                    <li key={index}>{weakness}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <div className="insight-section">
                                            <Title level={5}>
                                                <BookOutlined style={{ color: '#1890ff' }} /> Tập trung tiếp theo
                                            </Title>
                                            <Text strong>{currentPath.aiInsights.nextFocus}</Text>
                                        </div>
                                    </Col>
                                </Row>
                                
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5}>
                                        <CheckCircleOutlined style={{ color: '#722ed1' }} /> Gợi ý từ AI
                                    </Title>
                                    <ul>
                                        {currentPath.aiInsights.recommendations?.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </Col>
                    )}

                    {/* Weekly Milestones */}
                    {currentPath && currentPath.milestones && (
                        <Col span={24}>
                            <Card title={<><CalendarOutlined /> Cột mốc theo tuần</>}>
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
                        <div style={{ width: '100%' }}>
                            <DatePicker
                                selected={startDate}
                                onChange={date => {
                                    setStartDate(date);
                                    createForm.setFieldsValue({ startDate: date });
                                }}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                placeholderText="Chọn ngày bắt đầu lộ trình"
                                className="ant-input"
                                wrapperClassName="w-100"
                                popperPlacement="bottom-start"
                                style={inputStyle}
                            />
                        </div>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="currentLevel"
                                label="Trình độ hiện tại"
                                rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
                            >
                                <select>
                                    <option value="">Chọn trình độ</option>
                                    <option value="beginner">Beginner (0-400)</option>
                                    <option value="intermediate">Intermediate (400-600)</option>
                                    <option value="upper-intermediate">Upper-Intermediate (600-750)</option>
                                    <option value="advanced">Advanced (750+)</option>
                                </select>
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
                                <select>
                                    <option value="">Chọn thời gian</option>
                                    <option value={4}>4 tuần (Cấp tốc)</option>
                                    <option value={8}>8 tuần (Tiêu chuẩn)</option>
                                    <option value={12}>12 tuần (Từ từ)</option>
                                    <option value={16}>16 tuần (Dài hạn)</option>
                                </select>
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
                        name="weakSkills"
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
                        <select>
                            <option value="balanced">Cân bằng (Lý thuyết + Thực hành)</option>
                            <option value="practice-focused">Tập trung thực hành</option>
                            <option value="theory-focused">Tập trung lý thuyết</option>
                            <option value="exam-focused">Tập trung luyện thi</option>
                        </select>
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
                                Tạo bằng AI
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LearningPathPage;

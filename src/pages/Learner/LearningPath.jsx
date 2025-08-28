import React, { useState, useEffect } from 'react';
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
    Timeline,
    List,
    Tag,
    Modal,
    Form,
    Select,
    Slider,
    Checkbox,
    message,
    Alert,
    Tabs,
    Calendar,
    Badge
} from 'antd';
import { 
    BookOutlined, 
    PlusOutlined, 
    DashboardOutlined, 
    HomeOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    FireOutlined,
    BulbOutlined,
    TargetOutlined,
    CalendarOutlined,
    RocketOutlined,
    StarOutlined
} from '@ant-design/icons';
import '../../assets/css/aiLearningPath.css';
import useAILearningPath from '../../hooks/useAILearningPath';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const LearningPathPage = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id;
    
    // Use AI Learning Path hook
    const {
        learningPaths,
        currentPath,
        currentWeekActivities,
        stats,
        loading,
        error,
        createLearningPath,
        createQuickPath,
        updateActivityProgress,
        analyzeProgress,
        getAIRecommendations,
        deleteLearningPath,
        resetProgress,
        setCurrentPath,
        hasLearningPaths,
        isPathSelected,
        currentPathProgress
    } = useAILearningPath(userId);
    
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm] = Form.useForm();
    
    console.log('User from localStorage:', user);
    console.log('UserId extracted:', userId);

    // Fetch learning paths
    useEffect(() => {
        if (userId) {
            fetchLearningPaths();
        }
    }, [userId]);

    const fetchLearningPaths = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/learning-paths/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setLearningPaths(data);
                if (data.length > 0) {
                    setCurrentPath(data[0]);
                    setActiveTab('dashboard');
                } else {
                    setActiveTab('create');
                }
            }
        } catch (error) {
            console.error('Error fetching learning paths:', error);
            message.error('Không thể tải lộ trình học tập');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePath = async (values) => {
        setLoading(true);
        try {
            const pathData = {
                userId,
                targetScore: values.targetScore,
                currentLevel: values.currentLevel || 'beginner',
                timeAvailable: values.timeAvailable,
                focusAreas: values.focusAreas || [],
                weakAreas: values.weakAreas || [],
                studyTimePerDay: values.studyTimePerDay,
                preferredStudyTime: values.preferredStudyTime
            };

            const response = await fetch('http://localhost:5000/api/learning-paths/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pathData)
            });

            if (response.ok) {
                const newPath = await response.json();
                message.success('🎉 Lộ trình học tập AI đã được tạo thành công!');
                setCurrentPath(newPath);
                setLearningPaths([newPath, ...learningPaths]);
                setShowCreateModal(false);
                setActiveTab('dashboard');
                createForm.resetFields();
            } else {
                throw new Error('Failed to create learning path');
            }
        } catch (error) {
            console.error('Error creating learning path:', error);
            message.error('Không thể tạo lộ trình học tập. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickCreate = async () => {
        setLoading(true);
        try {
            const quickData = {
                userId,
                targetScore: 650,
                currentLevel: 'intermediate'
            };

            const response = await fetch('http://localhost:5000/api/quick-learning-path', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quickData)
            });

            if (response.ok) {
                const newPath = await response.json();
                message.success('🚀 Lộ trình nhanh 4 tuần đã được tạo!');
                setCurrentPath(newPath);
                setLearningPaths([newPath, ...learningPaths]);
                setActiveTab('dashboard');
            }
        } catch (error) {
            console.error('Error creating quick path:', error);
            message.error('Không thể tạo lộ trình nhanh');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div style={{ padding: '24px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Result
                    status="warning"
                    title="Không thể xác định người dùng"
                    subTitle="Vui lòng đăng nhập lại để sử dụng tính năng này"
                    extra={
                        <Button type="primary" onClick={() => window.location.href = '/learner/signin'}>
                            Đăng nhập
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="learning-path-page" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    <RocketOutlined style={{ marginRight: '12px' }} />
                    AI Learning Path - Lộ Trình Học TOEIC Thông Minh
                </Title>
                <Paragraph style={{ color: '#666', marginTop: '8px', fontSize: '16px' }}>
                    🤖 Được tạo bởi AI • Cá nhân hóa hoàn toàn • Thích ứng với tiến độ của bạn
                </Paragraph>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                <TabPane 
                    tab={
                        <Space>
                            <DashboardOutlined />
                            Bảng điều khiển
                            {currentPath && <Badge count={currentPath.progress?.completedActivities || 0} showZero />}
                        </Space>
                    } 
                    key="dashboard"
                >
                    {currentPath ? (
                        <LearningPathDashboard path={currentPath} onPathUpdate={fetchLearningPaths} />
                    ) : (
                        <EmptyState onCreatePath={() => setActiveTab('create')} onQuickCreate={handleQuickCreate} />
                    )}
                </TabPane>

                <TabPane 
                    tab={
                        <Space>
                            <PlusOutlined />
                            Tạo lộ trình mới
                        </Space>
                    } 
                    key="create"
                >
                    <CreatePathInterface 
                        onCreatePath={handleCreatePath}
                        onQuickCreate={handleQuickCreate}
                        loading={loading}
                    />
                </TabPane>

                {learningPaths.length > 0 && (
                    <TabPane 
                        tab={
                            <Space>
                                <BookOutlined />
                                Lộ trình của tôi ({learningPaths.length})
                            </Space>
                        } 
                        key="my-paths"
                    >
                        <MyPathsList 
                            paths={learningPaths} 
                            currentPath={currentPath}
                            onSelectPath={setCurrentPath}
                            onPathUpdate={fetchLearningPaths}
                        />
                    </TabPane>
                )}
            </Tabs>

            {loading && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(255,255,255,0.8)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <Spin size="large" tip="AI đang tạo lộ trình cho bạn..." />
                </div>
            )}
        </div>
    );
};

// Empty State Component
const EmptyState = ({ onCreatePath, onQuickCreate }) => (
    <Card style={{ textAlign: 'center', padding: '40px' }}>
        <RocketOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
        <Title level={3}>Chưa có lộ trình học tập nào</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            Hãy để AI tạo một lộ trình học TOEIC hoàn toàn cá nhân hóa cho bạn!
        </Paragraph>
        <Space size="large" style={{ marginTop: '24px' }}>
            <Button 
                type="primary" 
                size="large" 
                icon={<BulbOutlined />}
                onClick={onCreatePath}
            >
                Tạo lộ trình chi tiết
            </Button>
            <Button 
                size="large" 
                icon={<ClockCircleOutlined />}
                onClick={onQuickCreate}
            >
                Lộ trình nhanh 4 tuần
            </Button>
        </Space>
    </Card>
);

// Learning Path Dashboard Component
const LearningPathDashboard = ({ path, onPathUpdate }) => {
    const [currentWeekActivities, setCurrentWeekActivities] = useState([]);
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        if (path) {
            fetchCurrentWeekActivities();
            fetchStats();
        }
    }, [path]);

    const fetchCurrentWeekActivities = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/learning-paths/${path._id}/current-week`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentWeekActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Error fetching current week activities:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/learning-paths/${path._id}/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const markActivityCompleted = async (activityId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/learning-paths/${path._id}/activity`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('learnerToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activityId,
                    completed: true,
                    score: 85
                })
            });

            if (response.ok) {
                message.success('🎉 Hoạt động đã hoàn thành!');
                fetchCurrentWeekActivities();
                fetchStats();
                onPathUpdate();
            }
        } catch (error) {
            console.error('Error marking activity completed:', error);
            message.error('Không thể cập nhật tiến độ');
        }
    };

    const overallProgress = ((path.progress?.completedActivities || 0) / (path.progress?.totalActivities || 1)) * 100;

    return (
        <Row gutter={[24, 24]}>
            {/* Progress Overview */}
            <Col xs={24} lg={8}>
                <Card title={<><TrophyOutlined /> Tiến độ tổng quan</>} className="progress-card">
                    <div style={{ textAlign: 'center' }}>
                        <Progress
                            type="circle"
                            percent={Math.round(overallProgress)}
                            size={120}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <Title level={4} style={{ marginTop: '16px' }}>
                            {path.progress?.completedActivities || 0}/{path.progress?.totalActivities || 0} Hoạt động
                        </Title>
                        <Text type="secondary">Mục tiêu: {path.targetScore} điểm</Text>
                    </div>
                </Card>
            </Col>

            {/* Stats Cards */}
            <Col xs={24} lg={16}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Streak"
                                value={path.progress?.currentStreak || 0}
                                prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                                suffix="ngày"
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Thời gian học"
                                value={Math.round((path.progress?.totalStudyTime || 0) / 60)}
                                prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                                suffix="giờ"
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Điểm trung bình"
                                value={path.progress?.averageScore || 0}
                                precision={1}
                                prefix={<StarOutlined style={{ color: '#faad14' }} />}
                                suffix="/100"
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Tuần học"
                                value={`${Math.ceil((Date.now() - new Date(path.createdAt)) / (7 * 24 * 60 * 60 * 1000))}/${Math.ceil(path.estimatedDuration / 7)}`}
                                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                </Row>
            </Col>

            {/* Current Week Activities */}
            <Col xs={24} lg={16}>
                <Card 
                    title={<><CheckCircleOutlined /> Lịch học tuần này</>}
                    extra={<Tag color="blue">Tuần {Math.ceil((Date.now() - new Date(path.createdAt)) / (7 * 24 * 60 * 60 * 1000))}</Tag>}
                >
                    <List
                        dataSource={currentWeekActivities}
                        renderItem={(activity, index) => (
                            <List.Item
                                actions={[
                                    activity.completed ? (
                                        <Tag color="green">Hoàn thành</Tag>
                                    ) : (
                                        <Button 
                                            type="primary" 
                                            size="small"
                                            onClick={() => markActivityCompleted(activity.id)}
                                        >
                                            Hoàn thành
                                        </Button>
                                    )
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '50%', 
                                            background: activity.completed ? '#52c41a' : '#1890ff',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </div>
                                    }
                                    title={activity.title}
                                    description={
                                        <Space>
                                            <Tag>{activity.type}</Tag>
                                            <Text type="secondary">{activity.estimatedTime} phút</Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                    {currentWeekActivities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <div>Không có hoạt động nào cho tuần này</div>
                        </div>
                    )}
                </Card>
            </Col>

            {/* Milestones */}
            <Col xs={24} lg={8}>
                <Card title={<><TargetOutlined /> Cột mốc</>}>
                    <Timeline>
                        {path.milestones?.map((milestone, index) => (
                            <Timeline.Item 
                                key={index}
                                color={milestone.achieved ? 'green' : 'blue'}
                                dot={milestone.achieved ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                            >
                                <div>
                                    <Text strong>{milestone.title}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Tuần {milestone.week} • {milestone.targetScore} điểm
                                    </Text>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </Card>
            </Col>
        </Row>
    );
};

// Create Path Interface Component  
const CreatePathInterface = ({ onCreatePath, onQuickCreate, loading }) => {
    const [form] = Form.useForm();
    
    const handleSubmit = (values) => {
        onCreatePath(values);
    };

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
                <Card title={<><BulbOutlined /> Tạo lộ trình chi tiết với AI</>} className="create-form-card">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            targetScore: 650,
                            currentLevel: 'intermediate',
                            studyTimePerDay: 60,
                            timeAvailable: 12,
                            preferredStudyTime: 'evening'
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Mục tiêu điểm TOEIC"
                                    name="targetScore"
                                    rules={[{ required: true, message: 'Vui lòng chọn mục tiêu!' }]}
                                >
                                    <Select placeholder="Chọn mục tiêu điểm số">
                                        <Select.Option value={450}>450 điểm (Cơ bản)</Select.Option>
                                        <Select.Option value={550}>550 điểm (Trung bình)</Select.Option>
                                        <Select.Option value={650}>650 điểm (Khá)</Select.Option>
                                        <Select.Option value={750}>750 điểm (Giỏi)</Select.Option>
                                        <Select.Option value={850}>850 điểm (Xuất sắc)</Select.Option>
                                        <Select.Option value={950}>950 điểm (Chuyên gia)</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Trình độ hiện tại"
                                    name="currentLevel"
                                >
                                    <Select placeholder="Chọn trình độ hiện tại">
                                        <Select.Option value="beginner">Mới bắt đầu</Select.Option>
                                        <Select.Option value="intermediate">Trung bình</Select.Option>
                                        <Select.Option value="advanced">Nâng cao</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Thời gian có thể học (tuần)"
                                    name="timeAvailable"
                                >
                                    <Slider
                                        min={4}
                                        max={24}
                                        marks={{
                                            4: '4 tuần',
                                            8: '8 tuần', 
                                            12: '12 tuần',
                                            16: '16 tuần',
                                            24: '24 tuần'
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Thời gian học mỗi ngày (phút)"
                                    name="studyTimePerDay"
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

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Kỹ năng muốn tập trung"
                                    name="focusAreas"
                                >
                                    <Checkbox.Group>
                                        <Space direction="vertical">
                                            <Checkbox value="listening">🎧 Listening</Checkbox>
                                            <Checkbox value="reading">📖 Reading</Checkbox>
                                            <Checkbox value="grammar">📝 Grammar</Checkbox>
                                            <Checkbox value="vocabulary">📚 Vocabulary</Checkbox>
                                        </Space>
                                    </Checkbox.Group>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Thời gian học ưa thích"
                                    name="preferredStudyTime"
                                >
                                    <Select placeholder="Chọn thời gian học ưa thích">
                                        <Select.Option value="morning">🌅 Buổi sáng</Select.Option>
                                        <Select.Option value="afternoon">🌞 Buổi chiều</Select.Option>
                                        <Select.Option value="evening">🌆 Buổi tối</Select.Option>
                                        <Select.Option value="night">🌙 Buổi đêm</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                loading={loading}
                                icon={<RocketOutlined />}
                            >
                                🤖 Tạo lộ trình với AI
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>

            <Col xs={24} lg={8}>
                <Card title="⚡ Lộ trình nhanh" className="quick-create-card">
                    <div style={{ textAlign: 'center' }}>
                        <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                        <Title level={4}>Lộ trình 4 tuần</Title>
                        <Paragraph>
                            Tạo nhanh lộ trình học TOEIC trong 4 tuần với mục tiêu 650 điểm
                        </Paragraph>
                        <Button 
                            type="dashed" 
                            size="large" 
                            block
                            loading={loading}
                            onClick={onQuickCreate}
                            icon={<ClockCircleOutlined />}
                        >
                            Tạo ngay (30 giây)
                        </Button>
                    </div>

                    <Alert
                        type="info"
                        showIcon
                        message="AI sẽ tự động tạo lộ trình phù hợp với trình độ trung bình"
                        style={{ marginTop: '16px' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

// My Paths List Component
const MyPathsList = ({ paths, currentPath, onSelectPath, onPathUpdate }) => (
    <List
        grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
        dataSource={paths}
        renderItem={path => (
            <List.Item>
                <Card
                    hoverable
                    className={currentPath?._id === path._id ? 'active-path-card' : ''}
                    onClick={() => onSelectPath(path)}
                    actions={[
                        <Button type="link" size="small">Chi tiết</Button>,
                        <Button type="link" size="small">Chỉnh sửa</Button>
                    ]}
                >
                    <Card.Meta
                        avatar={<RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                        title={path.title || `Lộ trình ${path.targetScore} điểm`}
                        description={
                            <Space direction="vertical" size="small">
                                <Text>Mục tiêu: {path.targetScore} điểm</Text>
                                <Text type="secondary">
                                    {Math.round(((path.progress?.completedActivities || 0) / (path.progress?.totalActivities || 1)) * 100)}% hoàn thành
                                </Text>
                                <Progress 
                                    percent={Math.round(((path.progress?.completedActivities || 0) / (path.progress?.totalActivities || 1)) * 100)} 
                                    size="small" 
                                />
                            </Space>
                        }
                    />
                </Card>
            </List.Item>
        )}
    />
);

export default LearningPathPage;

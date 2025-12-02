import React, { useState, useEffect } from 'react';
import { 
    Breadcrumb, 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Table, 
    Badge, 
    Tag,
    Progress,
    Avatar,
    List,
    Timeline,
    Alert,
    Spin,
    Tabs
} from 'antd';
import { 
    HomeOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    StarOutlined,
    EyeOutlined,
    RiseOutlined,
    WarningOutlined,
    SafetyCertificateOutlined,
    DatabaseOutlined,
    ThunderboltOutlined,
    CrownOutlined,
    FireOutlined
} from '@ant-design/icons';
import Highcharts from 'highcharts';
// import AOS from 'aos';
// import 'aos/dist/aos.css';

// Import services
import adminDashboardService from '../../../services/adminDashboardService';
import './style.css';

const { TabPane } = Tabs;

const Dashboard = () => {
    // State for 6 core dashboard data
    const [overview, setOverview] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [teacherRequests, setTeacherRequests] = useState(null);
    const [topContent, setTopContent] = useState([]);
    const [topPerformers, setTopPerformers] = useState(null);
    
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        document.title = "Admin - Dashboard";
    }, []);

    // Initialize AOS - DISABLED to prevent conflicts with dynamic content
    // useEffect(() => {
    //     AOS.init({
    //         duration: 100,
    //         delay: 0,
    //         easing: 'ease-out',
    //         once: true,
    //         disable: 'mobile'
    //     });
        
    //     // Cleanup AOS on unmount
    //     return () => {
    //         AOS.refresh();
    //     };
    // }, []);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        console.log('🚀 Starting fetchDashboardData...');
        setIsLoading(true);
        try {
            // Fetch 6 core APIs with error handling
            const results = await Promise.allSettled([
                adminDashboardService.getOverview().catch(err => {
                    console.warn('Overview endpoint failed:', err.response?.data?.message || err.message);
                    return { data: null };
                }),
                adminDashboardService.getPendingApprovals().catch(err => {
                    console.warn('Pending approvals endpoint failed:', err.response?.data?.message || err.message);
                    return { data: null };
                }),
                adminDashboardService.getUserStats().catch(err => {
                    console.warn('User stats endpoint failed:', err.response?.data?.message || err.message);
                    return { data: null };
                }),
                adminDashboardService.getTeacherRequests('all').catch(err => {
                    console.warn('Teacher requests endpoint failed:', err.response?.data?.message || err.message);
                    return { data: null };
                }),
                adminDashboardService.getTopContent(10).catch(err => {
                    console.warn('Top content endpoint failed:', err.response?.data?.message || err.message);
                    return { data: [] };
                }),
                adminDashboardService.getTopPerformers(10).catch(err => {
                    console.warn('Top performers endpoint failed:', err.response?.data?.message || err.message);
                    return { data: null };
                })
            ]);

            // Extract data from settled promises
            const [
                overviewData,
                approvalsData,
                userStatsData,
                requestsData,
                contentData,
                performersData
            ] = results.map(result => result.status === 'fulfilled' ? result.value : { data: null });

            console.log('🔍 Raw API responses:', {
                overviewData,
                approvalsData,
                userStatsData,
                requestsData,
                contentData,
                performersData
            });

            // Helper function to extract data from response
            // Handle both { data: {...} } and { success: true, data: {...} }
            const extractData = (response) => {
                if (!response) return null;
                // If response has 'data' property, use it
                if (response.data !== undefined) return response.data;
                // If response has 'success' and 'data', it might be already unwrapped
                if (response.success !== undefined && response.data !== undefined) return response.data;
                // Otherwise return the response itself
                return response;
            };

            // Set state with fallback values
            const overview = extractData(overviewData);
            const approvals = extractData(approvalsData);
            const userStatsExtracted = extractData(userStatsData);
            const requests = extractData(requestsData);
            const content = extractData(contentData) || [];
            const performers = extractData(performersData);

            console.log('📊 Extracted dashboard data:', {
                overview,
                approvals,
                userStatsExtracted,
                requests,
                contentLength: content.length,
                performers
            });
            
            setOverview(overview);
            setPendingApprovals(approvals);
            setUserStats(userStatsExtracted);
            setTeacherRequests(requests);
            setTopContent(content);
            setTopPerformers(performers);

            // Log summary
            const failedCount = results.filter(r => r.status === 'rejected').length;
            if (failedCount > 0) {
                console.warn(`⚠️ ${failedCount} dashboard endpoints failed. Some data may not be available.`);
            } else {
                console.log('✅ All dashboard data loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
        } finally {
            console.log('🏁 fetchDashboardData completed, setting isLoading = false');
            setIsLoading(false);
        }
    };

    // Main useEffect
    useEffect(() => {
        console.log('🔄 Dashboard component mounted, calling fetchDashboardData...');
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Create charts when data is loaded (removed - no growth chart in simplified API)
    // useEffect(() => {
    //     if (!userStats?.growthChart || isLoading) return;
    //     ...chart code...
    // }, [userStats, isLoading]);

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toLocaleString();
    };

    // Helper function to get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'healthy': { color: 'success', text: 'Healthy' },
            'warning': { color: 'warning', text: 'Warning' },
            'critical': { color: 'error', text: 'Critical' }
        };
        const config = statusMap[status] || statusMap['warning'];
        return <Badge status={config.color} text={config.text} />;
    };

    // Helper to get activity icon
    const getActivityIcon = (type) => {
        const iconMap = {
            'user_registered': <UserOutlined style={{ color: 'var(--color-success)' }} />,
            'content_created': <FileTextOutlined style={{ color: 'var(--color-primary)' }} />,
            'exam_completed': <CheckCircleOutlined style={{ color: 'var(--color-chart-4)' }} />,
            'approval_requested': <ClockCircleOutlined style={{ color: 'var(--color-warning)' }} />
        };
        return iconMap[type] || <ClockCircleOutlined />;
    };

    if (isLoading) {
        console.log('⏳ Dashboard is still loading...');
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
            </div>
        );
    }

    console.log('✨ Dashboard render with data:', {
        hasOverview: !!overview,
        hasUserStats: !!userStats,
        hasSystemHealth: !!systemHealth,
        contentCount: topContent?.length,
        performersCount: topPerformers?.length
    });

    return (
        <div>
            {/* Breadcrumb */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #7f7fd5 0%, #86a8e7 100%)',
                    minHeight: 70,
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(80,120,255,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 32px',
                    marginBottom: 24,
                }}
            >
                <Breadcrumb separator={null} style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-bg-primary)' }}>
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
                        }}>
                            <HomeOutlined style={{ color: 'var(--color-bg-primary)', fontSize: 22 }} />
                        </span>
                        <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Admin Dashboard</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {/* Overview Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#2C5F8D', borderRadius: 12 }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng người dùng</span>}
                            value={overview?.totalUsers || 0}
                            prefix={<TeamOutlined style={{ color: 'var(--color-bg-primary)' }} />}
                            valueStyle={{ color: 'var(--color-bg-primary)', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                            <RiseOutlined /> Hoạt động hôm nay: {overview?.activeToday || 0}
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Học viên</span>}
                            value={overview?.totalStudents || 0}
                            prefix={<UserOutlined style={{ color: 'var(--color-bg-primary)' }} />}
                            valueStyle={{ color: 'var(--color-bg-primary)', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                            Giáo viên: {overview?.totalTeachers || 0}
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Nội dung</span>}
                            value={overview?.totalContent || 0}
                            prefix={<BookOutlined style={{ color: 'var(--color-bg-primary)' }} />}
                            valueStyle={{ color: 'var(--color-bg-primary)', fontWeight: 'bold' }}
                        />
                        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                            Đã duyệt và công khai
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: 12 }}>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Dung lượng</span>}
                            value={overview?.storageUsed || '0 MB'}
                            prefix={<DatabaseOutlined style={{ color: 'var(--color-bg-primary)' }} />}
                            valueStyle={{ color: 'var(--color-bg-primary)', fontWeight: 'bold', fontSize: 20 }}
                        />
                        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                            Tài nguyên hệ thống
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* System Health Alert */}
            {systemHealth && systemHealth.status !== 'healthy' && (
                <Alert
                    message="Cảnh báo hệ thống"
                    description={`Trạng thái hệ thống: ${systemHealth.status}. Vui lòng kiểm tra các dịch vụ.`}
                    type={systemHealth.status === 'critical' ? 'error' : 'warning'}
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 24, borderRadius: 8 }}
                />
            )}

            {/* Pending Approvals Card */}
            {pendingApprovals && pendingApprovals.totalPending > 0 && (
                <Card
                    title={
                        <span>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            Chờ phê duyệt ({pendingApprovals.totalPending})
                        </span>
                    }
                    bordered={false}
                    style={{ marginBottom: 24, borderRadius: 12 }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Topics:</span>
                                <Tag color="blue">{pendingApprovals.pendingByType?.topics || 0}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Lessons:</span>
                                <Tag color="green">{pendingApprovals.pendingByType?.lessons || 0}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Grammars:</span>
                                <Tag color="orange">{pendingApprovals.pendingByType?.grammars || 0}</Tag>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Tests:</span>
                                <Tag color="purple">{pendingApprovals.pendingByType?.tests || 0}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Exams:</span>
                                <Tag color="red">{pendingApprovals.pendingByType?.exams || 0}</Tag>
                            </div>
                        </Col>
                    </Row>
                    
                    {pendingApprovals.urgentItems && pendingApprovals.urgentItems.length > 0 && (
                        <div style={{ marginTop: 16, padding: 12, background: 'var(--color-warning-bg)', borderRadius: 8 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 8, color: 'var(--color-chart-6)' }}>
                                <WarningOutlined /> Cần xử lý gấp (Chờ {'>'}3 ngày):
                            </div>
                            <List
                                size="small"
                                dataSource={pendingApprovals.urgentItems.slice(0, 5)}
                                renderItem={(item) => (
                                    <List.Item>
                                        <span>
                                            <Tag color={item.priority === 'high' ? 'red' : 'orange'}>
                                                {item.type}
                                            </Tag>
                                            {item.title} - {item.waitingDays} ngày
                                        </span>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </Card>
            )}

            {/* Main Content Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ background: 'var(--color-bg-primary)', borderRadius: 12, padding: '16px' }}>
                {/* Overview Tab */}
                <TabPane tab={<span><HomeOutlined /> Tổng quan</span>} key="overview">
                    <Row gutter={[16, 16]}>
                        {/* User Growth Chart */}
                        <Col xs={24} lg={12}>
                            <Card title="Tăng trưởng người dùng" bordered={false} style={{ borderRadius: 8 }}>
                                {userStats?.growthChart ? (
                                    <div id="userGrowthChart" style={{ minHeight: 300 }}></div>
                                ) : (
                                    <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Alert
                                            message="Không có dữ liệu"
                                            description="Dữ liệu tăng trưởng người dùng chưa khả dụng"
                                            type="info"
                                            showIcon
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                        
                        {/* User Stats */}
                        <Col xs={24} lg={12}>
                            <Card title="Thống kê người dùng" bordered={false} style={{ borderRadius: 8 }}>
                                {userStats ? (
                                    <>
                                        <div style={{ marginBottom: 16 }}>
                                            <Row gutter={16}>
                                                <Col span={8} style={{ textAlign: 'center' }}>
                                                    <Statistic
                                                        title="Admin"
                                                        value={userStats.usersByRole?.admins || 0}
                                                        prefix={<CrownOutlined />}
                                                        valueStyle={{ color: 'var(--color-chart-4)' }}
                                                    />
                                                </Col>
                                                <Col span={8} style={{ textAlign: 'center' }}>
                                                    <Statistic
                                                        title="Giáo viên"
                                                        value={userStats.usersByRole?.teachers || 0}
                                                        prefix={<BookOutlined />}
                                                        valueStyle={{ color: 'var(--color-primary)' }}
                                                    />
                                                </Col>
                                                <Col span={8} style={{ textAlign: 'center' }}>
                                                    <Statistic
                                                        title="Học viên"
                                                        value={userStats.usersByRole?.learners || 0}
                                                        prefix={<UserOutlined />}
                                                        valueStyle={{ color: 'var(--color-success)' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        
                                        <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 12 }}>Người dùng hoạt động:</div>
                                            <div style={{ marginBottom: 8 }}>
                                                Hôm nay: <Tag color="green">{userStats.activeUsers?.today || 0}</Tag>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                Tuần này: <Tag color="blue">{userStats.activeUsers?.thisWeek || 0}</Tag>
                                            </div>
                                            <div>
                                                Tháng này: <Tag color="purple">{userStats.activeUsers?.thisMonth || 0}</Tag>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Alert
                                        message="Không có dữ liệu"
                                        description="Thống kê người dùng chưa khả dụng. Backend có thể gặp lỗi populate role."
                                        type="warning"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                        
                        {/* Teacher Requests */}
                        <Col xs={24} lg={12}>
                            <Card 
                                title={
                                    <span>
                                        <SafetyCertificateOutlined /> Yêu cầu làm giáo viên
                                    </span>
                                }
                                bordered={false} 
                                style={{ borderRadius: 8 }}
                            >
                                {teacherRequests && (
                                    <>
                                        <Row gutter={16} style={{ marginBottom: 16 }}>
                                            <Col span={8} style={{ textAlign: 'center' }}>
                                                <Statistic
                                                    title="Chờ duyệt"
                                                    value={teacherRequests.totalPending || 0}
                                                    valueStyle={{ color: 'var(--color-warning)' }}
                                                />
                                            </Col>
                                            <Col span={8} style={{ textAlign: 'center' }}>
                                                <Statistic
                                                    title="Đã duyệt"
                                                    value={teacherRequests.totalApproved || 0}
                                                    valueStyle={{ color: 'var(--color-success)' }}
                                                />
                                            </Col>
                                            <Col span={8} style={{ textAlign: 'center' }}>
                                                <Statistic
                                                    title="Từ chối"
                                                    value={teacherRequests.totalRejected || 0}
                                                    valueStyle={{ color: 'var(--color-danger)' }}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        {teacherRequests.pendingRequests && teacherRequests.pendingRequests.length > 0 && (
                                            <List
                                                size="small"
                                                header={<div style={{ fontWeight: 'bold' }}>Yêu cầu gần đây:</div>}
                                                bordered
                                                dataSource={teacherRequests.pendingRequests.slice(0, 5)}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold' }}>{item.user?.username}</div>
                                                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.reason}</div>
                                                        </div>
                                                        <Tag color="orange">Chờ duyệt</Tag>
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </>
                                )}
                            </Card>
                        </Col>
                        
                        {/* System Health */}
                        <Col xs={24} lg={12}>
                            <Card
                                title={
                                    <span>
                                        <ThunderboltOutlined /> Tình trạng hệ thống
                                    </span>
                                }
                                bordered={false}
                                style={{ borderRadius: 8 }}
                            >
                                {systemHealth && (
                                    <>
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ fontWeight: 'bold' }}>Trạng thái:</span>
                                                {getStatusBadge(systemHealth.status)}
                                            </div>
                                            
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{ marginBottom: 4, fontSize: 13 }}>CPU Usage:</div>
                                                <Progress 
                                                    percent={systemHealth.serverStatus?.cpu || 0} 
                                                    status={systemHealth.serverStatus?.cpu > 80 ? 'exception' : 'normal'}
                                                />
                                            </div>
                                            
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{ marginBottom: 4, fontSize: 13 }}>
                                                    Memory: {systemHealth.serverStatus?.memory?.used || 0}MB / {systemHealth.serverStatus?.memory?.total || 0}MB
                                                </div>
                                                <Progress 
                                                    percent={Math.round((systemHealth.serverStatus?.memory?.used / systemHealth.serverStatus?.memory?.total) * 100) || 0}
                                                    status={(systemHealth.serverStatus?.memory?.used / systemHealth.serverStatus?.memory?.total) > 0.8 ? 'exception' : 'normal'}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div style={{ padding: 12, background: 'var(--color-bg-tertiary)', borderRadius: 8 }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Database:</div>
                                            <div style={{ fontSize: 13 }}>
                                                Kết nối: {systemHealth.databaseStatus?.connected ? 
                                                    <Tag color="success">Hoạt động</Tag> : 
                                                    <Tag color="error">Ngắt kết nối</Tag>
                                                }
                                            </div>
                                            <div style={{ fontSize: 13, marginTop: 4 }}>
                                                Response time: {systemHealth.databaseStatus?.responseTime}ms
                                            </div>
                                            <div style={{ fontSize: 13, marginTop: 4 }}>
                                                Collections: {systemHealth.databaseStatus?.collections}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                {/* Top Performers Tab */}
                <TabPane tab={<span><TrophyOutlined /> Top Người dùng</span>} key="performers">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card title={<span><FireOutlined /> Top Học viên xuất sắc</span>} bordered={false} style={{ borderRadius: 8 }}>
                                {topPerformers && topPerformers.length > 0 ? (
                                    <List
                                        dataSource={topPerformers}
                                        renderItem={(item, index) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar style={{ 
                                                            backgroundColor: index < 3 ? '#ffd700' : 'var(--color-primary)',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {index + 1}
                                                        </Avatar>
                                                    }
                                                    title={<span style={{ fontWeight: 'bold' }}>{item.username}</span>}
                                                    description={
                                                        <div>
                                                            <div>Điểm TB: <Tag color="gold">{item.avgScore?.toFixed(1)}%</Tag></div>
                                                            <div>Số bài thi: <Tag color="blue">{item.totalExams}</Tag></div>
                                                            <div>Streak: <Tag color="red">{item.currentStreak} ngày</Tag></div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Alert
                                        message="Chưa có dữ liệu"
                                        description="Chưa có học viên hoàn thành bài thi"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                        
                        <Col xs={24} lg={12}>
                            <Card title={<span><CrownOutlined /> Bảng xếp hạng</span>} bordered={false} style={{ borderRadius: 8 }}>
                                {leaderboard && leaderboard.length > 0 ? (
                                    <List
                                        dataSource={leaderboard}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar style={{
                                                            backgroundColor: item.rank === 1 ? '#ffd700' : 
                                                                           item.rank === 2 ? '#c0c0c0' : 
                                                                           item.rank === 3 ? '#cd7f32' : 'var(--color-primary)',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            #{item.rank}
                                                        </Avatar>
                                                    }
                                                    title={<span style={{ fontWeight: 'bold' }}>{item.user?.username}</span>}
                                                    description={
                                                        <div>
                                                            <div>Tổng điểm: <Tag color="purple">{formatNumber(item.totalScore)}</Tag></div>
                                                            <div>Điểm TB: <Tag color="green">{item.avgScore?.toFixed(1)}%</Tag></div>
                                                            <div>Số bài: {item.totalExams} | Streak: {item.currentStreak} ngày</div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Alert
                                        message="Chưa có dữ liệu"
                                        description="Bảng xếp hạng chưa có người dùng"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                {/* Content Tab */}
                <TabPane tab={<span><BookOutlined /> Nội dung</span>} key="content">
                    <Card title={<span><StarOutlined /> Top nội dung phổ biến</span>} bordered={false} style={{ borderRadius: 8 }}>
                        {topContent && topContent.length > 0 ? (
                            <Table
                                dataSource={topContent}
                                rowKey="id"
                                columns={[
                                    {
                                        title: 'Tiêu đề',
                                        dataIndex: 'title',
                                        key: 'title',
                                        render: (text, record) => (
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{text}</div>
                                                <Tag color="blue">{record.type}</Tag>
                                            </div>
                                        )
                                    },
                                    {
                                        title: 'Lượt xem',
                                        dataIndex: 'views',
                                        key: 'views',
                                        render: (views) => (
                                            <span>
                                                <EyeOutlined style={{ marginRight: 4 }} />
                                                {formatNumber(views)}
                                            </span>
                                        ),
                                        sorter: (a, b) => a.views - b.views
                                    },
                                    {
                                        title: 'Đánh giá',
                                        dataIndex: 'avgRating',
                                        key: 'avgRating',
                                        render: (rating) => (
                                            <span>
                                                <StarOutlined style={{ color: 'var(--color-warning)', marginRight: 4 }} />
                                                {rating?.toFixed(1) || '0.0'}
                                            </span>
                                        ),
                                        sorter: (a, b) => a.avgRating - b.avgRating
                                    },
                                    {
                                        title: 'Hoàn thành',
                                        dataIndex: 'completions',
                                        key: 'completions',
                                        render: (completions) => (
                                            <Tag color="success">{formatNumber(completions)}</Tag>
                                        ),
                                        sorter: (a, b) => a.completions - b.completions
                                    }
                                ]}
                                pagination={{ pageSize: 10 }}
                            />
                        ) : (
                            <Alert
                                message="Chưa có dữ liệu"
                                description="Chưa có nội dung nào được xem hoặc đánh giá"
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>

                {/* Activity Tab */}
                <TabPane tab={<span><ClockCircleOutlined /> Hoạt động</span>} key="activity">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={16}>
                            <Card title="Hoạt động gần đây" bordered={false} style={{ borderRadius: 8 }}>
                                {activityFeed && activityFeed.length > 0 ? (
                                    <Timeline>
                                        {activityFeed.map((activity, index) => (
                                            <Timeline.Item key={index} dot={getActivityIcon(activity.type)}>
                                                <div style={{ marginBottom: 8 }}>
                                                    <span style={{ fontWeight: 'bold' }}>{activity.user?.username}</span>
                                                    {' '}{activity.description}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--color-text-disabled)' }}>
                                                    {new Date(activity.timestamp).toLocaleString('vi-VN')}
                                                </div>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                ) : (
                                    <Alert
                                        message="Chưa có hoạt động"
                                        description="Chưa có hoạt động nào được ghi nhận"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                        
                        <Col xs={24} lg={8}>
                            <Card title="Phản hồi gần đây" bordered={false} style={{ borderRadius: 8 }}>
                                {recentFeedbacks && recentFeedbacks.length > 0 ? (
                                    <List
                                        dataSource={recentFeedbacks}
                                        renderItem={(feedback) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    title={
                                                        <div>
                                                            <span style={{ fontWeight: 'bold' }}>{feedback.user?.username}</span>
                                                            <Tag color={
                                                                feedback.type === 'bug_report' ? 'red' : 
                                                                feedback.type === 'feature_request' ? 'blue' : 'green'
                                                            } style={{ marginLeft: 8 }}>
                                                                {feedback.type}
                                                            </Tag>
                                                        </div>
                                                    }
                                                    description={
                                                        <div>
                                                            <div style={{ marginBottom: 4 }}>{feedback.message}</div>
                                                            {feedback.rating && (
                                                                <div>
                                                                    <StarOutlined style={{ color: 'var(--color-warning)' }} />
                                                                    {' '}{feedback.rating}/5
                                                                </div>
                                                            )}
                                                            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)', marginTop: 4 }}>
                                                                {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Alert
                                        message="Chưa có phản hồi"
                                        description="Chưa có phản hồi nào từ người dùng"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Dashboard;
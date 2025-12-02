import React, { useState, useEffect } from 'react';
import { 
    Breadcrumb, 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Table, 
    Tag,
    Avatar,
    List,
    Alert,
    Spin,
    Tabs
} from 'antd';
import { 
    HomeOutlined,
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    StarOutlined,
    SafetyCertificateOutlined,
    CrownOutlined,
    FireOutlined,
    WarningOutlined,
    PieChartOutlined,
    BarChartOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

            // Helper function to extract data from response
            const extractData = (response) => {
                if (!response) return null;
                if (response.data !== undefined) return response.data;
                if (response.success !== undefined && response.data !== undefined) return response.data;
                return response;
            };

            // Set state with fallback values
            setOverview(extractData(overviewData));
            setPendingApprovals(extractData(approvalsData));
            setUserStats(extractData(userStatsData));
            setTeacherRequests(extractData(requestsData));
            setTopContent(extractData(contentData) || []);
            setTopPerformers(extractData(performersData));

            console.log('✅ Dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper function to format numbers
    const formatNumber = (num) => {
        if (!num) return '0';
        return num.toLocaleString();
    };

    // Chart colors
    const CHART_COLORS = {
        primary: ['var(--color-primary)', 'var(--color-success)', 'var(--color-chart-4)', 'var(--color-warning)', 'var(--color-chart-5)'],
        users: {
            admins: 'var(--color-chart-4)',
            teachers: 'var(--color-primary)',
            learners: 'var(--color-success)'
        },
        approval: {
            topics: 'var(--color-primary)',
            lessons: 'var(--color-success)',
            grammars: 'var(--color-chart-6)',
            tests: 'var(--color-chart-4)',
            exams: 'var(--color-danger)'
        }
    };

    // Prepare user stats chart data
    const userStatsChartData = userStats ? [
        { name: 'Admin', value: userStats.usersByRole?.admins || 0, color: CHART_COLORS.users.admins },
        { name: 'Giáo viên', value: userStats.usersByRole?.teachers || 0, color: CHART_COLORS.users.teachers },
        { name: 'Học viên', value: userStats.usersByRole?.learners || 0, color: CHART_COLORS.users.learners }
    ] : [];

    // Prepare pending approvals chart data
    const pendingApprovalsChartData = pendingApprovals ? [
        { name: 'Topics', value: pendingApprovals.pendingByType?.topics || 0, color: CHART_COLORS.approval.topics },
        { name: 'Lessons', value: pendingApprovals.pendingByType?.lessons || 0, color: CHART_COLORS.approval.lessons },
        { name: 'Grammars', value: pendingApprovals.pendingByType?.grammars || 0, color: CHART_COLORS.approval.grammars },
        { name: 'Tests', value: pendingApprovals.pendingByType?.tests || 0, color: CHART_COLORS.approval.tests },
        { name: 'Exams', value: pendingApprovals.pendingByType?.exams || 0, color: CHART_COLORS.approval.exams }
    ] : [];

    // Teacher requests chart data
    const teacherRequestsChartData = teacherRequests ? [
        { name: 'Chờ duyệt', value: teacherRequests.totalPending || 0, color: 'var(--color-warning)' },
        { name: 'Đã duyệt', value: teacherRequests.totalApproved || 0, color: 'var(--color-success)' },
        { name: 'Từ chối', value: teacherRequests.totalRejected || 0, color: 'var(--color-danger)' }
    ] : [];

    // Top content chart data
    const topContentChartData = topContent.slice(0, 10).map((item, index) => ({
        name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
        completions: item.completions,
        rank: index + 1
    }));

    // Top performers chart data
    const topLearnersChartData = topPerformers?.topLearners?.slice(0, 5).map(item => ({
        name: item.username.length > 10 ? item.username.substring(0, 10) + '...' : item.username,
        score: item.avgScore,
        exams: item.totalExams
    })) || [];

    const topTeachersChartData = topPerformers?.topTeachers?.slice(0, 5).map(item => ({
        name: item.username.length > 10 ? item.username.substring(0, 10) + '...' : item.username,
        content: item.approvedContent
    })) || [];

    // Custom label for pie chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return percent > 0.05 ? (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
            </div>
        );
    }

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

            {/* Overview Statistics Cards (4 Core Metrics) */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Tổng người dùng</span>}
                            value={overview?.totalUsers || 0}
                            prefix={<TeamOutlined style={{ color: 'var(--color-brand-purple)', fontSize: 24 }} />}
                            valueStyle={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: 28 }}
                        />
                        <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Học viên</span>}
                            value={overview?.totalStudents || 0}
                            prefix={<UserOutlined style={{ color: '#f093fb', fontSize: 24 }} />}
                            valueStyle={{ color: 'var(--color-chart-5)', fontWeight: 'bold', fontSize: 28 }}
                        />
                        <div style={{ marginTop: 8, color: 'var(--color-text-disabled)', fontSize: 13, height: 20 }}>
                            Giáo viên: <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>{overview?.totalTeachers || 0}</span>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Nội dung đã duyệt</span>}
                            value={overview?.totalContent || 0}
                            prefix={<BookOutlined style={{ color: '#4facfe', fontSize: 24 }} />}
                            valueStyle={{ color: 'var(--color-info)', fontWeight: 'bold', fontSize: 28 }}
                        />
                        <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            height: '100%'
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Chờ duyệt</span>}
                            value={pendingApprovals?.totalPending || 0}
                            prefix={<ClockCircleOutlined style={{ color: 'var(--color-warning)', fontSize: 24 }} />}
                            valueStyle={{ color: 'var(--color-chart-6)', fontWeight: 'bold', fontSize: 28 }}
                        />
                        <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
                    </Card>
                </Col>
            </Row>

            {/* Charts Overview Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* User Distribution Pie Chart */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <span>
                                <PieChartOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
                                Phân bố người dùng
                            </span>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={userStatsChartData}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userStatsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={50}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Pending Approvals Bar Chart */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <span>
                                <BarChartOutlined style={{ marginRight: 8, color: 'var(--color-warning)' }} />
                                Nội dung chờ duyệt
                            </span>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={pendingApprovalsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]}>
                                    {pendingApprovalsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Teacher Requests Pie Chart */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <span>
                                <SafetyCertificateOutlined style={{ marginRight: 8, color: 'var(--color-chart-4)' }} />
                                Yêu cầu giáo viên
                            </span>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={teacherRequestsChartData}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {teacherRequestsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={50}
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Pending Approvals with Urgent Items */}
            {pendingApprovals && pendingApprovals.totalPending > 0 && (
                <Card
                    title={
                        <span>
                            <ClockCircleOutlined style={{ marginRight: 8 }} />
                            Nội dung chờ phê duyệt ({pendingApprovals.totalPending})
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
                                <WarningOutlined /> Cần xử lý gấp (Chờ {'>'} 3 ngày):
                            </div>
                            <List
                                size="small"
                                dataSource={pendingApprovals.urgentItems}
                                renderItem={(item) => (
                                    <List.Item>
                                        <span>
                                            <Tag color={item.priority === 'high' ? 'red' : 'orange'}>
                                                {item.type}
                                            </Tag>
                                            {item.title} - {item.waitingDays} ngày
                                            {item.teacher && <span style={{ color: 'var(--color-text-disabled)', marginLeft: 8 }}>by {item.teacher}</span>}
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
                        {/* User Stats */}
                        <Col xs={24} lg={12}>
                            <Card title="Thống kê người dùng theo vai trò" bordered={false} style={{ borderRadius: 8 }}>
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
                                        
                                        <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                                            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                                                Tổng số người dùng: <Tag color="blue" style={{ fontSize: 16 }}>{userStats.totalUsers || 0}</Tag>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Alert
                                        message="Không có dữ liệu"
                                        description="Thống kê người dùng chưa khả dụng"
                                        type="info"
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
                                        
                                        {teacherRequests.requests && teacherRequests.requests.length > 0 && (
                                            <List
                                                size="small"
                                                header={<div style={{ fontWeight: 'bold' }}>Yêu cầu gần đây:</div>}
                                                bordered
                                                dataSource={teacherRequests.requests.slice(0, 5)}
                                                renderItem={(item) => (
                                                    <List.Item>
                                                        <div style={{ width: '100%' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 'bold' }}>{item.user?.username}</span>
                                                                <Tag color={
                                                                    item.status === 'pending' ? 'orange' : 
                                                                    item.status === 'approved' ? 'green' : 'red'
                                                                }>
                                                                    {item.status}
                                                                </Tag>
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                                                {item.reason}
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                {/* Top Performers Tab */}
                <TabPane tab={<span><TrophyOutlined /> Top Người dùng</span>} key="performers">
                    {/* Charts Row */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        {/* Top Learners Chart */}
                        {topLearnersChartData.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card 
                                    title={
                                        <span>
                                            <LineChartOutlined style={{ marginRight: 8, color: 'var(--color-success)' }} />
                                            Biểu đồ Top 5 học viên
                                        </span>
                                    }
                                    bordered={false} 
                                    style={{ borderRadius: 8 }}
                                >
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={topLearnersChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-success)" />
                                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-primary)" />
                                            <Tooltip />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar 
                                                yAxisId="left"
                                                dataKey="score" 
                                                fill="var(--color-success)" 
                                                name="Điểm TB (%)"
                                                radius={[8, 8, 0, 0]}
                                            />
                                            <Bar 
                                                yAxisId="right"
                                                dataKey="exams" 
                                                fill="var(--color-primary)" 
                                                name="Số bài thi"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        )}

                        {/* Top Teachers Chart */}
                        {topTeachersChartData.length > 0 && (
                            <Col xs={24} lg={12}>
                                <Card 
                                    title={
                                        <span>
                                            <BarChartOutlined style={{ marginRight: 8, color: 'var(--color-chart-4)' }} />
                                            Biểu đồ Top 5 giáo viên
                                        </span>
                                    }
                                    bordered={false} 
                                    style={{ borderRadius: 8 }}
                                >
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={topTeachersChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Bar 
                                                dataKey="content" 
                                                fill="var(--color-chart-4)" 
                                                name="Nội dung đã duyệt"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card title={<span><FireOutlined /> Top Học viên xuất sắc</span>} bordered={false} style={{ borderRadius: 8 }}>
                                {topPerformers?.topLearners && topPerformers.topLearners.length > 0 ? (
                                    <List
                                        dataSource={topPerformers.topLearners}
                                        renderItem={(item) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar style={{ 
                                                            backgroundColor: item.rank <= 3 ? '#ffd700' : 'var(--color-primary)',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            #{item.rank}
                                                        </Avatar>
                                                    }
                                                    title={<span style={{ fontWeight: 'bold' }}>{item.username}</span>}
                                                    description={
                                                        <div>
                                                            <div>Điểm TB: <Tag color="gold">{item.avgScore?.toFixed(1)}%</Tag></div>
                                                            <div>Số bài thi: <Tag color="blue">{item.totalExams}</Tag></div>
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
                            <Card title={<span><CrownOutlined /> Top Giáo viên xuất sắc</span>} bordered={false} style={{ borderRadius: 8 }}>
                                {topPerformers?.topTeachers && topPerformers.topTeachers.length > 0 ? (
                                    <List
                                        dataSource={topPerformers.topTeachers}
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
                                                    title={<span style={{ fontWeight: 'bold' }}>{item.username}</span>}
                                                    description={
                                                        <div>
                                                            <div>Tổng nội dung: <Tag color="purple">{item.approvedContent}</Tag></div>
                                                            <div style={{ fontSize: 11, color: 'var(--color-text-disabled)' }}>
                                                                Exams: {item.exams} | Tests: {item.tests} | Lessons: {item.lessons} | Topics: {item.topics}
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Alert
                                        message="Chưa có dữ liệu"
                                        description="Chưa có giáo viên tạo nội dung"
                                        type="info"
                                        showIcon
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                {/* Content Tab */}
                <TabPane tab={<span><BookOutlined /> Nội dung phổ biến</span>} key="content">
                    {/* Top Content Chart */}
                    {topContent.length > 0 && (
                        <Card 
                            title={
                                <span>
                                    <BarChartOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
                                    Biểu đồ Top 10 nội dung phổ biến
                                </span>
                            }
                            bordered={false} 
                            style={{ borderRadius: 8, marginBottom: 16 }}
                        >
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={topContentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="name" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={100}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar 
                                        dataKey="completions" 
                                        fill="var(--color-primary)" 
                                        name="Lượt hoàn thành"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    )}

                    <Card title={<span><StarOutlined /> Top nội dung được hoàn thành nhiều nhất</span>} bordered={false} style={{ borderRadius: 8 }}>
                        {topContent && topContent.length > 0 ? (
                            <Table
                                dataSource={topContent}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                columns={[
                                    {
                                        title: '#',
                                        key: 'rank',
                                        width: 60,
                                        render: (text, record, index) => (
                                            <Avatar style={{ 
                                                backgroundColor: index < 3 ? '#ffd700' : 'var(--color-primary)',
                                                fontWeight: 'bold'
                                            }}>
                                                {index + 1}
                                            </Avatar>
                                        )
                                    },
                                    {
                                        title: 'Tiêu đề',
                                        dataIndex: 'title',
                                        key: 'title',
                                        render: (text, record) => (
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{text}</div>
                                                <Tag color={record.type === 'Full Test' ? 'blue' : 'green'}>
                                                    {record.type}
                                                </Tag>
                                            </div>
                                        )
                                    },
                                    {
                                        title: 'Tác giả',
                                        dataIndex: 'author',
                                        key: 'author',
                                        render: (author) => (
                                            <Tag color="purple">{author}</Tag>
                                        )
                                    },
                                    {
                                        title: 'Lượt hoàn thành',
                                        dataIndex: 'completions',
                                        key: 'completions',
                                        render: (completions) => (
                                            <Tag color="success" style={{ fontSize: 14, fontWeight: 'bold' }}>
                                                <CheckCircleOutlined /> {formatNumber(completions)}
                                            </Tag>
                                        ),
                                        sorter: (a, b) => a.completions - b.completions,
                                        defaultSortOrder: 'descend'
                                    }
                                ]}
                            />
                        ) : (
                            <Alert
                                message="Chưa có dữ liệu"
                                description="Chưa có nội dung nào được hoàn thành"
                                type="info"
                                showIcon
                            />
                        )}
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Dashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tabs, Table, Tag, Select, Spin, Alert, Breadcrumb } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  HomeOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import teacherDashboardService from '../../../services/teacherDashboardService';
import './style.css';

const { TabPane } = Tabs;
const { Option } = Select;

const TeacherDashboard = () => {
  // State for 3 core dashboard data
  const [stats, setStats] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [contentPerformance, setContentPerformance] = useState([]);
  
  // Filters for content list
  const [contentFilters, setContentFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    type: 'all'
  });
  const [pagination, setPagination] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch content list only
  const fetchContentList = useCallback(async () => {
    try {
      const response = await teacherDashboardService.getContentList(contentFilters);
      setContentList(response.content || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching content list:', error);
    }
  }, [contentFilters]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const results = await Promise.allSettled([
        teacherDashboardService.getStats(),
        teacherDashboardService.getContentList(contentFilters),
        teacherDashboardService.getContentPerformance(10),
      ]);

      // Handle stats
      if (results[0].status === 'fulfilled') {
        setStats(results[0].value);
      } else {
        console.error('Error fetching stats:', results[0].reason);
      }

      // Handle content list
      if (results[1].status === 'fulfilled') {
        setContentList(results[1].value.content || []);
        setPagination(results[1].value.pagination || null);
      } else {
        console.error('Error fetching content list:', results[1].reason);
      }

      // Handle content performance
      if (results[2].status === 'fulfilled') {
        setContentPerformance(results[2].value || []);
      } else {
        console.error('Error fetching content performance:', results[2].reason);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contentFilters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch content list when filters change
  useEffect(() => {
    if (!isLoading) {
      fetchContentList();
    }
  }, [contentFilters, isLoading, fetchContentList]);

  // Helper function to format numbers
  const formatNumber = (num) => {
    return num?.toLocaleString('vi-VN') || '0';
  };

  // Colors for charts
  const CHART_COLORS = {
    primary: ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', 'var(--color-chart-4)'],
    status: {
      approved: 'var(--color-success)',
      pending: 'var(--color-warning)',
      rejected: 'var(--color-danger)',
      draft: 'var(--color-border)'
    },
    contentType: {
      topics: 'var(--color-primary)',
      lessons: 'var(--color-success)',
      grammars: 'var(--color-chart-4)',
      tests: 'var(--color-chart-6)',
      exams: 'var(--color-chart-5)'
    }
  };

  // Prepare chart data
  const contentTypeChartData = stats ? [
    { name: 'Topics', value: stats.contentByType?.topics || 0, color: CHART_COLORS.contentType.topics },
    { name: 'Lessons', value: stats.contentByType?.lessons || 0, color: CHART_COLORS.contentType.lessons },
    { name: 'Grammars', value: stats.contentByType?.grammars || 0, color: CHART_COLORS.contentType.grammars },
    { name: 'Tests', value: stats.contentByType?.tests || 0, color: CHART_COLORS.contentType.tests },
    { name: 'Exams', value: stats.contentByType?.exams || 0, color: CHART_COLORS.contentType.exams }
  ] : [];

  const statusChartData = stats ? [
    { name: 'Đã duyệt', value: stats.statusBreakdown?.approved || 0, color: CHART_COLORS.status.approved },
    { name: 'Chờ duyệt', value: stats.statusBreakdown?.pending || 0, color: CHART_COLORS.status.pending },
    { name: 'Bị từ chối', value: stats.statusBreakdown?.rejected || 0, color: CHART_COLORS.status.rejected },
    { name: 'Bản nháp', value: stats.statusBreakdown?.draft || 0, color: CHART_COLORS.status.draft }
  ] : [];

  const performanceChartData = contentPerformance.slice(0, 10).map(item => ({
    name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
    completions: item.completions,
    avgScore: item.avgScore || 0
  }));

  // Radar chart data for content quality assessment
  const contentQualityData = stats ? [
    {
      metric: 'Topics',
      value: stats.contentByType?.topics || 0,
      fullMark: Math.max(
        stats.contentByType?.topics || 0,
        stats.contentByType?.lessons || 0,
        stats.contentByType?.grammars || 0,
        stats.contentByType?.tests || 0,
        stats.contentByType?.exams || 0
      ) * 1.2
    },
    {
      metric: 'Lessons',
      value: stats.contentByType?.lessons || 0,
      fullMark: Math.max(
        stats.contentByType?.topics || 0,
        stats.contentByType?.lessons || 0,
        stats.contentByType?.grammars || 0,
        stats.contentByType?.tests || 0,
        stats.contentByType?.exams || 0
      ) * 1.2
    },
    {
      metric: 'Grammars',
      value: stats.contentByType?.grammars || 0,
      fullMark: Math.max(
        stats.contentByType?.topics || 0,
        stats.contentByType?.lessons || 0,
        stats.contentByType?.grammars || 0,
        stats.contentByType?.tests || 0,
        stats.contentByType?.exams || 0
      ) * 1.2
    },
    {
      metric: 'Tests',
      value: stats.contentByType?.tests || 0,
      fullMark: Math.max(
        stats.contentByType?.topics || 0,
        stats.contentByType?.lessons || 0,
        stats.contentByType?.grammars || 0,
        stats.contentByType?.tests || 0,
        stats.contentByType?.exams || 0
      ) * 1.2
    },
    {
      metric: 'Exams',
      value: stats.contentByType?.exams || 0,
      fullMark: Math.max(
        stats.contentByType?.topics || 0,
        stats.contentByType?.lessons || 0,
        stats.contentByType?.grammars || 0,
        stats.contentByType?.tests || 0,
        stats.contentByType?.exams || 0
      ) * 1.2
    }
  ] : [];

  // Combined chart data for overview
  const combinedOverviewData = stats ? [
    {
      category: 'Topics',
      approved: Math.round((stats.contentByType?.topics || 0) * (stats.approvalRate || 0) / 100),
      pending: Math.round((stats.contentByType?.topics || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.6),
      rejected: Math.round((stats.contentByType?.topics || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.4),
      total: stats.contentByType?.topics || 0
    },
    {
      category: 'Lessons',
      approved: Math.round((stats.contentByType?.lessons || 0) * (stats.approvalRate || 0) / 100),
      pending: Math.round((stats.contentByType?.lessons || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.6),
      rejected: Math.round((stats.contentByType?.lessons || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.4),
      total: stats.contentByType?.lessons || 0
    },
    {
      category: 'Grammars',
      approved: Math.round((stats.contentByType?.grammars || 0) * (stats.approvalRate || 0) / 100),
      pending: Math.round((stats.contentByType?.grammars || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.6),
      rejected: Math.round((stats.contentByType?.grammars || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.4),
      total: stats.contentByType?.grammars || 0
    },
    {
      category: 'Tests',
      approved: Math.round((stats.contentByType?.tests || 0) * (stats.approvalRate || 0) / 100),
      pending: Math.round((stats.contentByType?.tests || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.6),
      rejected: Math.round((stats.contentByType?.tests || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.4),
      total: stats.contentByType?.tests || 0
    },
    {
      category: 'Exams',
      approved: Math.round((stats.contentByType?.exams || 0) * (stats.approvalRate || 0) / 100),
      pending: Math.round((stats.contentByType?.exams || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.6),
      rejected: Math.round((stats.contentByType?.exams || 0) * ((100 - (stats.approvalRate || 0)) / 100) * 0.4),
      total: stats.contentByType?.exams || 0
    }
  ] : [];

  // Performance insights
  const performanceInsights = {
    totalCompletions: contentPerformance.reduce((sum, item) => sum + item.completions, 0),
    avgAllScores: contentPerformance.length > 0 
      ? Math.round(contentPerformance.reduce((sum, item) => sum + (item.avgScore || 0), 0) / contentPerformance.length)
      : 0,
    topPerformer: contentPerformance[0] || null,
    lowPerformer: contentPerformance[contentPerformance.length - 1] || null
  };

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

  // Get status tag color
  const getStatusColor = (status) => {
    const colors = {
      approved: 'success',
      pending: 'processing',
      rejected: 'error',
      draft: 'default'
    };
    return colors[status] || 'default';
  };

  // Get status text
  const getStatusText = (status) => {
    const texts = {
      approved: 'Đã duyệt',
      pending: 'Chờ duyệt',
      rejected: 'Bị từ chối',
      draft: 'Bản nháp'
    };
    return texts[status] || status;
  };

  // Handle content filter change
  const handleFilterChange = (key, value) => {
    setContentFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when filter changes
    }));
  };

  // Content list table columns
  const contentColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: '15%',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'approvedAt',
      key: 'approvedAt',
      width: '15%',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    }
  ];

  // Performance table columns
  const performanceColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: '8%',
      render: (_, __, index) => (
        <span style={{ fontWeight: 'bold', color: index < 3 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>
          #{index + 1}
        </span>
      )
    },
    {
      title: 'Bài thi',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type) => (
        <Tag color={type === 'Full Test' ? 'purple' : 'blue'}>{type}</Tag>
      )
    },
    {
      title: 'Lượt hoàn thành',
      dataIndex: 'completions',
      key: 'completions',
      width: '15%',
      render: (count) => (
        <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
          {formatNumber(count)}
        </span>
      ),
      sorter: (a, b) => a.completions - b.completions,
    },
    {
      title: 'Điểm TB',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: '12%',
      render: (score) => (
        <span style={{ fontWeight: 'bold', color: score >= 700 ? 'var(--color-success)' : 'var(--color-warning)' }}>
          {score || 0}
        </span>
      ),
      sorter: (a, b) => a.avgScore - b.avgScore,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '12%',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
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
            <span style={{ color: 'var(--color-bg-primary)', fontWeight: 700, fontSize: 22 }}>Teacher Dashboard</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>


      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Total Content */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              height: '100%',
              background: 'var(--color-bg-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Tổng nội dung</span>}
              value={stats?.totalContent || 0}
              prefix={<FileTextOutlined style={{ color: 'var(--color-primary)' }} />}
              valueStyle={{ color: 'var(--color-primary)', fontSize: 28, fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
          </Card>
        </Col>

        {/* Approved Content */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              height: '100%',
              background: 'var(--color-bg-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Đã duyệt</span>}
              value={stats?.approvedContent || 0}
              prefix={<CheckCircleOutlined style={{ color: 'var(--color-success)' }} />}
              valueStyle={{ color: 'var(--color-success)', fontSize: 28, fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-disabled)', height: 20 }}>
              Tỷ lệ: {stats?.approvalRate || 0}%
            </div>
          </Card>
        </Col>

        {/* Pending Approvals */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              height: '100%',
              background: 'var(--color-bg-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Chờ duyệt</span>}
              value={stats?.pendingApprovals || 0}
              prefix={<ClockCircleOutlined style={{ color: 'var(--color-warning)' }} />}
              valueStyle={{ color: 'var(--color-warning)', fontSize: 28, fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
          </Card>
        </Col>

        {/* Rejected Content */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              height: '100%',
              background: 'var(--color-bg-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Bị từ chối</span>}
              value={stats?.rejectedContent || 0}
              prefix={<CloseCircleOutlined style={{ color: 'var(--color-danger)' }} />}
              valueStyle={{ color: 'var(--color-danger)', fontSize: 28, fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 8, height: 20 }}>&nbsp;</div>
          </Card>
        </Col>
      </Row>

      {/* Content Overview - Advanced Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Combined Stacked Bar Chart */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <BarChartOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
                Phân tích nội dung theo loại & trạng thái
              </span>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={combinedOverviewData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Bar dataKey="approved" stackId="a" fill="var(--color-success)" name="Đã duyệt" />
                <Bar dataKey="pending" stackId="a" fill="var(--color-warning)" name="Chờ duyệt" />
                <Bar dataKey="rejected" stackId="a" fill="var(--color-danger)" name="Bị từ chối" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Radar Chart for Content Balance */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <PieChartOutlined style={{ marginRight: 8, color: 'var(--color-chart-4)' }} />
                Cân bằng nội dung
              </span>
            }
            style={{ height: '100%' }}
          >
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={contentQualityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                <Radar 
                  name="Số lượng" 
                  dataKey="value" 
                  stroke="var(--color-primary)" 
                  fill="var(--color-primary)" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>
              Biểu đồ radar giúp đánh giá sự cân bằng giữa các loại nội dung
            </div>
          </Card>
        </Col>
      </Row>

      {/* Performance Insights */}
      {contentPerformance.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card 
              title={
                <span>
                  <TrophyOutlined style={{ marginRight: 8, color: 'var(--color-warning)' }} />
                  Insights hiệu suất
                </span>
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Tổng lượt hoàn thành"
                    value={performanceInsights.totalCompletions}
                    prefix={<CheckCircleOutlined style={{ color: 'var(--color-success)' }} />}
                    valueStyle={{ color: 'var(--color-success)', fontSize: 24 }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Điểm TB tất cả bài thi"
                    value={performanceInsights.avgAllScores}
                    suffix="/ 990"
                    prefix={<RiseOutlined style={{ color: 'var(--color-primary)' }} />}
                    valueStyle={{ color: 'var(--color-primary)', fontSize: 24 }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Bài thi phổ biến nhất</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {performanceInsights.topPerformer?.title?.substring(0, 30) || 'N/A'}
                      {performanceInsights.topPerformer?.title?.length > 30 ? '...' : ''}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 4 }}>
                      {performanceInsights.topPerformer?.completions || 0} lượt hoàn thành
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Điểm TB cao nhất</div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {contentPerformance.reduce((max, item) => 
                        item.avgScore > max.avgScore ? item : max
                      , contentPerformance[0])?.title?.substring(0, 30) || 'N/A'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-disabled)', marginTop: 4 }}>
                      {contentPerformance.reduce((max, item) => 
                        item.avgScore > max.avgScore ? item : max
                      , contentPerformance[0])?.avgScore || 0} điểm
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs: Content List & Performance */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Detailed Analysis Tab */}
          <TabPane 
            tab={
              <span>
                <PieChartOutlined />
                Phân tích chi tiết
              </span>
            } 
            key="analysis"
          >
            <Row gutter={[16, 16]}>
              {/* Pie Charts Side by Side */}
              <Col xs={24} lg={12}>
                <Card title="Phân bố nội dung theo loại" bordered={false}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={contentTypeChartData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentTypeChartData.map((entry, index) => (
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

              <Col xs={24} lg={12}>
                <Card title="Phân bố theo trạng thái" bordered={false}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
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
          </TabPane>

          {/* Content List Tab */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Danh sách nội dung
              </span>
            } 
            key="content"
          >
            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <span style={{ marginRight: 8 }}>Trạng thái:</span>
                <Select
                  value={contentFilters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="pending">Chờ duyệt</Option>
                  <Option value="rejected">Bị từ chối</Option>
                  <Option value="draft">Bản nháp</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <span style={{ marginRight: 8 }}>Loại:</span>
                <Select
                  value={contentFilters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="topic">Topic</Option>
                  <Option value="lesson">Lesson</Option>
                  <Option value="grammar">Grammar</Option>
                  <Option value="test">Test</Option>
                  <Option value="exam">Exam</Option>
                </Select>
              </Col>
            </Row>

            <Table
              columns={contentColumns}
              dataSource={contentList}
              rowKey="id"
              pagination={{
                current: contentFilters.page,
                pageSize: contentFilters.limit,
                total: pagination?.total || 0,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} mục`,
                onChange: (page, pageSize) => {
                  handleFilterChange('page', page);
                  if (pageSize !== contentFilters.limit) {
                    handleFilterChange('limit', pageSize);
                  }
                }
              }}
              locale={{
                emptyText: (
                  <Alert
                    message="Chưa có nội dung"
                    description="Bạn chưa tạo nội dung nào. Hãy bắt đầu tạo nội dung mới!"
                    type="info"
                    showIcon
                  />
                )
              }}
            />
          </TabPane>

          {/* Performance Tab */}
          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Hiệu suất nội dung
              </span>
            } 
            key="performance"
          >
            {contentPerformance.length > 0 ? (
              <>
                <Alert
                  message="Thống kê hiệu suất"
                  description="Danh sách các bài thi (Exams) được sắp xếp theo số lượt hoàn thành. Dữ liệu này giúp bạn đánh giá độ phổ biến của nội dung."
                  type="info"
                  showIcon
                  icon={<RiseOutlined />}
                  style={{ marginBottom: 16 }}
                />

                {/* Performance Chart */}
                <Card 
                  title={
                    <span>
                      <BarChartOutlined style={{ marginRight: 8, color: 'var(--color-primary)' }} />
                      Biểu đồ hiệu suất Top 10
                    </span>
                  }
                  style={{ marginBottom: 16 }}
                >
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={performanceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary)" />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" />
                      <Tooltip />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar 
                        yAxisId="left" 
                        dataKey="completions" 
                        fill="var(--color-primary)" 
                        name="Lượt hoàn thành"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="avgScore" 
                        fill="var(--color-success)" 
                        name="Điểm trung bình"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Table
                  columns={performanceColumns}
                  dataSource={contentPerformance}
                  rowKey="id"
                  pagination={false}
                  locale={{
                    emptyText: 'Chưa có dữ liệu hiệu suất'
                  }}
                />
              </>
            ) : (
              <Alert
                message="Chưa có dữ liệu hiệu suất"
                description="Chưa có bài thi nào được học viên hoàn thành. Hãy tiếp tục tạo và chia sẻ nội dung!"
                type="info"
                showIcon
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TeacherDashboard;

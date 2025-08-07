import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Tabs,
  Progress,
  Button,
  Modal,
  Statistic,
  Tag,
  Timeline,
  Space,
  Typography,
  Badge,
  Tooltip,
  Divider,
  Avatar,
  List,
} from "antd";
import {
  Trophy,
  CheckCircle,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Gift,
  Star,
  Award,
  BookOpen,
  Headphones,
  FileText,
  BookMarked,
  BarChart3,
  Zap,
  Crown,
  Timer,
  Users,
  ChevronRight,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completedChallenges: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  // Mock data for challenges
  useEffect(() => {
    const mockChallenges = [
      {
        id: 1,
        title: "Nghe 10 đoạn hội thoại",
        description: "Hoàn thành 10 bài nghe Part 3 trong ngày hôm nay",
        type: "daily",
        category: "listening",
        difficulty: "easy",
        points: 50,
        target: 10,
        current: 0,
        timeLimit: 24 * 60 * 60 * 1000, // 24 hours
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icon: <Headphones size={24} />,
        requirements: [
          "Hoàn thành 10 bài nghe Part 3",
          "Đạt tối thiểu 70% điểm",
          "Trong vòng 24 giờ",
        ],
        rewards: [
          "50 điểm kinh nghiệm",
          'Huy hiệu "Listener"',
          "Unlock bài học mới",
        ],
      },
      {
        id: 2,
        title: "Streak Master",
        description: "Học liên tục 7 ngày không nghỉ",
        type: "weekly",
        category: "general",
        difficulty: "medium",
        points: 200,
        target: 7,
        current: 3,
        timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        icon: <Flame size={24} />,
        requirements: [
          "Đăng nhập mỗi ngày",
          "Hoàn thành ít nhất 1 bài tập",
          "Liên tục 7 ngày",
        ],
        rewards: [
          "200 điểm kinh nghiệm",
          'Huy hiệu "Streak Master"',
          "Premium content access",
        ],
      },
      {
        id: 3,
        title: "Vocabulary Champion",
        description: "Học thuộc 100 từ vựng mới trong tháng",
        type: "monthly",
        category: "vocabulary",
        difficulty: "hard",
        points: 500,
        target: 100,
        current: 35,
        timeLimit: 30 * 24 * 60 * 60 * 1000, // 30 days
        startDate: new Date(2024, 11, 1), // December 1, 2024
        endDate: new Date(2024, 11, 31), // December 31, 2024
        icon: <BookMarked size={24} />,
        requirements: [
          "Học 100 từ vựng mới",
          "Đạt 80% trong quiz",
          "Trong vòng 30 ngày",
        ],
        rewards: [
          "500 điểm kinh nghiệm",
          'Huy hiệu "Vocabulary Master"',
          "Exclusive vocabulary pack",
        ],
      },
      {
        id: 4,
        title: "Grammar Guru",
        description: "Hoàn thành 50 câu hỏi ngữ pháp với độ chính xác 90%",
        type: "weekly",
        category: "grammar",
        difficulty: "medium",
        points: 150,
        target: 50,
        current: 22,
        timeLimit: 7 * 24 * 60 * 60 * 1000,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        icon: <FileText size={24} />,
        requirements: [
          "Hoàn thành 50 câu hỏi ngữ pháp",
          "Đạt độ chính xác 90%",
          "Trong vòng 7 ngày",
        ],
        rewards: [
          "150 điểm kinh nghiệm",
          'Huy hiệu "Grammar Guru"',
          "Advanced grammar lessons",
        ],
      },
      {
        id: 5,
        title: "Reading Marathon",
        description: "Đọc hiểu 20 đoạn văn trong ngày",
        type: "daily",
        category: "reading",
        difficulty: "easy",
        points: 75,
        target: 20,
        current: 5,
        timeLimit: 24 * 60 * 60 * 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icon: <BookOpen size={24} />,
        requirements: [
          "Hoàn thành 20 bài đọc hiểu",
          "Đạt tối thiểu 75% điểm",
          "Trong vòng 24 giờ",
        ],
        rewards: [
          "75 điểm kinh nghiệm",
          'Huy hiệu "Speed Reader"',
          "Reading tips & tricks",
        ],
      },
      {
        id: 6,
        title: "Perfect Score",
        description: "Đạt điểm tuyệt đối trong 3 bài test liên tiếp",
        type: "special",
        category: "test",
        difficulty: "hard",
        points: 1000,
        target: 3,
        current: 1,
        timeLimit: null, // No time limit
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: null,
        icon: <Crown size={24} />,
        requirements: [
          "Đạt 100% trong 3 bài test",
          "Các bài test phải liên tiếp",
          "Không giới hạn thời gian",
        ],
        rewards: [
          "1000 điểm kinh nghiệm",
          'Huy hiệu "Perfect Master"',
          "VIP status + all features",
        ],
      },
    ];

    setChallenges(mockChallenges);

    // Mock user challenge progress
    setUserChallenges([1, 2, 3, 4, 5, 6]); // User has joined all challenges

    setUserStats({
      totalPoints: 1250,
      completedChallenges: 8,
      currentStreak: 5,
      longestStreak: 12,
    });
  }, []);

  const filteredChallenges = challenges.filter((challenge) => {
    if (activeTab === "special") return challenge.type === "special";
    return challenge.type === activeTab;
  });

  const joinChallenge = (challengeId) => {
    setUserChallenges((prev) => [...prev, challengeId]);
  };

  const leaveChallenge = (challengeId) => {
    setUserChallenges((prev) => prev.filter((id) => id !== challengeId));
  };

  const openChallengeModal = (challenge) => {
    setSelectedChallenge(challenge);
    setShowModal(true);
  };

  const updateChallengeProgress = (challengeId, increment = 1) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId
          ? {
              ...challenge,
              current: Math.min(
                challenge.target,
                challenge.current + increment
              ),
            }
          : challenge
      )
    );
  };

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return "Không giới hạn";

    const now = new Date();
    const remaining = endDate - now;

    if (remaining <= 0) return "Đã hết hạn";

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "success",
      medium: "warning",
      hard: "error",
    };
    return colors[difficulty] || "default";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      listening: <Headphones size={16} />,
      reading: <BookOpen size={16} />,
      grammar: <FileText size={16} />,
      vocabulary: <BookMarked size={16} />,
      test: <BarChart3 size={16} />,
      general: <Target size={16} />,
    };
    return icons[category] || <Target size={16} />;
  };

  const getProgress = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  const isCompleted = (challenge) => {
    return challenge.current >= challenge.target;
  };

  const isExpired = (challenge) => {
    return challenge.endDate && new Date() > challenge.endDate;
  };

  const getStatusColor = (challenge) => {
    if (isCompleted(challenge)) return "success";
    if (isExpired(challenge)) return "error";
    return "processing";
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <Gift size={32} color="#1890ff" />
          Thử thách TOEIC
        </Title>
        <Paragraph style={{ fontSize: "16px", color: "#666", marginBottom: 0 }}>
          Hoàn thành các thử thách để nhận điểm thưởng và mở khóa thành tích đặc
          biệt!
        </Paragraph>
      </div>

      {/* User Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng điểm"
              value={userStats.totalPoints}
              prefix={<Trophy size={20} color="#faad14" />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={userStats.completedChallenges}
              prefix={<CheckCircle size={20} color="#52c41a" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Streak hiện tại"
              value={userStats.currentStreak}
              prefix={<Flame size={20} color="#ff4d4f" />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Streak tối đa"
              value={userStats.longestStreak}
              prefix={<TrendingUp size={20} color="#1890ff" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Challenges Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane
            tab={
              <span>
                <Calendar size={16} style={{ marginRight: "8px" }} />
                Hàng ngày
              </span>
            }
            key="daily"
          />
          <TabPane
            tab={
              <span>
                <Calendar size={16} style={{ marginRight: "8px" }} />
                Hàng tuần
              </span>
            }
            key="weekly"
          />
          <TabPane
            tab={
              <span>
                <Calendar size={16} style={{ marginRight: "8px" }} />
                Hàng tháng
              </span>
            }
            key="monthly"
          />
          <TabPane
            tab={
              <span>
                <Star size={16} style={{ marginRight: "8px" }} />
                Đặc biệt
              </span>
            }
            key="special"
          />
        </Tabs>

        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          {filteredChallenges.map((challenge) => (
            <Col xs={24} sm={12} lg={8} key={challenge.id}>
              <Card
                hoverable
                style={{
                  height: "100%",
                  border: isCompleted(challenge)
                    ? "2px solid #52c41a"
                    : isExpired(challenge)
                    ? "2px solid #ff4d4f"
                    : "1px solid #d9d9d9",
                }}
                bodyStyle={{ padding: "20px" }}
              >
                {/* Challenge Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: isCompleted(challenge)
                          ? "#52c41a"
                          : "#1890ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {challenge.icon}
                    </Avatar>
                    <div>
                      <Tag
                        color={getDifficultyColor(challenge.difficulty)}
                        style={{ marginBottom: "4px" }}
                      >
                        {challenge.difficulty}
                      </Tag>
                      <br />
                      <Tag
                        icon={getCategoryIcon(challenge.category)}
                        color="blue"
                      >
                        {challenge.category}
                      </Tag>
                    </div>
                  </div>
                  <Badge
                    status={getStatusColor(challenge)}
                    text={
                      isCompleted(challenge)
                        ? "Hoàn thành"
                        : isExpired(challenge)
                        ? "Hết hạn"
                        : "Đang tiến hành"
                    }
                  />
                </div>

                {/* Challenge Content */}
                <Title level={4} style={{ marginBottom: "8px" }}>
                  {challenge.title}
                </Title>
                <Paragraph style={{ color: "#666", marginBottom: "16px" }}>
                  {challenge.description}
                </Paragraph>

                {/* Progress */}
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Text>
                      Tiến độ: {challenge.current}/{challenge.target}
                    </Text>
                    <Text strong>
                      {Math.round(
                        getProgress(challenge.current, challenge.target)
                      )}
                      %
                    </Text>
                  </div>
                  <Progress
                    percent={getProgress(challenge.current, challenge.target)}
                    status={isCompleted(challenge) ? "success" : "active"}
                    strokeColor={isCompleted(challenge) ? "#52c41a" : "#1890ff"}
                  />
                </div>

                {/* Challenge Info */}
                <Space
                  direction="vertical"
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>
                      <Gift size={14} style={{ marginRight: "4px" }} />
                      Phần thưởng:
                    </Text>
                    <Text strong style={{ color: "#faad14" }}>
                      {challenge.points} điểm
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text>
                      <Timer size={14} style={{ marginRight: "4px" }} />
                      Thời hạn:
                    </Text>
                    <Text strong style={{ color: "#ff4d4f" }}>
                      {formatTimeRemaining(challenge.endDate)}
                    </Text>
                  </div>
                </Space>

                <Divider style={{ margin: "16px 0" }} />

                {/* Challenge Actions */}
                <Space
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Button
                    type="link"
                    onClick={() => openChallengeModal(challenge)}
                    style={{ padding: 0 }}
                  >
                    Chi tiết <ChevronRight size={14} />
                  </Button>

                  {isCompleted(challenge) ? (
                    <Button
                      type="primary"
                      disabled
                      icon={<CheckCircle size={16} />}
                    >
                      Hoàn thành
                    </Button>
                  ) : isExpired(challenge) ? (
                    <Button danger disabled>
                      Đã hết hạn
                    </Button>
                  ) : userChallenges.includes(challenge.id) ? (
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => updateChallengeProgress(challenge.id)}
                        disabled={challenge.current >= challenge.target}
                        icon={<Zap size={14} />}
                      >
                        +1
                      </Button>
                      <Button
                        size="small"
                        onClick={() => leaveChallenge(challenge.id)}
                      >
                        Rời khỏi
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => joinChallenge(challenge.id)}
                      icon={<Users size={16} />}
                    >
                      Tham gia
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Challenge Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {selectedChallenge?.icon}
            <span>{selectedChallenge?.title}</span>
          </div>
        }
        open={showModal}
        onCancel={() => setShowModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Đóng
          </Button>,
          selectedChallenge &&
            (isCompleted(selectedChallenge) ? (
              <Button
                key="completed"
                type="primary"
                disabled
                icon={<CheckCircle size={16} />}
              >
                Đã hoàn thành
              </Button>
            ) : isExpired(selectedChallenge) ? (
              <Button key="expired" danger disabled>
                Đã hết hạn
              </Button>
            ) : userChallenges.includes(selectedChallenge.id) ? (
              <Button
                key="leave"
                danger
                onClick={() => {
                  leaveChallenge(selectedChallenge.id);
                  setShowModal(false);
                }}
              >
                Rời khỏi thử thách
              </Button>
            ) : (
              <Button
                key="join"
                type="primary"
                onClick={() => {
                  joinChallenge(selectedChallenge.id);
                  setShowModal(false);
                }}
                icon={<Users size={16} />}
              >
                Tham gia thử thách
              </Button>
            )),
        ]}
      >
        {selectedChallenge && (
          <div>
            <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>
              {selectedChallenge.description}
            </Paragraph>

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={12}>
                <Card size="small" title="📋 Yêu cầu">
                  <List
                    size="small"
                    dataSource={selectedChallenge.requirements}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircle
                          size={14}
                          style={{ marginRight: "8px", color: "#52c41a" }}
                        />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="🎁 Phần thưởng">
                  <List
                    size="small"
                    dataSource={selectedChallenge.rewards}
                    renderItem={(item) => (
                      <List.Item>
                        <Gift
                          size={14}
                          style={{ marginRight: "8px", color: "#faad14" }}
                        />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={8}>
                <Statistic title="Loại" value={selectedChallenge.type} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Danh mục"
                  value={selectedChallenge.category}
                  prefix={getCategoryIcon(selectedChallenge.category)}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Độ khó"
                  value={selectedChallenge.difficulty}
                  valueStyle={{
                    color:
                      getDifficultyColor(selectedChallenge.difficulty) ===
                      "success"
                        ? "#52c41a"
                        : getDifficultyColor(selectedChallenge.difficulty) ===
                          "warning"
                        ? "#faad14"
                        : "#ff4d4f",
                  }}
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
              <Col span={12}>
                <Statistic
                  title="Điểm thưởng"
                  value={selectedChallenge.points}
                  prefix={<Trophy size={16} color="#faad14" />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Thời hạn"
                  value={formatTimeRemaining(selectedChallenge.endDate)}
                  prefix={<Timer size={16} color="#ff4d4f" />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
            </Row>

            <Card title="📊 Tiến độ hiện tại" size="small">
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text>
                    Hoàn thành: {selectedChallenge.current}/
                    {selectedChallenge.target}
                  </Text>
                  <Text strong>
                    {Math.round(
                      getProgress(
                        selectedChallenge.current,
                        selectedChallenge.target
                      )
                    )}
                    %
                  </Text>
                </div>
                <Progress
                  percent={getProgress(
                    selectedChallenge.current,
                    selectedChallenge.target
                  )}
                  status={isCompleted(selectedChallenge) ? "success" : "active"}
                  strokeColor={
                    isCompleted(selectedChallenge) ? "#52c41a" : "#1890ff"
                  }
                  strokeWidth={10}
                />
              </div>

              {userChallenges.includes(selectedChallenge.id) &&
                !isCompleted(selectedChallenge) &&
                !isExpired(selectedChallenge) && (
                  <Button
                    type="primary"
                    onClick={() =>
                      updateChallengeProgress(selectedChallenge.id)
                    }
                    disabled={
                      selectedChallenge.current >= selectedChallenge.target
                    }
                    icon={<Zap size={16} />}
                    block
                  >
                    Cập nhật tiến độ (+1)
                  </Button>
                )}
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Challenges;

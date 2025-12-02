"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Tag,
  Card,
  Pagination,
  Spin,
  Empty,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Select,
  Breadcrumb,
  Avatar,
  Rate,
  Image,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  EyeOutlined,
  DownloadOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  BookOpen,
  Headphones,
  FileText,
  Download,
  Eye,
  Clock,
  Award,
} from "lucide-react";

import freeMaterialService from "../../../services/freeMaterialService";
import lessonService from "../../../services/lessonService";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const LearningMaterialsAntd = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const materialsPerPage = 12;

  const popularTags = [
    "Listening",
    "Reading",
    "Grammar",
    "Vocabulary",
    "Part 1",
    "Part 2",
    "Part 3",
    "Part 4",
    "Part 5",
    "Part 6",
    "Part 7",
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      let mergedData = [];

      if (activeFilter === "lessons") {
        response = await lessonService.all();
        console.log("🚀 ~ fetchMaterials ~ lessons response:", response);

        const lessons = Array.isArray(response)
          ? response
          : response.data || [];
        mergedData = lessons.map((lesson) => ({
          ...lesson,
          id: lesson._id,
          title: lesson.lessonName || "Bài học TOEIC",
          description:
            lesson.lessonDescription || "Bài học TOEIC chất lượng cao",
          createdAt: lesson.createdAt || new Date().toISOString(),
          updatedAt: lesson.updatedAt || new Date().toISOString(),
          imageUrl: lesson.imageUrl || null,
          tags: lesson.tags || ["TOEIC", "Reading"],
          difficulty: lesson.difficulty || "Intermediate",
          category: lesson.category || "Reading",
          type: "lesson",
          isPremium: !!lesson.isPremium,
          views: lesson.views || Math.floor(Math.random() * 1000) + 100,
          downloads: lesson.downloads || Math.floor(Math.random() * 500) + 50,
          rating: lesson.rating || (4 + Math.random()).toFixed(1),
          author: lesson.author || "TOEIC Master",
          estimatedTime: "45 phút",
        }));
      } else if (activeFilter === "free-materials") {
        response = await freeMaterialService.allActive();
        console.log("🚀 ~ fetchMaterials ~ freeMaterials response:", response);
        const materials = Array.isArray(response)
          ? response
          : response.data || [];
        mergedData = materials.map((material) => ({
          ...material,
          id: material._id || material.id,
          title: material.title || "Tài liệu TOEIC",
          description:
            material.description ||
            material.shortDescription ||
            "Tài liệu học tập TOEIC miễn phí",
          createdAt: material.createdAt || new Date().toISOString(),
          updatedAt: material.updatedAt || new Date().toISOString(),
          imageUrl: material.imageUrl || null,
          tags: material.tags || ["TOEIC", "Vocabulary"],
          difficulty: material.difficulty || "Beginner",
          category: material.category || "Vocabulary",
          type: "material",
          isPremium: !!material.isPremium,
          views: material.views || Math.floor(Math.random() * 1000) + 100,
          downloads: material.downloads || Math.floor(Math.random() * 500) + 50,
          rating: material.rating || (4 + Math.random()).toFixed(1),
          author: material.author || "TOEIC Expert",
          estimatedTime: "30 phút",
        }));
      } else {
        // Fetch both lessons and materials
        const [lessonResponse, materialResponse] = await Promise.all([
          lessonService.all(),
          freeMaterialService.allActive(),
        ]);

        console.log("🚀 ~ fetchMaterials ~ lessonResponse:", lessonResponse);
        console.log(
          "🚀 ~ fetchMaterials ~ materialResponse:",
          materialResponse
        );

        // Extract lessons data - lessonResponse trả về trực tiếp array
        const lessons = Array.isArray(lessonResponse)
          ? lessonResponse
          : lessonResponse.data || [];

        // Extract materials data - materialResponse trả về array trong data
        const materials = Array.isArray(materialResponse)
          ? materialResponse
          : materialResponse.data || [];

        const normalizedLessons = lessons.map((lesson) => ({
          ...lesson,
          id: lesson._id || lesson.id,
          title: lesson.lessonName || "Bài học TOEIC",
          description:
            lesson.lessonDescription || "Bài học TOEIC chất lượng cao",
          createdAt: lesson.createdAt || new Date().toISOString(),
          updatedAt: lesson.updatedAt || new Date().toISOString(),
          imageUrl: lesson.imageUrl || null,
          tags: lesson.tags || ["TOEIC", "Reading"],
          difficulty: lesson.difficulty || "Intermediate",
          category: lesson.category || "Reading",
          type: "lesson",
          isPremium: !!lesson.isPremium,
          views: lesson.views || Math.floor(Math.random() * 1000) + 100,
          downloads: lesson.downloads || Math.floor(Math.random() * 500) + 50,
          rating: lesson.rating || (4 + Math.random()).toFixed(1),
          author: lesson.author || "TOEIC Master",
          estimatedTime: "45 phút",
        }));

        const normalizedMaterials = materials.map((material) => ({
          ...material,
          id: material._id || material.id,
          title: material.title || "Tài liệu TOEIC",
          description:
            material.description ||
            material.shortDescription ||
            "Tài liệu học tập TOEIC miễn phí",
          createdAt: material.createdAt || new Date().toISOString(),
          updatedAt: material.updatedAt || new Date().toISOString(),
          imageUrl: material.imageUrl || null,
          tags: material.tags || ["TOEIC", "Vocabulary"],
          difficulty: material.difficulty || "Beginner",
          category: material.category || "Vocabulary",
          type: "material",
          isPremium: !!material.isPremium,
          views: material.views || Math.floor(Math.random() * 1000) + 100,
          downloads: material.downloads || Math.floor(Math.random() * 500) + 50,
          rating: material.rating || (4 + Math.random()).toFixed(1),
          author: material.author || "TOEIC Expert",
          estimatedTime: "30 phút",
        }));

        mergedData = [...normalizedLessons, ...normalizedMaterials];
      }

      // Apply tag filtering
      let filteredMaterials = mergedData;
      if (activeTags.length > 0) {
        filteredMaterials = filteredMaterials.filter(
          (item) =>
            item.tags && item.tags.some((tag) => activeTags.includes(tag))
        );
      }

      // Sort data based on sortBy state
      filteredMaterials = sortMaterials(filteredMaterials, sortBy);

      setMaterials(filteredMaterials);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu học tập:", error);
      toast.error("Không thể tải tài liệu học tập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeTags, sortBy]);

  // Helper function to sort materials
  const sortMaterials = (materials, sortType) => {
    switch (sortType) {
      case "newest":
        return [...materials].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      case "oldest":
        return [...materials].sort(
          (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
        );
      case "popular":
        return [...materials].sort((a, b) => (b.views || 0) - (a.views || 0));
      case "downloads":
        return [...materials].sort(
          (a, b) => (b.downloads || 0) - (a.downloads || 0)
        );
      case "rating":
        return [...materials].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return materials;
    }
  };

  // Helper functions
  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    switch (cat) {
      case "listening":
        return <Headphones style={{ fontSize: "12px" }} />;
      case "reading":
        return <BookOpen style={{ fontSize: "12px" }} />;
      case "grammar":
        return <FileText style={{ fontSize: "12px" }} />;
      case "vocabulary":
        return <BookOutlined style={{ fontSize: "12px" }} />;
      default:
        return <BookOutlined style={{ fontSize: "12px" }} />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "green";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "blue";
    }
  };

  const getDefaultImage = (category, type) => {
    const gradients = {
      listening: "#2C5F8D",
      reading: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      grammar: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      vocabulary: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      default: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    };

    const cat = category?.toLowerCase() || "default";
    const background = gradients[cat] || gradients.default;

    return (
      <div
        style={{
          width: "100%",
          height: "200px",
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px 12px 0 0",
          color: "white",
          fontSize: "32px",
        }}
      >
        {getCategoryIcon(category)}
      </div>
    );
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredMaterials = materials.filter((material) => {
    const name = material.title || "";
    const desc = material.description || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastMaterial = currentPage * materialsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - materialsPerPage;
  const currentMaterials = filteredMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2C5F8D",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            minWidth: "300px",
            borderRadius: "16px",
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Đang tải tài liệu học tập...</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "24px 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              href: "/learner",
              title: <HomeOutlined />,
            },
            {
              title: "Tài liệu học tập",
            },
          ]}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Title
            level={1}
            style={{
              fontSize: "48px",
              marginBottom: 16,
              background: "#2C5F8D",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tài liệu học tập TOEIC
          </Title>
          <Paragraph
            style={{
              fontSize: "18px",
              color: "var(--color-text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Khám phá bộ sưu tập tài liệu TOEIC chất lượng cao với hơn{" "}
            <Text strong style={{ color: "var(--color-brand-purple)" }}>
              1000+
            </Text>{" "}
            tài liệu được biên soạn bởi các chuyên gia hàng đầu
          </Paragraph>
        </div>

        {/* Statistics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={6}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Tài liệu"
                value={materials.length}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Bài học"
                value={materials.filter((m) => m.type === "lesson").length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "var(--color-primary)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Lượt tải"
                value={materials.reduce(
                  (sum, m) => sum + (m.downloads || 0),
                  0
                )}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: "var(--color-chart-4)" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ textAlign: "center", borderRadius: "16px" }}>
              <Statistic
                title="Đánh giá"
                value={4.9}
                suffix="/ 5"
                prefix={<StarOutlined />}
                valueStyle={{ color: "var(--color-warning)" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Card
          style={{
            marginBottom: 32,
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} lg={12}>
              <Input.Search
                placeholder="Tìm kiếm tài liệu, bài học..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                style={{ borderRadius: "12px" }}
              />
            </Col>
            <Col xs={24} lg={12}>
              <Space
                size="middle"
                wrap
                style={{ width: "100%", justifyContent: "flex-end" }}
              >
                <Select
                  value={activeFilter}
                  onChange={handleFilterChange}
                  style={{ minWidth: 150 }}
                  size="large"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="lessons">Bài học</Option>
                  <Option value="free-materials">Tài liệu miễn phí</Option>
                </Select>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ minWidth: 150 }}
                  size="large"
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="oldest">Cũ nhất</Option>
                  <Option value="popular">Phổ biến</Option>
                  <Option value="rating">Đánh giá cao</Option>
                </Select>
              </Space>
            </Col>
          </Row>

          {/* Tags */}
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ marginRight: 16 }}>
              Chủ đề phổ biến:
            </Text>
            <Space wrap>
              {popularTags.map((tag) => (
                <Tag
                  key={tag}
                  color={activeTags.includes(tag) ? "blue" : "default"}
                  style={{
                    cursor: "pointer",
                    borderRadius: "20px",
                    padding: "4px 12px",
                  }}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        </Card>

        {/* Materials Grid */}
        {currentMaterials.length === 0 ? (
          <Card
            style={{
              textAlign: "center",
              borderRadius: "16px",
              padding: "48px",
            }}
          >
            <Empty
              description="Không tìm thấy tài liệu nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              onClick={() => {
                setSearchTerm("");
                setActiveTags([]);
                setActiveFilter("all");
              }}
              style={{ marginTop: 16 }}
            >
              Xóa bộ lọc
            </Button>
          </Card>
        ) : (
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            {currentMaterials.map((material) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={material.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 32px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0, 0, 0, 0.1)";
                  }}
                  cover={
                    material.imageUrl ? (
                      <Image
                        alt={material.title}
                        src={material.imageUrl}
                        style={{ height: 200, objectFit: "cover" }}
                        fallback={getDefaultImage(
                          material.category,
                          material.type
                        )}
                      />
                    ) : (
                      getDefaultImage(material.category, material.type)
                    )
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        navigate(
                          `/learner/materials/${material.id}`
                        )
                      }
                    >
                      Xem chi tiết
                    </Button>,
                    <Button type="text" icon={<HeartOutlined />}>
                      Yêu thích
                    </Button>,
                    <Button type="text" icon={<DownloadOutlined />}>
                      Tải về
                    </Button>,
                  ]}
                >
                  <div style={{ marginBottom: 12 }}>
                    <Space wrap>
                      <Tag
                        color={getDifficultyColor(material.difficulty)}
                        style={{ borderRadius: "12px" }}
                      >
                        {material.difficulty}
                      </Tag>
                      <Tag
                        icon={getCategoryIcon(material.category)}
                        color="blue"
                        style={{ borderRadius: "12px" }}
                      >
                        {material.category}
                      </Tag>
                      {material.isPremium && (
                        <Tag color="gold" style={{ borderRadius: "12px" }}>
                          <Award
                            style={{
                              width: "12px",
                              height: "12px",
                              display: "inline",
                              marginRight: "4px",
                            }}
                          />
                          Premium
                        </Tag>
                      )}
                    </Space>
                  </div>

                  <Title
                    level={4}
                    style={{ marginBottom: 8, fontSize: "16px" }}
                  >
                    {material.title}
                  </Title>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "12px",
                      marginBottom: 12,
                    }}
                  >
                    {material.description}
                  </Paragraph>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Space>
                      <Avatar size="small" icon={<BookOutlined />} />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {material.author}
                      </Text>
                    </Space>
                    <Rate
                      disabled
                      defaultValue={parseFloat(material.rating)}
                      allowHalf
                      style={{ fontSize: "12px" }}
                    />
                  </div>

                  <Row gutter={16}>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Eye
                          style={{
                            width: "16px",
                            height: "16px",
                            margin: "0 auto 4px",
                            color: "var(--color-text-secondary)",
                            display: "block",
                          }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", display: "block" }}
                        >
                          {material.views}
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Download
                          style={{
                            width: "16px",
                            height: "16px",
                            margin: "0 auto 4px",
                            color: "var(--color-text-secondary)",
                            display: "block",
                          }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", display: "block" }}
                        >
                          {material.downloads}
                        </Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Clock
                          style={{
                            width: "16px",
                            height: "16px",
                            margin: "0 auto 4px",
                            color: "var(--color-text-secondary)",
                            display: "block",
                          }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", display: "block" }}
                        >
                          {material.estimatedTime}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination */}
        {filteredMaterials.length > materialsPerPage && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Pagination
              current={currentPage}
              total={filteredMaterials.length}
              pageSize={materialsPerPage}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} tài liệu`
              }
              style={{
                display: "inline-block",
                padding: "16px 24px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default LearningMaterialsAntd;

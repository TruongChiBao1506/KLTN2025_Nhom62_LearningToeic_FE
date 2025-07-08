"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
  Badge,
  Space,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  AudioOutlined,
  BookOutlined,
  TranslationOutlined,
  SoundOutlined,
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilterOutlined,
  CloseOutlined,
  StarOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";

import freeMaterialService from "../../../services/freeMaterialService";
import lessonService from "../../../services/lessonService";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const LearningMaterialsBeautiful = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
        mergedData = Array.isArray(response) ? response : response.data;
        mergedData = mergedData.map((lesson) => ({
          ...lesson,
          type: "lesson",
        }));
      } else if (activeFilter === "free-materials") {
        response = await freeMaterialService.all();
        mergedData = Array.isArray(response) ? response : response.data;
        mergedData = mergedData.map((material) => ({
          ...material,
          type: "material",
        }));
      } else {
        const lessonResponse = await lessonService.all();
        const materialResponse = await freeMaterialService.all();
        const lessons = Array.isArray(lessonResponse)
          ? lessonResponse
          : lessonResponse.data;
        const materials = Array.isArray(materialResponse)
          ? materialResponse
          : materialResponse.data;

        mergedData = [
          ...lessons.map((lesson) => ({
            ...lesson,
            type: "lesson",
          })),
          ...materials.map((material) => ({
            ...material,
            type: "material",
          })),
        ];
      }

      let filteredMaterials = mergedData;
      if (activeTags.length > 0) {
        filteredMaterials = filteredMaterials.filter(
          (material) =>
            material.tags &&
            material.tags.some((tag) => activeTags.includes(tag))
        );
      }

      setMaterials(filteredMaterials);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu học tập:", error);
      toast.error("Không thể tải tài liệu học tập. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeTags]);

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
    const name =
      material.title || material.lessonName || material.materialName || "";
    const desc =
      material.description ||
      material.lessonDescription ||
      material.materialDescription ||
      "";
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

  const getMaterialTypeIcon = (material) => {
    switch (material.category?.toLowerCase()) {
      case "listening":
        return {
          icon: <AudioOutlined />,
          color: "#3b82f6",
          bgColor: "bg-blue-500",
        };
      case "reading":
        return {
          icon: <BookOutlined />,
          color: "#10b981",
          bgColor: "bg-emerald-500",
        };
      case "grammar":
        return {
          icon: <TranslationOutlined />,
          color: "#8b5cf6",
          bgColor: "bg-purple-500",
        };
      case "vocabulary":
        return {
          icon: <SoundOutlined />,
          color: "#f59e0b",
          bgColor: "bg-amber-500",
        };
      case "strategy":
        return {
          icon: <TrophyOutlined />,
          color: "#ef4444",
          bgColor: "bg-red-500",
        };
      default:
        return {
          icon: <FileTextOutlined />,
          color: "#6b7280",
          bgColor: "bg-gray-500",
        };
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
    });
    fetchMaterials();
  }, [fetchMaterials]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        <Card
          className="w-full max-w-md mx-4 text-center border-0 shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="py-16">
            <div className="mb-8">
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 64, color: "#3b82f6" }}
                    spin
                  />
                }
                className="mb-6"
              />
            </div>
            <Title level={3} className="mb-4 text-gray-800">
              Đang tải tài liệu học tập...
            </Title>
            <Text className="text-lg text-gray-600">
              Vui lòng chờ trong giây lát
            </Text>
            <div className="flex justify-center mt-8 space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%233b82f6' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8" data-aos="fade-down">
              <Badge.Ribbon text="Mới cập nhật" color="blue">
                <div className="inline-flex items-center px-6 py-3 border border-blue-200 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <FireOutlined className="mr-2 text-orange-500" />
                  <Text className="font-semibold text-blue-800">
                    Tài liệu TOEIC chất lượng cao
                  </Text>
                </div>
              </Badge.Ribbon>
            </div>
            <Title
              level={1}
              className="mb-6 text-5xl font-bold leading-tight text-transparent lg:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text"
              data-aos="fade-up"
            >
              Tài liệu học tập TOEIC
            </Title>
            <Paragraph
              className="max-w-4xl mx-auto mb-12 text-xl leading-relaxed text-gray-600 lg:text-2xl"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Khám phá bộ sưu tập tài liệu TOEIC chất lượng cao với hơn{" "}
              <Text strong className="text-blue-600">
                1000+ tài liệu
              </Text>{" "}
              được biên soạn bởi các chuyên gia hàng đầu
            </Paragraph>
            <div
              className="max-w-2xl mx-auto mb-8"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <Input.Search
                placeholder="Tìm kiếm tài liệu, bài học, từ khóa..."
                allowClear
                enterButton={
                  <Button
                    type="primary"
                    className="px-8 text-lg font-semibold border-0 bg-gradient-to-r from-blue-500 to-purple-600 h-14 hover:from-blue-600 hover:to-purple-700"
                  >
                    <SearchOutlined className="mr-2" />
                    Tìm kiếm
                  </Button>
                }
                size="large"
                onSearch={handleSearch}
                className="search-input-custom"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <Row
              gutter={[32, 16]}
              className="max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tài liệu"
                  value={1200}
                  suffix="+"
                  valueStyle={{
                    color: "#3b82f6",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Học viên"
                  value={15000}
                  suffix="+"
                  valueStyle={{
                    color: "#10b981",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Lượt tải"
                  value={50000}
                  suffix="+"
                  valueStyle={{
                    color: "#f59e0b",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Đánh giá"
                  value={4.9}
                  suffix="/5"
                  valueStyle={{
                    color: "#ef4444",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                />
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-12"
          data-aos="fade-up"
        >
          {[
            {
              key: "all",
              label: "Tất cả",
              icon: <FileTextOutlined />,
              count: materials.length,
            },
            {
              key: "lessons",
              label: "Bài học",
              icon: <BookOutlined />,
              count: 156,
            },
            {
              key: "free-materials",
              label: "Tài liệu miễn phí",
              icon: <DownloadOutlined />,
              count: 89,
            },
          ].map((filter) => (
            <Button
              key={filter.key}
              type={activeFilter === filter.key ? "primary" : "default"}
              size="large"
              icon={filter.icon}
              onClick={() => handleFilterChange(filter.key)}
              className={`rounded-2xl px-8 h-14 text-lg font-semibold transition-all duration-300 ${
                activeFilter === filter.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg transform scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              <span className="mr-2">{filter.label}</span>
              <Badge
                count={filter.count}
                style={{
                  backgroundColor:
                    activeFilter === filter.key
                      ? "rgba(255,255,255,0.3)"
                      : "#f0f0f0",
                  color: activeFilter === filter.key ? "white" : "#666",
                }}
              />
            </Button>
          ))}
        </div>

        {/* Popular Tags */}
        <Card
          className="mb-12 overflow-hidden border-0 shadow-xl rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            backdropFilter: "blur(20px)",
          }}
          data-aos="fade-up"
        >
          <div className="flex flex-col items-start justify-between gap-6 mb-6 lg:flex-row lg:items-center">
            <Space size="large">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <FilterOutlined className="text-xl text-white" />
              </div>
              <div>
                <Title level={3} className="mb-1 text-gray-800">
                  Chủ đề phổ biến
                </Title>
                <Text className="text-gray-600">
                  Chọn chủ đề để lọc tài liệu phù hợp
                </Text>
              </div>
            </Space>
            {activeTags.length > 0 && (
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => setActiveTags([])}
                className="h-10 px-4 font-semibold hover:bg-red-50 rounded-xl"
              >
                Xóa bộ lọc ({activeTags.length})
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {popularTags.map((tag, index) => (
              <Tag
                key={index}
                color={activeTags.includes(tag) ? "blue" : "default"}
                className={`cursor-pointer px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border-2 ${
                  activeTags.includes(tag)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg transform scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </Card>

        {/* Materials Grid */}
        {currentMaterials.length > 0 ? (
          <Row gutter={[24, 32]} className="mb-16">
            {currentMaterials.map((material, index) => {
              const { icon, color, bgColor } = getMaterialTypeIcon(material);
              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card
                    hoverable
                    className="h-full overflow-hidden transition-all duration-500 border-0 shadow-xl rounded-3xl hover:shadow-2xl hover:-translate-y-2"
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(20px)",
                    }}
                    cover={
                      <div className="relative overflow-hidden">
                        <img
                          alt={material.title}
                          src={material.imageUrl || "/placeholder.svg"}
                          className="object-cover w-full h-48 transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-4 right-4">
                          <Badge
                            count={material.isPremium ? "Premium" : "Miễn phí"}
                            style={{
                              backgroundColor: material.isPremium
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              fontWeight: "600",
                              fontSize: "12px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                        <div
                          className={`absolute -bottom-6 left-6 w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white`}
                        >
                          {icon}
                        </div>
                        <div className="absolute px-3 py-1 top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl">
                          <Space size={4}>
                            <StarOutlined className="text-yellow-500" />
                            <Text strong className="text-gray-800">
                              {material.rating}
                            </Text>
                          </Space>
                        </div>
                      </div>
                    }
                    data-aos="fade-up"
                    data-aos-delay={(index % 4) * 100}
                  >
                    <div className="pt-8">
                      <Title
                        level={4}
                        className="mb-3 leading-tight text-gray-800"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {material.title}
                      </Title>
                      <Paragraph
                        className="mb-4 leading-relaxed text-gray-600"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {material.description}
                      </Paragraph>
                      <div className="mb-4">
                        <Space wrap size={[4, 8]}>
                          {material.tags?.slice(0, 3).map((tag, tagIndex) => (
                            <Tag
                              key={tagIndex}
                              color="blue"
                              className="px-2 py-1 text-xs font-medium border-0 rounded-lg"
                              style={{
                                background: "rgba(59, 130, 246, 0.1)",
                                color: "#1d4ed8",
                              }}
                            >
                              {tag}
                            </Tag>
                          ))}
                          <Tag
                            color={getDifficultyColor(material.difficulty)}
                            className="px-2 py-1 text-xs font-medium rounded-lg"
                          >
                            {material.difficulty}
                          </Tag>
                        </Space>
                      </div>
                      <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
                        <Space size={16}>
                          <Space size={4}>
                            <CalendarOutlined />
                            <span>
                              {material.updatedAt
                                ? formatDate(material.updatedAt)
                                : "N/A"}
                            </span>
                          </Space>
                          <Space size={4}>
                            <EyeOutlined />
                            <span>{material.views || 0}</span>
                          </Space>
                          <Space size={4}>
                            <DownloadOutlined />
                            <span>{material.downloads || 0}</span>
                          </Space>
                        </Space>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          to={`/learner/materials/${
                            material._id || material.materialId
                          }`}
                          className="flex-1"
                        >
                          <Button
                            type="primary"
                            block
                            size="large"
                            className="h-12 font-semibold transition-all duration-300 border-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl hover:from-blue-600 hover:to-purple-700"
                          >
                            Xem chi tiết
                          </Button>
                        </Link>
                        <Button
                          type="text"
                          size="large"
                          icon={<HeartOutlined />}
                          className="w-12 h-12 transition-all duration-300 border-2 border-gray-200 rounded-2xl hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                        />
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div className="py-20 text-center" data-aos="fade-up">
            <Card
              className="max-w-lg mx-auto border-0 shadow-2xl rounded-3xl"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="py-12">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  imageStyle={{ height: 120, marginBottom: 24 }}
                  description={
                    <div>
                      <Title level={3} className="mb-4 text-gray-800">
                        Không tìm thấy tài liệu phù hợp
                      </Title>
                      <Paragraph className="mb-8 text-lg text-gray-600">
                        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy
                        tài liệu bạn cần
                      </Paragraph>
                    </div>
                  }
                >
                  <Button
                    type="primary"
                    size="large"
                    className="h-12 px-8 font-semibold border-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTags([]);
                      setActiveFilter("all");
                    }}
                  >
                    <ThunderboltOutlined className="mr-2" />
                    Xóa bộ lọc
                  </Button>
                </Empty>
              </div>
            </Card>
          </div>
        )}

        {/* Pagination */}
        {filteredMaterials.length > materialsPerPage && (
          <div className="flex justify-center mb-16" data-aos="fade-up">
            <Pagination
              current={currentPage}
              total={filteredMaterials.length}
              pageSize={materialsPerPage}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => (
                <Text className="font-medium text-gray-600">
                  Hiển thị {range[0]}-{range[1]} trong tổng số {total} tài liệu
                </Text>
              )}
              className="custom-pagination"
              size="large"
            />
          </div>
        )}

        {/* Featured Courses Section */}
        <Card
          className="overflow-hidden border-0 shadow-2xl rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            backdropFilter: "blur(20px)",
          }}
          data-aos="fade-up"
        >
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl">
              <TrophyOutlined className="text-2xl text-white" />
            </div>
            <Title
              level={2}
              className="mb-4 text-4xl font-bold text-transparent lg:text-5xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text"
            >
              Khóa học nổi bật
            </Title>
            <Paragraph className="max-w-3xl mx-auto text-xl text-gray-600">
              Những khóa học được đánh giá cao nhất bởi cộng đồng học viên
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {[
              {
                title: "TOEIC 101: Cho người mới bắt đầu",
                description:
                  "Khóa học cung cấp kiến thức và kỹ thuật làm bài cơ bản cho người mới học TOEIC.",
                features: [
                  {
                    icon: <AudioOutlined />,
                    text: "Học nghe hiệu quả",
                    color: "#3b82f6",
                  },
                  {
                    icon: <BookOutlined />,
                    text: "Cải thiện đọc hiểu",
                    color: "#10b981",
                  },
                  {
                    icon: <TranslationOutlined />,
                    text: "Ngữ pháp căn bản",
                    color: "#8b5cf6",
                  },
                ],
                buttonText: "Học ngay",
                buttonType: "primary",
                students: "2,500+",
                rating: 4.9,
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                title: "Từ 500 đến 700+ TOEIC",
                description:
                  "Chiến lược và phương pháp học tập để đạt được điểm số cao trong bài thi TOEIC.",
                features: [
                  {
                    icon: <SoundOutlined />,
                    text: "Kỹ thuật nghe nâng cao",
                    color: "#f59e0b",
                  },
                  {
                    icon: <FileTextOutlined />,
                    text: "Bí quyết làm Part 7",
                    color: "#ef4444",
                  },
                  {
                    icon: <DownloadOutlined />,
                    text: "Tài liệu độc quyền",
                    color: "#6b7280",
                  },
                ],
                buttonText: "Xem thêm",
                buttonType: "default",
                students: "1,800+",
                rating: 4.8,
                gradient: "from-purple-500 to-pink-500",
              },
              {
                title: "TOEIC Vocabulary Master",
                description:
                  "Phương pháp học từ vựng hiệu quả và dễ nhớ cho tất cả các phần của bài thi TOEIC.",
                features: [
                  {
                    icon: <UserOutlined />,
                    text: "5000+ học viên",
                    color: "#6b7280",
                  },
                  {
                    icon: <BookOutlined />,
                    text: "Từ vựng theo chủ đề",
                    color: "#10b981",
                  },
                  {
                    icon: <TranslationOutlined />,
                    text: "Học nhanh, nhớ lâu",
                    color: "#8b5cf6",
                  },
                ],
                buttonText: "Tham gia",
                buttonType: "default",
                students: "5,000+",
                rating: 4.7,
                gradient: "from-emerald-500 to-teal-500",
              },
            ].map((course, index) => (
              <Col xs={24} lg={8} key={index}>
                <Card
                  hoverable
                  className="h-full overflow-hidden transition-all duration-500 border-0 shadow-xl rounded-3xl hover:shadow-2xl hover:-translate-y-2"
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                  }}
                  cover={
                    <div
                      className={`h-32 bg-gradient-to-r ${course.gradient} relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute px-3 py-1 top-4 right-4 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Space size={4}>
                          <StarOutlined className="text-yellow-300" />
                          <Text className="font-semibold text-white">
                            {course.rating}
                          </Text>
                        </Space>
                      </div>
                      <div className="absolute px-3 py-1 bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Space size={4}>
                          <UserOutlined className="text-white" />
                          <Text className="font-semibold text-white">
                            {course.students}
                          </Text>
                        </Space>
                      </div>
                    </div>
                  }
                >
                  <div className="p-2">
                    <Title level={4} className="mb-3 text-gray-800">
                      {course.title}
                    </Title>
                    <Paragraph className="mb-6 leading-relaxed text-gray-600">
                      {course.description}
                    </Paragraph>
                    <div className="mb-8">
                      {course.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center mb-3"
                        >
                          <div
                            className="flex items-center justify-center w-10 h-10 mr-4 rounded-2xl"
                            style={{ backgroundColor: `${feature.color}15` }}
                          >
                            <span style={{ color: feature.color }}>
                              {feature.icon}
                            </span>
                          </div>
                          <Text className="font-medium text-gray-700">
                            {feature.text}
                          </Text>
                        </div>
                      ))}
                    </div>
                    <Button
                      type={course.buttonType}
                      block
                      size="large"
                      className={`rounded-2xl h-12 font-semibold transition-all duration-300 ${
                        course.buttonType === "primary"
                          ? `bg-gradient-to-r ${course.gradient} border-0 text-white hover:shadow-lg hover:scale-105`
                          : "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md"
                      }`}
                    >
                      <PlayCircleOutlined className="mr-2" />
                      {course.buttonText}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default LearningMaterialsBeautiful;

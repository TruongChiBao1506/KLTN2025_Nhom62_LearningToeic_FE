import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  Avatar,
  Rate,
  Image,
  Alert,
  Breadcrumb,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  EyeOutlined,
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  HeartOutlined,
  ShareAltOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  BookOpen,
  Headphones,
  FileText,
  Clock,
  Award,
  Download,
  Eye,
  Calendar,
} from "lucide-react";

import freeMaterialService from "../../../services/freeMaterialService";
import lessonService from "../../../services/lessonService";

const { Title, Paragraph, Text } = Typography;

const MaterialDetailAntd = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Utility function to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    return filePath.startsWith("http")
      ? filePath
      : `http://localhost:5000${filePath}`;
  };

  useEffect(() => {
    fetchMaterialDetail();
  }, [id, type]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMaterialDetail = async () => {
    try {
      setLoading(true);
      let response;

      if (type === "lesson") {
        response = await lessonService.get(id);
      } else {
        response = await freeMaterialService.get(id);
      }

      console.log("🚀 ~ fetchMaterialDetail ~ response:", response);
      const data = response.data?.data || response.data || response;
      console.log("🚀 ~ fetchMaterialDetail ~ data:", data);

      // Normalize data based on actual API response
      const normalizedMaterial = {
        ...data,
        id: data._id || data.id,
        title:
          data.title ||
          data.lessonName ||
          data.materialName ||
          "Tài liệu học tập",
        description:
          data.description ||
          data.shortDescription ||
          data.lessonDescription ||
          data.materialDescription ||
          "",
        content:
          data.content || data.lessonContent || data.materialContent || "",
        imageUrl: data.imageUrl || null,
        filePdf: data.filePdf || null,
        fileName: data.fileName || null,
        fileExtension: data.fileExtension || null,
        tags: data.tags || [
          "TOEIC",
          type === "lesson" ? "Reading" : "Vocabulary",
        ],
        difficulty: data.difficulty || "Intermediate",
        category: data.category || (type === "lesson" ? "Reading" : "General"),
        type: type || "material",
        isPremium: !!data.isPremium,
        views: data.views || Math.floor(Math.random() * 1000) + 100,
        downloads: data.downloads || Math.floor(Math.random() * 500) + 50,
        rating: data.rating || (4 + Math.random()).toFixed(1),
        author: data.author || "TOEIC Master",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        estimatedTime: data.estimatedTime || "30 phút",
        level: data.level || data.difficulty || "Intermediate",
        materialStatus: data.materialStatus,
        statusDisplay: data.statusDisplay,
      };

      setMaterial(normalizedMaterial);
    } catch (error) {
      console.error("Error fetching material detail:", error);
      toast.error("Không thể tải chi tiết tài liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!material) return;

    try {
      setDownloading(true);

      if (material.filePdf) {
        // Ensure we have the correct file URL
        const fileUrl = getFileUrl(material.filePdf);

        const fileName = material.fileName || "toeic-material";
        const fileExtension = material.fileExtension || "pdf";
        const fullFileName = `${fileName}.${fileExtension}`;

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fullFileName;
        link.target = "_blank";

        // For cross-origin downloads, we might need to fetch and create blob
        try {
          const response = await fetch(fileUrl);
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            link.href = blobUrl;
          }
        } catch (fetchError) {
          console.log("Direct fetch failed, using direct link:", fetchError);
          // Fallback to direct link
        }

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL if created
        if (link.href.startsWith("blob:")) {
          window.URL.revokeObjectURL(link.href);
        }

        // Update download count
        setMaterial((prev) => ({
          ...prev,
          downloads: (prev.downloads || 0) + 1,
        }));

        toast.success(`Đã tải xuống file: ${fullFileName}`);
      } else {
        // Fallback for materials without file
        toast.info("Tài liệu này chưa có file để tải xuống");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải xuống. Vui lòng thử lại sau.");
    } finally {
      setDownloading(false);
    }
  };

  const handleStartLearning = () => {
    if (!material) return;

    if (material.filePdf) {
      // Ensure we have the correct file URL
      const fileUrl = getFileUrl(material.filePdf);

      // Open PDF in new tab for learning
      window.open(fileUrl, "_blank");

      // Update view count
      setMaterial((prev) => ({
        ...prev,
        views: (prev.views || 0) + 1,
      }));

      toast.success("Đã mở tài liệu học tập!");
    } else {
      toast.info("Tài liệu này chưa có nội dung để học");
    }
  };

  const handleShare = async () => {
    if (!material) return;

    const shareData = {
      title: material.title,
      text: material.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share(shareData);
        toast.success("Đã chia sẻ thành công!");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link vào clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link vào clipboard!");
      } catch (clipboardError) {
        toast.error("Không thể chia sẻ. Vui lòng thử lại sau.");
      }
    }
  };

  const handleFavorite = () => {
    // Toggle favorite status (this would normally save to backend)
    setMaterial((prev) => ({
      ...prev,
      isFavorited: !prev.isFavorited,
    }));

    const message = material.isFavorited
      ? "Đã bỏ yêu thích"
      : "Đã thêm vào yêu thích";
    toast.success(message);
  };

  const getCategoryIcon = (category) => {
    const cat = category?.toLowerCase() || "";
    switch (cat) {
      case "listening":
        return <Headphones style={{ width: "20px", height: "20px" }} />;
      case "reading":
        return <BookOpen style={{ width: "20px", height: "20px" }} />;
      case "grammar":
        return <FileText style={{ width: "20px", height: "20px" }} />;
      case "vocabulary":
        return <BookOutlined style={{ width: "20px", height: "20px" }} />;
      default:
        return <FileTextOutlined style={{ width: "20px", height: "20px" }} />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "var(--color-success)";
      case "intermediate":
        return "var(--color-warning)";
      case "advanced":
        return "var(--color-danger)";
      default:
        return "var(--color-primary)";
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
          height: "300px",
          background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          color: "white",
          fontSize: "48px",
        }}
      >
        {getCategoryIcon(category)}
      </div>
    );
  };

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
            <Text>Đang tải chi tiết tài liệu...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (!material) {
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
          <Alert
            message="Không tìm thấy tài liệu"
            description="Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
            type="error"
            showIcon
          />
          <Button
            type="primary"
            onClick={() => navigate("/learner/materials")}
            style={{ marginTop: 16 }}
          >
            Quay về danh sách
          </Button>
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
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              href: "/learner",
              title: <HomeOutlined />,
            },
            {
              href: "/learner/materials",
              title: "Tài liệu học tập",
            },
            {
              title: material.title,
            },
          ]}
        />

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/learner/materials")}
            style={{ marginBottom: 16 }}
          >
            Quay lại
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card
              style={{
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Material Image */}
              <div style={{ marginBottom: 24 }}>
                {material.imageUrl ? (
                  <Image
                    src={material.imageUrl}
                    alt={material.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    fallback={getDefaultImage(material.category, material.type)}
                  />
                ) : (
                  getDefaultImage(material.category, material.type)
                )}
              </div>

              {/* Title and Meta */}
              <div style={{ marginBottom: 24 }}>
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  <div>
                    <Space wrap>
                      <Tag
                        color={getDifficultyColor(material.difficulty)}
                        style={{ borderRadius: "20px", padding: "4px 12px" }}
                      >
                        {material.difficulty}
                      </Tag>
                      <Tag
                        icon={getCategoryIcon(material.category)}
                        color="blue"
                        style={{ borderRadius: "20px", padding: "4px 12px" }}
                      >
                        {material.category}
                      </Tag>
                      {material.isPremium && (
                        <Tag
                          color="gold"
                          style={{ borderRadius: "20px", padding: "4px 12px" }}
                        >
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
                    level={1}
                    style={{ marginBottom: 8, color: "#2c3e50" }}
                  >
                    {material.title}
                  </Title>

                  <Space size="large" wrap>
                    <Space>
                      <Eye style={{ width: "16px", height: "16px" }} />
                      <Text type="secondary">{material.views} lượt xem</Text>
                    </Space>
                    <Space>
                      <Download style={{ width: "16px", height: "16px" }} />
                      <Text type="secondary">
                        {material.downloads} lượt tải
                      </Text>
                    </Space>
                    <Space>
                      <Calendar style={{ width: "16px", height: "16px" }} />
                      <Text type="secondary">
                        {new Date(material.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </Space>
                    <Space>
                      <Clock style={{ width: "16px", height: "16px" }} />
                      <Text type="secondary">{material.estimatedTime}</Text>
                    </Space>
                  </Space>
                </Space>
              </div>

              <Divider />

              {/* Description */}
              <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Mô tả
                </Title>
                <Paragraph style={{ fontSize: "16px", lineHeight: 1.8 }}>
                  {material.description || "Không có mô tả cho tài liệu này."}
                </Paragraph>
              </div>

              {/* Content Preview */}
              {material.content && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      Nội dung
                    </Title>
                    <div
                      style={{
                        background: "var(--color-bg-secondary)",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <Paragraph style={{ fontSize: "12px", lineHeight: 1.6 }}>
                        {material.content.substring(0, 500)}
                        {material.content.length > 500 && "..."}
                      </Paragraph>
                    </div>
                  </div>
                </>
              )}

              {/* File Information */}
              {material.filePdf && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      Thông tin file
                    </Title>
                    <Card
                      size="small"
                      style={{
                        background: "var(--color-bg-secondary)",
                        border: "1px solid #e9ecef",
                        borderRadius: "12px",
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Space>
                              <FileTextOutlined style={{ color: "#d32f2f" }} />
                              <Text strong>
                                {material.fileName}.
                                {material.fileExtension || "pdf"}
                              </Text>
                            </Space>
                          </Col>
                          <Col>
                            <Tag color="blue">
                              {(material.fileExtension || "PDF").toUpperCase()}
                            </Tag>
                          </Col>
                        </Row>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Tài liệu học tập TOEIC chất lượng cao
                        </Text>
                      </Space>
                    </Card>
                  </div>
                </>
              )}

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      Thẻ
                    </Title>
                    <Space wrap>
                      {material.tags.map((tag, index) => (
                        <Tag
                          key={index}
                          style={{
                            borderRadius: "20px",
                            padding: "4px 12px",
                            background: "var(--color-bg-tertiary)",
                            border: "1px solid #d9d9d9",
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </>
              )}

              {/* File Information */}
              {material.filePdf && (
                <>
                  <Divider />
                  <div style={{ marginBottom: 24 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      <FileTextOutlined style={{ marginRight: 8 }} />
                      Thông tin file
                    </Title>
                    <div
                      style={{
                        background: "var(--color-bg-secondary)",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Row justify="space-between">
                          <Text strong>Tên file:</Text>
                          <Text>
                            {material.fileName || "toeic-material"}.
                            {material.fileExtension || "pdf"}
                          </Text>
                        </Row>
                        <Row justify="space-between">
                          <Text strong>Định dạng:</Text>
                          <Tag color="blue">
                            {(material.fileExtension || "PDF").toUpperCase()}
                          </Tag>
                        </Row>
                        <Row justify="space-between">
                          <Text strong>Trạng thái:</Text>
                          <Tag
                            color={
                              material.materialStatus === 1 ? "green" : "red"
                            }
                          >
                            {material.statusDisplay ||
                              (material.materialStatus === 1
                                ? "Hoạt động"
                                : "Không hoạt động")}
                          </Tag>
                        </Row>
                        <Row justify="space-between">
                          <Text strong>Đường dẫn:</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {material.filePdf}
                          </Text>
                        </Row>
                      </Space>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {/* Actions Card */}
              <Card
                title="Hành động"
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="middle"
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    block
                    style={{ height: "48px", borderRadius: "12px" }}
                    onClick={handleStartLearning}
                    disabled={!material.filePdf}
                  >
                    {material.filePdf ? "Bắt đầu học" : "Chưa có nội dung"}
                  </Button>

                  <Button
                    size="large"
                    icon={<DownloadOutlined />}
                    loading={downloading}
                    onClick={handleDownload}
                    block
                    style={{ height: "48px", borderRadius: "12px" }}
                    disabled={!material.filePdf}
                  >
                    {material.filePdf ? "Tải xuống PDF" : "Không có file"}
                  </Button>

                  <Row gutter={8}>
                    <Col span={12}>
                      <Button
                        icon={<HeartOutlined />}
                        block
                        style={{ height: "40px", borderRadius: "8px" }}
                        onClick={handleFavorite}
                        type={material.isFavorited ? "primary" : "default"}
                      >
                        {material.isFavorited ? "Đã yêu thích" : "Yêu thích"}
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        icon={<ShareAltOutlined />}
                        block
                        style={{ height: "40px", borderRadius: "8px" }}
                        onClick={handleShare}
                      >
                        Chia sẻ
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Card>

              {/* Stats Card */}
              <Card
                title="Thống kê"
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Lượt xem"
                      value={material.views}
                      prefix={<EyeOutlined />}
                      valueStyle={{ color: "#3f8600" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Lượt tải"
                      value={material.downloads}
                      prefix={<DownloadOutlined />}
                      valueStyle={{ color: "var(--color-primary)" }}
                    />
                  </Col>
                  <Col span={24}>
                    <div style={{ textAlign: "center" }}>
                      <Text type="secondary">Đánh giá</Text>
                      <div style={{ marginTop: 8 }}>
                        <Rate
                          disabled
                          defaultValue={parseFloat(material.rating)}
                          allowHalf
                        />
                        <Text
                          style={{
                            marginLeft: 8,
                            fontSize: "16px",
                            fontWeight: 500,
                          }}
                        >
                          {material.rating}/5
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Author Card */}
              <Card
                title="Tác giả"
                style={{
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Space align="center">
                  <Avatar size={48} icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ display: "block" }}>
                      {material.author}
                    </Text>
                    <Text type="secondary">Giảng viên TOEIC</Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MaterialDetailAntd;

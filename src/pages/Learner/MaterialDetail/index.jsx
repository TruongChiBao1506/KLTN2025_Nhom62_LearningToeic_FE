"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Breadcrumb,
  Tag,
  Space,
  Row,
  Col,
  Spin,
  Badge,
  Descriptions,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ShareAltOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  BookOutlined,
  TagOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import AOS from "aos";
import "aos/dist/aos.css";

import freeMaterialService from "../../../services/freeMaterialService";

const { Title, Paragraph, Text } = Typography;


const MaterialDetailAntd = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fetch material detail
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await freeMaterialService.get(id);
        const materialData = response.data?.data || response.data || response;
        setMaterial(materialData);
      } catch (error) {
        console.error("Error fetching material detail:", error);
        setError("Không thể tải thông tin tài liệu. Vui lòng thử lại sau.");
        message.error("Không thể tải thông tin tài liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialDetail();
  }, [id]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Handle download
  const handleDownload = async () => {
    if (!material?.fileName) {
      message.error("Không tìm thấy file để tải xuống");
      return;
    }

    try {
      setDownloading(true);
      await freeMaterialService.downloadFile(material.fileName);
      message.success("Bắt đầu tải xuống tài liệu");
    } catch (error) {
      console.error("Download error:", error);
      message.error("Lỗi khi tải xuống tài liệu");
    } finally {
      setDownloading(false);
    }
  };

  // Handle back navigation
  const handleBackClick = () => {
    navigate
      ? navigate("/learner/materials")
      : message.info("Quay lại danh sách tài liệu");
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: material.title,
        text: material.description || material.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      message.success("Đã sao chép link vào clipboard");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card
          className="w-full max-w-md mx-4 text-center border-0 shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="py-12">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#3b82f6" }}
                  spin
                />
              }
              className="mb-6"
            />
            <Title level={4} className="mb-2 text-gray-800">
              Đang tải thông tin tài liệu...
            </Title>
            <Text className="text-gray-600">Vui lòng chờ trong giây lát</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !material) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card
          className="w-full max-w-lg mx-4 text-center border-0 shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="py-12">
            <div className="mb-6 text-6xl text-yellow-500">⚠️</div>
            <Title level={3} className="mb-4 text-gray-800">
              Không tìm thấy tài liệu
            </Title>
            <Paragraph className="mb-8 text-gray-600">
              {error || "Tài liệu không tồn tại hoặc đã bị xóa."}
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackClick}
              className="h-12 px-8 bg-blue-500 border-0 hover:bg-blue-600 rounded-xl"
            >
              Quay lại danh sách tài liệu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 shadow-lg">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6" data-aos="fade-down">
            <Breadcrumb
              className="text-sm"
              items={[
                {
                  href: "/learner/dashboard",
                  title: (
                    <Space>
                      <HomeOutlined />
                      <span>Trang chủ</span>
                    </Space>
                  ),
                },
                {
                  href: "/learner/materials",
                  title: (
                    <Space>
                      <BookOutlined />
                      <span>Tài liệu học tập</span>
                    </Space>
                  ),
                },
                {
                  title: (
                    <Text
                      className="font-medium text-gray-800"
                      ellipsis={{ tooltip: material.title }}
                    >
                      {material.title}
                    </Text>
                  ),
                },
              ]}
            />
          </div>

          {/* Back Button */}
          <div className="mb-8" data-aos="fade-right">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackClick}
              className="h-10 px-6 font-medium text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl"
            >
              Quay lại danh sách
            </Button>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl" data-aos="fade-up" data-aos-delay="200">
            <Title
              level={1}
              className="mb-6 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl"
            >
              {material.title}
            </Title>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 mb-6">
              <Space className="text-gray-600">
                <CalendarOutlined className="text-gray-400" />
                <Text>
                  {new Date(material.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </Space>
              <Space className="text-gray-600">
                <FileTextOutlined className="text-gray-400" />
                <Text>
                  {material.fileExtension?.toUpperCase() || "PDF"} Document
                </Text>
              </Space>
              <Space className="text-gray-600">
                <TagOutlined className="text-gray-400" />
                <Text>Tài liệu miễn phí</Text>
              </Space>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <Badge
                status={material.materialStatus === 1 ? "success" : "error"}
                text={
                  <Text
                    className={`font-semibold ${
                      material.materialStatus === 1
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {material.statusDisplay ||
                      (material.materialStatus === 1
                        ? "Đang hoạt động"
                        : "Không hoạt động")}
                  </Text>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Download Section */}
              <Card
                className="overflow-hidden border-0 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                }}
                data-aos="fade-up"
              >
                <div className="flex flex-col items-center justify-between gap-8 text-white lg:flex-row">
                  <div className="flex-1 text-center lg:text-left">
                    <Title level={3} className="mb-2 text-white">
                      Tải xuống tài liệu
                    </Title>
                    <Paragraph className="mb-0 text-lg text-blue-100">
                      Nhấn vào nút bên dưới để tải xuống tài liệu PDF
                    </Paragraph>
                  </div>
                  <div>
                    <Button
                      type="primary"
                      size="large"
                      icon={
                        downloading ? (
                          <LoadingOutlined spin />
                        ) : (
                          <DownloadOutlined />
                        )
                      }
                      onClick={handleDownload}
                      loading={downloading}
                      disabled={material.materialStatus !== 1}
                      className="px-8 text-lg font-semibold text-white bg-white border-white bg-opacity-20 border-opacity-30 hover:bg-opacity-30 rounded-2xl h-14 backdrop-blur-sm"
                      style={{
                        minWidth: "180px",
                      }}
                    >
                      {downloading ? "Đang tải..." : "Tải xuống"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Description Section */}
              {(material.description || material.shortDescription) && (
                <Card
                  title={
                    <Space>
                      <BookOutlined className="text-blue-500" />
                      <Text className="text-xl font-bold">Mô tả tài liệu</Text>
                    </Space>
                  }
                  className="border-0 shadow-lg rounded-2xl"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <div className="prose max-w-none">
                    {(material.description || material.shortDescription)
                      .split("\n")
                      .map((paragraph, index) => (
                        <Paragraph
                          key={index}
                          className="mb-4 text-base leading-relaxed text-gray-700"
                        >
                          {paragraph}
                        </Paragraph>
                      ))}
                  </div>
                </Card>
              )}

              {/* Additional Information */}
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined className="text-blue-500" />
                    <Text className="text-xl font-bold">
                      Thông tin chi tiết
                    </Text>
                  </Space>
                }
                className="border-0 shadow-lg rounded-2xl"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                  <Descriptions.Item label="Tên file" span={2}>
                    <Text code className="px-2 py-1 bg-gray-100 rounded">
                      {material.fileName || material.filePdf}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Định dạng">
                    <Tag color="blue" className="font-medium">
                      {material.fileExtension?.toUpperCase() || "PDF"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        material.materialStatus === 1 ? "success" : "error"
                      }
                      icon={
                        material.materialStatus === 1 ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                      className="font-medium"
                    >
                      {material.statusDisplay ||
                        (material.materialStatus === 1
                          ? "Khả dụng"
                          : "Không khả dụng")}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    <Text>
                      {new Date(material.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    <Text>
                      {new Date(material.updatedAt).toLocaleString("vi-VN")}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Quick Actions */}
              <Card
                title={
                  <Text className="text-lg font-bold">Thao tác nhanh</Text>
                }
                className="border-0 shadow-lg rounded-2xl"
                data-aos="fade-left"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    type="primary"
                    size="large"
                    icon={
                      downloading ? (
                        <LoadingOutlined spin />
                      ) : (
                        <DownloadOutlined />
                      )
                    }
                    onClick={handleDownload}
                    loading={downloading}
                    disabled={material.materialStatus !== 1}
                    className="w-full h-12 font-semibold bg-blue-500 border-0 hover:bg-blue-600 rounded-xl"
                  >
                    Tải xuống
                  </Button>
                  <Button
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    className="w-full h-12 font-semibold text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-xl"
                  >
                    Chia sẻ
                  </Button>
                </Space>
              </Card>

              {/* File Information */}
              <Card
                title={
                  <Text className="text-lg font-bold">Thông tin file</Text>
                }
                className="border-0 shadow-lg rounded-2xl"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <Space direction="vertical" size="middle" className="w-full">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <Text className="text-gray-600">Định dạng:</Text>
                    <Tag color="blue" className="font-medium">
                      {material.fileExtension?.toUpperCase() || "PDF"}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <Text className="text-gray-600">Trạng thái:</Text>
                    <Tag
                      color={
                        material.materialStatus === 1 ? "success" : "error"
                      }
                      icon={
                        material.materialStatus === 1 ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )
                      }
                      className="font-medium"
                    >
                      {material.statusDisplay ||
                        (material.materialStatus === 1
                          ? "Khả dụng"
                          : "Không khả dụng")}
                    </Tag>
                  </div>
                </Space>
              </Card>

              {/* Help Section */}
              <Card
                title={<Text className="text-lg font-bold">Cần hỗ trợ?</Text>}
                className="border-0 border-blue-100 shadow-lg rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <Paragraph className="mb-4 leading-relaxed text-blue-800">
                  Nếu bạn gặp vấn đề với việc tải xuống hoặc sử dụng tài liệu,
                  hãy liên hệ với chúng tôi.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<CustomerServiceOutlined />}
                  onClick={() => message.info("Chức năng hỗ trợ sẽ sớm có!")}
                  className="w-full h-12 font-semibold border-0 bg-cyan-500 hover:bg-cyan-600 rounded-xl"
                >
                  Liên hệ hỗ trợ
                </Button>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MaterialDetailAntd;

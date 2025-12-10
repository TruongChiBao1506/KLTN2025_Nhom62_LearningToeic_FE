import React, { useState, useEffect } from "react";
import { Form, Input, Button, Rate, message, Typography } from "antd";
import feedbackService from "../../../services/feedbackService";
import { CheckCircleTwoTone } from "@ant-design/icons";

// Custom CSS cho ngôi sao đánh giá
const rateStarStyle = `
.ant-rate-star {
  color: #d9d9d9 !important;
}
.ant-rate-star.ant-rate-star-full .ant-rate-star-second,
.ant-rate-star.ant-rate-star-half .ant-rate-star-first {
  color: #faad14 !important;
}
.ant-rate-star:hover .ant-rate-star-second,
.ant-rate-star:hover .ant-rate-star-first {
  color: #faad14 !important;
}
`;

const { Title, Paragraph } = Typography;
const { TextArea } = Input;


const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Góp ý & Đánh giá | TOEIC Learning Platform";
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await feedbackService.create(values);
      form.resetFields();
      message.open({
        type: "success",
        content: (
          <span>
            {/* <CheckCircleTwoTone twoToneColor="var(--color-success)" style={{ fontSize: 20, marginRight: 8 }} /> */}
            Cảm ơn bạn đã gửi phản hồi! Chúng tôi rất trân trọng ý kiến của bạn.
          </span>
        ),
        duration: 3
      });
    } catch (err) {
      message.error("Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{rateStarStyle}</style>
      <div style={{ maxWidth: 600, margin: "40px auto", background: "var(--color-bg-primary)", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 32 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 8 }}>Góp ý & Đánh giá</Title>
        <Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 32 }}>
          Hãy cho chúng tôi biết ý kiến, góp ý hoặc báo lỗi để nền tảng ngày càng hoàn thiện hơn!
        </Paragraph>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" form={form}>
          <Form.Item name="name" label="Tên của bạn" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
            <Input placeholder="Nhập tên của bạn" maxLength={50} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email hợp lệ", type: "email" }]}>
            <Input placeholder="Nhập email" maxLength={100} />
          </Form.Item>
          <Form.Item name="review" label="Nội dung góp ý/đánh giá" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
            <TextArea rows={5} placeholder="Mô tả chi tiết góp ý, báo lỗi hoặc đánh giá của bạn..." maxLength={1000} />
          </Form.Item>
          <Form.Item name="rating" label="Đánh giá chất lượng (1-5 sao)" rules={[{ required: true, message: "Vui lòng chọn số sao đánh giá" }]}>
            <Rate allowClear />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                borderRadius: "8px",
                background: "var(--color-primary)",
                borderColor: "var(--color-primary)",
                color: "#fff"
              }}
            >
              Gửi phản hồi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default Feedback;
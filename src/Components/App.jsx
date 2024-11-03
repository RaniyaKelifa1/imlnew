import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Select, Typography, Row, Col, Modal, Upload, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadFileToFirebase = async (file) => {
  const storageRef = ref(storage, 'uploads/' + file.name);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

const { Title } = Typography;
const { Option } = Select;

const ViewClaimsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/claims`);
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      message.error('Failed to fetch claims data');
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const handleFormSubmit = async (values) => {
    if (fileList.length === 0) {
      message.warning('Please upload a document');
      return;
    }

    setUploading(true);
    try {
      const file = fileList[0].originFileObj;
      const fileUrl = await uploadFileToFirebase(file);

      // Attach the document URL to form values
      values.documentUrl = fileUrl;
      // Make an API call to save the values in your backend
      console.log("Form values with document URL:", values);

      message.success("File uploaded and form submitted successfully!");
      form.resetFields();
      setFileList([]);
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: 'Claim Number',
      dataIndex: 'ClaimNumber',
      key: 'ClaimNumber',
    },
    {
      title: 'Policy Number',
      dataIndex: 'PolicyID',
      key: 'PolicyID',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button icon={<EyeOutlined />} onClick={() => navigate('/dashboard/viewclaimdet', { state: { claimID: record.ClaimID } })}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>Claims Overview</Title>
      <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
            Add Claim
          </Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={filteredData} rowKey="ClaimID" pagination={{ pageSize: 10 }} bordered />

      <Modal
        title="Add Claim Document"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit}>
          <Form.Item name="ClaimNumber" label="Claim Number" rules={[{ required: true, message: 'Please enter the claim number' }]}>
            <Input placeholder="Enter claim number" />
          </Form.Item>

          <Form.Item name="PolicyID" label="Policy Number" rules={[{ required: true, message: 'Please enter the policy number' }]}>
            <Input placeholder="Enter policy number" />
          </Form.Item>

          <Form.Item name="Document" label="Upload Document" rules={[{ required: true, message: 'Please upload a document' }]}>
            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Select Document</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading || fileList.length === 0}>
              {uploading ? 'Uploading...' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ViewClaimsPage;

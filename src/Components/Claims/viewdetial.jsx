import React, { useEffect, useState } from 'react';
import { Table, Typography, Card, Button, Modal, message, Form, Upload, Input, DatePicker, Select } from 'antd';
import { UploadOutlined,d } from '@ant-design/icons';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const ClaimDetailPage = () => {
  const [claimSteps, setClaimSteps] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [claimStatus, setClaimStatus] = useState('');
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [currentEditRecord, setCurrentEditRecord] = useState(null);

  const [form] = Form.useForm();
  const location = useLocation();
  const claimID = location.state?.claimID; 
  const claimNo = location.state?.claimNo; 

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        const stepsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/claim-steps/claim/${claimID}`);
        const paymentResponse = await axios.get(`${process.env.REACT_APP_API_URL}/payments/claim/${claimID}`);

        setClaimSteps(stepsResponse.data);
        console.log(stepsResponse.data)
        setPaymentDetails(paymentResponse.data);

        if (paymentResponse.data.length > 0) {
          setClaimStatus(paymentResponse.data[0].PaymentStatus);
        }
      } catch (error) {
        console.error('Error fetching claim details:', error);
      }
    };

    fetchClaimDetails();
  }, [claimID]);

  const getPaymentColor = (status) => {
    switch (status) {
      case 'Accepted': return 'green';
      case 'Rejected': return 'red';
      default: return 'black';
    }
  };

  const handleEditStep = (record) => {
    setCurrentEditRecord(record);
    setIsEditingStep(true);
    form.setFieldsValue({ ...record, StepDate: moment(record.StepDate) });
  };

  const handleEditPayment = (record) => {
    setCurrentEditRecord(record);
    setIsEditingPayment(true);
    form.setFieldsValue({ ...record, PaymentDate: moment(record.PaymentDate) });
  };

  const handleDeleteStep = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this step?',
      content: `Step Name: ${record.StepName}, Step Date: ${record.StepDate}`,
      onOk: async () => {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/claim-steps/${record.StepID}`);
          setClaimSteps((prev) => prev.filter((step) => step.StepID !== record.StepID));
          message.success('Step deleted successfully.');
        } catch (error) {
          console.error('Error deleting step:', error);
          message.error('Failed to delete step.');
        }
      },
    });
  };

  const handleDeletePayment = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this payment?',
      content: `Payment Amount: ${record.PaymentAmount}, Payment Date: ${record.PaymentDate}`,
      onOk: async () => {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}/payments/${record.PaymentID}`);
          setPaymentDetails((prev) => prev.filter((payment) => payment.PaymentID !== record.PaymentID));
          message.success('Payment deleted successfully.');
        } catch (error) {
          console.error('Error deleting payment:', error);
          message.error('Failed to delete payment.');
        }
      },
    });
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedRecord = { ...currentEditRecord, ...values, StepDate: values.StepDate.format('YYYY-MM-DD'), PaymentDate: values.PaymentDate?.format('YYYY-MM-DD') };

      if (isEditingStep) {
        await axios.put(`${process.env.REACT_APP_API_URL}/claim-steps/${updatedRecord.StepID}`, updatedRecord);
        setClaimSteps((prev) => prev.map((step) => (step.StepID === updatedRecord.StepID ? updatedRecord : step)));
        setIsEditingStep(false);
      } else if (isEditingPayment) {
        await axios.put(`${process.env.REACT_APP_API_URL}/payments/${updatedRecord.PaymentID}`, updatedRecord);
        setPaymentDetails((prev) => prev.map((payment) => (payment.PaymentID === updatedRecord.PaymentID ? updatedRecord : payment)));
        setIsEditingPayment(false);
      }

      setCurrentEditRecord(null);
      form.resetFields();
      message.success('Record updated successfully.');
    } catch (error) {
      console.error('Error updating record:', error);
      message.error('Failed to update record.');
    }
  };

  const claimStepsColumns = [
    { title: 'Step Name', dataIndex: 'StepName', key: 'StepName' },
    { title: 'Step Date', dataIndex: 'StepDate', key: 'StepDate' },
    { title: 'Step Status', dataIndex: 'StepStatus', key: 'StepStatus' },
    { title: 'Step Detail', dataIndex: 'StepDetail', key: 'StepDetail' },
    { 
      title: 'Document', 
      dataIndex: 'Document', // Assuming the URL is stored in documentUrl
      key: 'Document',
      render: (text, record) => (
          <a href={record.Document } target="_blank" rel="noopener noreferrer">
              View Document
          </a>
      ),
  },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => handleEditStep(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDeleteStep(record)}>Delete</Button>
        </>
      ),
    },
  ];

  const paymentColumns = [
    { title: 'Payment Amount', dataIndex: 'PaymentAmount', key: 'PaymentAmount' },
    { title: 'Payment Date', dataIndex: 'PaymentDate', key: 'PaymentDate' },
    {
      title: 'Payment Status',
      dataIndex: 'PaymentStatus',
      key: 'PaymentStatus',
      render: (text) => <span style={{ color: getPaymentColor(text) }}>{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button type="link" danger onClick={() => handleDeletePayment(record)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Claim Details for Claim No: {claimNo}</Title>
      <Card title="Claim Steps" style={{ marginBottom: '20px' }}>
        <Table dataSource={claimSteps} columns={claimStepsColumns} rowKey="StepID" pagination={false} />
      </Card>
      <Card title="Payment Details">
        {paymentDetails.length === 0 ? (
          <p>No payment details available.</p>
        ) : (
          <Table dataSource={paymentDetails} columns={paymentColumns} rowKey="PaymentID" pagination={false} />
        )}
      </Card>
      <Modal
        title="Edit Record"
        visible={isEditingStep || isEditingPayment}
        onCancel={() => {
          setIsEditingStep(false);
          setIsEditingPayment(false);
          form.resetFields();
        }}
        onOk={handleFormSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="StepName" label="Step Name" rules={[{ required: false }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item name="StepDate" label="Step Date" rules={[{ required: false }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="StepStatus" label="Step Status">
            <Select>
            <Option value="Secured">Secured</Option>
            <Option value="Not Secured">Not Secured</Option>
            </Select>
          </Form.Item>
          <Form.Item name="StepDetail" label="Step Detail">
            <Input />
          </Form.Item>
          <Form.Item name="Document" label="Document" rules={[{ required: false, message: 'Please upload a document for this step' }]}>
          <Upload
            // fileList={fileList}
            // onChange={handleUploadChange}
            beforeUpload={() => false} // Prevent automatic upload; handle with form submit
          >
            <Button icon={<UploadOutlined />}>Upload Document</Button>
          </Upload>
        </Form.Item>
          {isEditingPayment && (
            <>
              <Form.Item name="PaymentAmount" label="Payment Amount" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="PaymentStatus" label="Payment Status">
                <Select>
                  <Option value="Accepted">Accepted</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ClaimDetailPage;

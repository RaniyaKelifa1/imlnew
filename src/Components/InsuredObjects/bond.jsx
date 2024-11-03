import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Typography, Layout, message, Select } from 'antd';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddBondDetails = () => {
  const [form] = Form.useForm();
  const [insurableObjects, setInsurableObjects] = useState([]);

  useEffect(() => {
    // Fetch insurable objects when component mounts
    const fetchInsurableObjects = async () => {
      try {
        const response = await fetch('https://bminsurancebrokers.com/imstest/insurable-objects'); // Update with your API endpoint
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setInsurableObjects(data);
      } catch (error) {
        console.error('Error fetching insurable objects:', error);
        message.error('Failed to fetch insurable objects');
      }
    };

    fetchInsurableObjects();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Convert date format to ISO string
      const formattedValues = {
        ...values,
        DateOfBond: values.DateOfBond ? values.DateOfBond.format('YYYY-MM-DD') : null,
      };

      // Replace with your API endpoint
      const response = await fetch('https://bminsurancebrokers.com/imstest/bond-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('Bond Details added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding bond details:', error);
      message.error('Failed to add Bond Details');
    }
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        <Title level={2} style={{ color: '#001529' }}>Add Bond Details</Title>

        <Form
          form={form}
          name="add-bond-details"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
   <Form.Item
            name="InsurableObjectID"
            label="Insurable Object"
            rules={[{ required: true, message: 'Please select an insurable object' }]}
          >
            <Select placeholder="Select an insurable object">
              {insurableObjects.map(obj => (
                <Option key={obj.InsurableObjectID} value={obj.InsurableObjectID}>
                  {obj.ObjectType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="BondNumber"
            label="Bond Number"
            rules={[{ required: true, message: 'Please enter the bond number' }]}
          >
            <Input placeholder="Bond Number" />
          </Form.Item>

          <Form.Item
            name="Description"
            label="Description"
          >
            <Input.TextArea placeholder="Description" />
          </Form.Item>

          <Form.Item
            name="DateOfBond"
            label="Date of Bond"
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Date of Bond" />
          </Form.Item>

       

          <Form.Item
            name="AdditionalInfo"
            label="Additional Information"
          >
            <Input.TextArea placeholder="Additional Information" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Bond Details
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddBondDetails;

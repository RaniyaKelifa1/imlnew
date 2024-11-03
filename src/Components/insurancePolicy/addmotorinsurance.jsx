import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AddMotorInsurance = () => {
  const [form] = Form.useForm();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch policies from the backend
    const fetchPolicies = async () => {
      try {
        const response = await axios.get('https://bminsurancebrokers.com/imstest/insurance-policies');
        setPolicies(response.data); // Assume response.data is an array of policies
      } catch (error) {
        message.error('Failed to fetch policies');
        console.error('Error fetching policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleSubmit = async (values) => {
    try {
  // Provided by the user or generated
      const PolicyID = values.PolicyID;  // Selected from dropdown

      await axios.post('https://bminsurancebrokers.com/imstest/motor-insurance', {
  
        PolicyID,
        Purpose: values.Purpose
      });

      message.success('Motor Insurance added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding motor insurance:', error);
      message.error('Failed to add motor insurance');
    }
  };

  if (loading) return <Spin size="large" />; // Show loading spinner while fetching data

  return (
    <Form
      form={form}
      name="add-motor-insurance"
      onFinish={handleSubmit}
      layout="vertical"
      style={{ width: '100%', maxWidth: '600px' }}
    >
 
      <Form.Item
        name="PolicyID"
        label="Policy ID"
        rules={[{ required: true, message: 'Please select a policy ID' }]}
      >
        <Select placeholder="Select Policy ID" allowClear>
          {policies.map((policy) => (
            <Option key={policy.PolicyID} value={policy.PolicyID}>
              {policy.PolicyID} {/* Display PolicyID; adjust if you want more info */}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="Purpose"
        label="Purpose"
        rules={[{ required: true, message: 'Please enter the purpose' }]}
      >
        <Input placeholder="Enter Purpose" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Add Motor Insurance
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddMotorInsurance;

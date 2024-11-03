import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const FireLightningInsuranceForm = () => {
  const [form] = Form.useForm();
  const [policies, setPolicies] = useState([]);
  const [fireLightningInsuranceId, setFireLightningInsuranceId] = useState(null);

  useEffect(() => {
    // Fetch policies for the dropdown
    const fetchPolicies = async () => {
      try {
        const response = await axios.get('https://bminsurancebrokers.com/imstest/insurance-policies');
        setPolicies(response.data);
      } catch (error) {
        message.error('Failed to fetch policies');
      }
    };

    fetchPolicies();
  }, []);

  // Fetch specific Fire Lightning Insurance details if editing
  useEffect(() => {
    if (fireLightningInsuranceId) {
      const fetchFireLightningInsurance = async () => {
        try {
          const response = await axios.get(`https://bminsurancebrokers.com/imstest/fire-lightning-insurance/${fireLightningInsuranceId}`);
          form.setFieldsValue(response.data);
        } catch (error) {
          message.error('Failed to fetch fire lightning insurance details');
        }
      };

      fetchFireLightningInsurance();
    }
  }, [fireLightningInsuranceId, form]);

  const handleSubmit = async (values) => {
    try {
      if (fireLightningInsuranceId) {
        // Update existing Fire Lightning Insurance
        await axios.put(`https://bminsurancebrokers.com/imstest/fire-lightning-insurance/${fireLightningInsuranceId}`, values);
        message.success('Fire Lightning Insurance updated successfully!');
      } else {
        // Create new Fire Lightning Insurance
        await axios.post('https://bminsurancebrokers.com/imstest/fire-lightning-insurance', values);
        message.success('Fire Lightning Insurance created successfully!');
      }
      form.resetFields();
      setFireLightningInsuranceId(null);
    } catch (error) {
      message.error('Failed to submit fire lightning insurance');
    }
  };

  return (
    <Form
      form={form}
      name="fire-lightning-insurance-form"
      onFinish={handleSubmit}
      layout="vertical"
      style={{ width: '100%', maxWidth: '600px' }}
    >

      <Form.Item
        name="PolicyID"
        label="Policy ID"
        rules={[{ required: true, message: 'Please select the policy' }]}
      >
        <Select placeholder="Select Policy" allowClear>
          {policies.map((policy) => (
            <Option key={policy.PolicyID} value={policy.PolicyID}>
              {policy.PolicyNo}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="Peril"
        label="Peril"
        rules={[{ required: true, message: 'Please enter the peril' }]}
      >
        <Input placeholder="Enter Peril" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {fireLightningInsuranceId ? 'Update Fire Lightning Insurance' : 'Add Fire Lightning Insurance'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FireLightningInsuranceForm;

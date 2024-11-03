import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const MarineInsuranceForm = () => {
  const [form] = Form.useForm();
  const [policies, setPolicies] = useState([]);
  const [marineInsuranceId, setMarineInsuranceId] = useState(null);

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

  // Fetch specific Marine Insurance details if editing
  useEffect(() => {
    if (marineInsuranceId) {
      const fetchMarineInsurance = async () => {
        try {
          const response = await axios.get(`https://bminsurancebrokers.com/imstest/marine-insurance/${marineInsuranceId}`);
          form.setFieldsValue(response.data);
        } catch (error) {
          message.error('Failed to fetch marine insurance details');
        }
      };

      fetchMarineInsurance();
    }
  }, [marineInsuranceId, form]);

  const handleSubmit = async (values) => {
    try {
      if (marineInsuranceId) {
        // Update existing Marine Insurance
        await axios.put(`https://bminsurancebrokers.com/imstest/marine-insurance/${marineInsuranceId}`, values);
        message.success('Marine Insurance updated successfully!');
      } else {
        // Create new Marine Insurance
        await axios.post('https://bminsurancebrokers.com/imstest/marine-insurance', values);
        message.success('Marine Insurance created successfully!');
      }
      form.resetFields();
      setMarineInsuranceId(null);
    } catch (error) {
      message.error('Failed to submit marine insurance');
    }
  };

  return (
    <Form
      form={form}
      name="marine-insurance-form"
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
        name="Type"
        label="Type"
        rules={[{ required: true, message: 'Please enter the type of insurance' }]}
      >
        <Input placeholder="Enter Type" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {marineInsuranceId ? 'Update Marine Insurance' : 'Add Marine Insurance'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MarineInsuranceForm;

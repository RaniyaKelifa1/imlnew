import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;

const AddMiscellaneousObjectPage = () => {
  const [form] = Form.useForm();
  const [insurableObjects, setInsurableObjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch insurable objects for the dropdown
  useEffect(() => {
    const fetchInsurableObjects = async () => {
      try {
        const response = await axios.get('https://bminsurancebrokers.com/imstest/insurable-objects');
        setInsurableObjects(response.data);
      } catch (error) {
        message.error('Failed to fetch insurable objects');
      }
    };

    fetchInsurableObjects();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('https://bminsurancebrokers.com/imstest/miscellaneous-objects', values);
      message.success('Miscellaneous Object added successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add miscellaneous object');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Add Miscellaneous Object</h2>

      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="Description"
          label="Description"
          rules={[{ required: true, message: 'Please enter the description' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="InsurableObjectID"
          label="Insurable Object"
          rules={[{ required: true, message: 'Please select an insurable object' }]}
        >
          <Select placeholder="Select an insurable object">
            {insurableObjects.map((obj) => (
              <Option key={obj.InsurableObjectID} value={obj.InsurableObjectID}>
                {obj.ObjectType}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Miscellaneous Object
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddMiscellaneousObjectPage;

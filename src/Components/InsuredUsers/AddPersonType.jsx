import React, { useState } from 'react';
import { Form, Input, Button, Typography, Layout, message as antMessage } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

const AddPersonType = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (values) => {
    try {
      // Check if the person type already exists
      const checkResponse = await fetch(`https://bminsurancebrokers.com/imstest/persontypes/${values.TypeName}`, {
        method: 'GET',
      });

      if (checkResponse.ok) {
        const existingTypes = await checkResponse.json();

        // If the type exists, show an alert
        if (existingTypes.length > 0) {
          antMessage.warning('This person type already exists.');
          return; // Exit early
        }
      } else {
        antMessage.error('Error checking for existing person type.');
        return; // Exit early
      }

      // If the type does not exist, proceed with adding it
      const response = await fetch('https://bminsurancebrokers.com/imstest/persontypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          TypeName: values.TypeName,
        }),
      });

      if (response.ok) {
        antMessage.success('Person Type added successfully!');
        navigate('/dashboard/addperson'); // Redirect on success
      } else {
        antMessage.error('Failed to add Person Type.');
      }
    } catch (error) {
      console.error('Error adding person type:', error);
      antMessage.error('Failed to add Person Type.');
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '40px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add Person Type</Title>
        <Form
          form={form}
          name="add-person-type"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <Form.Item
            name="TypeName"
            label="Person Type Name"
            rules={[{ required: true, message: 'Please enter the person type name' }]}
          >
            <Input placeholder="Person Type Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Person Type
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddPersonType;

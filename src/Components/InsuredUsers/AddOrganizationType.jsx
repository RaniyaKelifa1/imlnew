import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Layout, message as antMessage } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;

const AddOrganizationType = () => {
  const [form] = Form.useForm();
  const [existingTypes, setExistingTypes] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch existing organization types when component mounts
    axios.get('https://bminsurancebrokers.com/imstest/organizationtypes')
      .then(response => setExistingTypes(response.data))
      .catch(error => antMessage.error('Failed to fetch existing organization types.'));
  }, []);

  const handleSubmit = async (values) => {
    const { TypeName } = values;

    // Check if the type name already exists
    if (!TypeName) {
      antMessage.error('Organization Type Name cannot be empty.');
      return;
    }

    const isDuplicate = existingTypes.some(type => 
      type.TypeName && type.TypeName.toLowerCase() === TypeName.toLowerCase()
    );

    if (isDuplicate) {
      antMessage.error('Organization Type with this name already exists.');
      return;
    }

    try {
      const response = await fetch('https://bminsurancebrokers.com/imstest/organizationtypes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ TypeName }),
      });

      if (response.ok) {
        antMessage.success('Organization Type added successfully!');
        navigate('/dashboard/addorganization'); // Redirect on success
      } else {
        antMessage.error('Failed to add Organization Type.');
      }
    } catch (error) {
      console.error('Error adding organization type:', error);
      antMessage.error('Failed to add Organization Type.');
    }
  };

  return (
    <Layout>
      <Content>
        <Title level={2} style={{ color: '#001529' }}>Add Organization Type</Title>
        <Form
          form={form}
          name="add-organization-type"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%' }}
        >
          <Form.Item
            name="TypeName"
            label="Organization Type Name"
            rules={[{ required: true, message: 'Please enter the organization type name' }]}
          >
            <Input placeholder="Organization Type Name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Organization Type
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddOrganizationType;

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Layout, Typography, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddProperty = () => {
  const [form] = Form.useForm();
  const [insurableObjects, setInsurableObjects] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch insurable objects when the form loads
    const fetchInsurableObjects = async () => {
      try {
        const response = await fetch('https://bminsurancebrokers.com/imstest/insurable-objects');
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
    console.log(values);
    try {
      const response = await fetch('https://bminsurancebrokers.com/imstest/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      message.success('Property added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding property:', error);
      message.error('Failed to add property');
    }
  };

  // Handle view properties redirection
  const handleViewProperties = () => {
    navigate('/dashboard/viewprop'); // Use navigate instead of history.push
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add Property</Title>
        
        <Form
          form={form}
          name="add-property"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          {/* View Properties Button */}
          <Form.Item>
            <Button
              onClick={handleViewProperties}
              style={{ width: '100%', maxWidth: '500px', backgroundColor: '#008080', color: '#ffffff' }}
              block
            >
              View Properties
            </Button>
          </Form.Item>

          <Form.Item
            name="InsurableObjectID"
            label="Insurable Object"
            rules={[{ required: true, message: 'Please select an Insurable Object' }]}
          >
            <Select placeholder="Select Insurable Object">
              {insurableObjects.map((object) => (
                <Option key={object.InsurableObjectID} value={object.InsurableObjectID}>
                  {object.ObjectType}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="Address"
            label="Property Address"
            rules={[{ required: true, message: 'Please enter the property address' }]}
          >
            <Input placeholder="Enter property address" />
          </Form.Item>

          <Form.Item
            name="PropertyType"
            label="Property Type"
            rules={[{ required: true, message: 'Please enter the property type' }]}
          >
            <Input placeholder="Enter property type" />
          </Form.Item>

          <Form.Item
            name="SumInsured"
            label="Sum Insured"
            rules={[{ required: true, message: 'Please enter the sum insured' }]}
          >
            <Input placeholder="Enter sum insured" />
          </Form.Item>

          <Form.Item
            name="AdditionalDetails"
            label="Additional Details"
            rules={[{ required: false }]}
          >
            <Input.TextArea placeholder="Enter any additional details" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Property
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddProperty;

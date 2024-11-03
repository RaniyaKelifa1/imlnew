import React, { useState } from 'react';
import { Form, Input, Button, Typography, Layout, message as antMessage } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

const AddAddress = () => {
  const [formData, setFormData] = useState({
    City: '',
    Subcity: '',
    HouseNo: '',
    Wereda: '',
  });
  const navigate = useNavigate(); // Use navigate for redirection

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('https://bminsurancebrokers.com/imstest/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        antMessage.success('Address added successfully!'); // Show success message
        setFormData({ City: '', Subcity: '', HouseNo: '', Wereda: '' }); // Reset form
        navigate('/dashboard/clientview'); // Navigate to client view
      } else {
        const error = await response.json();
        antMessage.error(`Failed to add address: ${error.message}`); // Show error message
      }
    } catch (error) {
      console.error('Error adding address:', error);
      antMessage.error('An error occurred while adding the address.'); // General error message
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side: Title and description */}
      <Content style={{ width: '40%', padding: '40px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add New Address</Title>
        <Title level={4} style={{ color: '#001529', fontWeight: 'lighter' }}>
          Fill out the form to add a new address. Ensure all required fields are filled out correctly to add an address to your system.
        </Title>
      </Content>

      {/* Right side: Form */}
      <Content style={{ width: '60%', padding: '40px' }}>
        <Form
          name="add-address"
          initialValues={formData}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <Form.Item
            name="City"
            label="City"
            rules={[{ required: true, message: 'Please enter the city' }]}
          >
            <Input placeholder="City" />
          </Form.Item>

          <Form.Item
            name="Subcity"
            label="Subcity"
            rules={[{ required: true, message: 'Please enter the subcity' }]}
          >
            <Input placeholder="Subcity" />
          </Form.Item>

          <Form.Item
            name="HouseNo"
            label="House No"
            rules={[{ required: true, message: 'Please enter the house number' }]}
          >
            <Input placeholder="House No" />
          </Form.Item>

          <Form.Item
            name="Wereda"
            label="Wereda"
            rules={[{ required: true, message: 'Please enter the wereda' }]}
          >
            <Input placeholder="Wereda" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Address
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddAddress;

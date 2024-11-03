import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Layout, Select, DatePicker, InputNumber, message as antMessage } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddContactPerson = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [contactTypes, setContactTypes] = useState([]);
  const [isNewAddress, setIsNewAddress] = useState(false); // State to toggle new address form
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/addresses`);
        const data = await response.json();
        setAddresses(data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        antMessage.error('Failed to fetch addresses.');
      }
    };

    const fetchContactTypes = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/person-types`);
        const data = await response.json();
        setContactTypes(data);
      } catch (error) {
        console.error('Error fetching contact types:', error);
        antMessage.error('Failed to fetch contact types.');
      }
    };

    fetchAddresses();
    fetchContactTypes();
    setIsNewAddress(true);
  }, []);


  const onFinish = async (values) => {
    setLoading(true);
  
    const contactPersonData = {
      FirstName: values.FirstName,
      LastName: values.LastName,
      PhoneNumber: values.PhoneNumber,
      Email: values.Email,
      NationalIDNo: parseInt(values.NationalID, 10),
      PersonTypeID: 1, // Assuming PersonTypeID is constant for now
      City: values.City,
      Gender: values.Gender,
      DateOfBirth: values.DateOfBirth?.format('YYYY-MM-DD'),
      Subcity: values.Subcity,
      HouseNo: values.HouseNo,
      Wereda: values.Wereda,
    };
    console.log(contactPersonData)

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/persons`, contactPersonData);
      antMessage.success('Contact person added successfully!');
      setFormData({}); // Clear form data if needed
      navigate('/dashboard/clientview')
    } catch (error) {
      antMessage.error(`An error occurred: ${error.message}`);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      <Content style={{ width: '40%', padding: '20px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add New Contact Person</Title>
      </Content>

      <Content style={{ width: '60%', padding: '40px' }}>
        <Form
          name="add-contact-person"
          initialValues={formData}
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <Form.Item
            name="FirstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the first name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="LastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the last name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="PhoneNumber"
            label="Phone Number"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item
            name="Email"
            label="Email"
            rules={[{ required: true, message: 'Please enter a valid email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="Gender"
            label="Gender"
            style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginRight: '8px' }}
            rules={[{ required: true, message: 'Please select your gender' }]}
          >
            <Select placeholder="Select Gender">
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="DateOfBirth"
            label="Date of Birth"
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
            rules={[{ required: true, message: 'Please select your date of birth' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Select Date of Birth" />
          </Form.Item>

          <Form.Item
            name="NationalID"
            label="National ID No"
            rules={[{ required: true, message: 'Please enter the National ID number' }]}
          >
            <InputNumber
              prefix={<IdcardOutlined />}
              placeholder="National ID No"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Address Details" style={{ marginBottom: 0 }}>
            <Form.Item
              name="City"
              label="City"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginRight: '8px' }}
              rules={[{ required: true, message: 'Please enter the city' }]}
            >
              <Input placeholder="Enter City" />
            </Form.Item>

            <Form.Item
              name="Subcity"
              label="Subcity"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginRight: '8px' }}
              rules={[{ required: true, message: 'Please enter the subcity' }]}
            >
              <Input placeholder="Enter Subcity" />
            </Form.Item>

            <Form.Item
              name="Wereda"
              label="Wereda"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)' }}
              rules={[{ required: true, message: 'Please enter wereda' }]}
            >
              <Input placeholder="Enter Wereda" />
            </Form.Item>

            <Form.Item
              name="HouseNo"
              label="House No"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginLeft: '8px' }}
              rules={[{ required: true, message: 'Please enter House No' }]}
            >
              <Input placeholder="Enter House No" />
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} disabled={loading}>
              Add Contact Person
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddContactPerson;

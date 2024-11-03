import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Layout, Select, Spin, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Name: '',
    PhoneNumber: '',
    Email: '',
    TINNo: '',
    AddressID: '',
    PersonID: '',
    City: '',
    Subcity: '',
    Wereda: '',
    HouseNo: '',
  });

  const [organizationTypes, setOrganizationTypes] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const orgTypesResponse = await fetch(`${process.env.REACT_APP_API_URL}/organizationtype`);
        if (!orgTypesResponse.ok) throw new Error('Failed to fetch organization types');
        const orgTypes = await orgTypesResponse.json();
        setOrganizationTypes(orgTypes);

        const addressesResponse = await fetch(`${process.env.REACT_APP_API_URL}/addresses`);
        if (!addressesResponse.ok) throw new Error('Failed to fetch addresses');
        const addressData = await addressesResponse.json();
        setAddresses(addressData);

        const personsResponse = await fetch(`${process.env.REACT_APP_API_URL}/persons`);
        if (!personsResponse.ok) throw new Error('Failed to fetch persons');
        const personData = await personsResponse.json();
        console.log(personData)
        setPersons(personData);
      } catch (err) {
        setError(err.message);
        notification.error({
          message: 'Fetch Error',
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (values) => {
    try {
      const orgaInfo = {
        Name: values.Name,
        PhoneNumber: values.PhoneNumber,
        Email: values.Email,
        OrganizationTypeID: values.OrganizationTypeID || 1, // Use a value from the form or default to 1
        TINNo: parseInt(values.TINNo, 10), // Parse TINNo to integer
        PersonID: values.PersonID || null, // Include PersonID if provided
        City: values.City,
        Subcity: values.Subcity,
        HouseNo: values.HouseNo,
        Wereda: values.Wereda,
      };
  console.log(orgaInfo)
      // Now submit the organization data
      const orgResponse = await fetch(`${process.env.REACT_APP_API_URL}/organizations`, {
        method: 'POST', // Specify the method as POST
        headers: {
          'Content-Type': 'application/json', // Set the content type
        },
        body: JSON.stringify(orgaInfo), // Stringify the body
      });
  
      if (!orgResponse.ok) {
        const error = await orgResponse.json(); // Get error details
        throw new Error(`Failed to add organization: ${error.message}`);
      }
  
      notification.success({
        message: 'Success',
        description: 'Organization added successfully!',
      });
  
      // Navigate to /dashboard/clientview after successful submission
      navigate('/dashboard/clientview');
    } catch (error) {
      console.error('Error adding organization:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to add organization. Please try again.',
      });
    }
  };
  
  

  if (loading) return <Spin size="large" />;

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      <Content style={{ width: '40%', padding: '40px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add New Organization</Title>
      </Content>

      <Content style={{ width: '60%', padding: '40px' }}>
        <Form
          name="add-organization"
          initialValues={formData}
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <Form.Item
            name="Name"
            label="Organization Name"
            rules={[{ required: true, message: 'Please enter the organization name' }]}
          >
            <Input placeholder="Organization Name" onChange={(e) => handleChange('Name', e.target.value)} />
          </Form.Item>

          <Form.Item
            name="PhoneNumber"
            label="Phone Number"
          >
            <Input placeholder="Phone Number" onChange={(e) => handleChange('PhoneNumber', e.target.value)} />
          </Form.Item>

          <Form.Item
            name="Email"
            label="Email"
            rules={[{ required: false, message: 'Please enter a valid email' }]}
          >
            <Input type="email" placeholder="Email" onChange={(e) => handleChange('Email', e.target.value)} />
          </Form.Item>

          <Form.Item
            name="TINNo"
            label="TIN Number"
            rules={[{ required: true, message: 'Please enter the TIN Number' }]}
          >
            <Input
              type="number"
              placeholder="TIN Number"
              onChange={(e) => handleChange('TINNo', e.target.value)} />
          </Form.Item>

          <Form.Item label="Address Details" style={{ marginBottom: 0 }}>
            <Form.Item
              name="City"
              label="City"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginRight: '8px' }}
              rules={[{ required: true, message: 'Please enter the city' }]}
            >
              <Input placeholder="Enter City" onChange={(e) => handleChange('City', e.target.value)} />
            </Form.Item>

            <Form.Item
              name="Subcity"
              label="Subcity"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginRight: '8px' }}
              rules={[{ required: true, message: 'Please enter the subcity' }]}
            >
              <Input placeholder="Enter Subcity" onChange={(e) => handleChange('Subcity', e.target.value)} />
            </Form.Item>

            <Form.Item
              name="Wereda"
              label="Wereda"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)' }}
              rules={[{ required: true, message: 'Please enter wereda' }]}
            >
              <Input placeholder="Enter Wereda" onChange={(e) => handleChange('Wereda', e.target.value)} />
            </Form.Item>

            <Form.Item
              name="HouseNo"
              label="House No"
              style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginLeft: '8px' }}
              rules={[{ required: true, message: 'Please enter House No' }]}
            >
              <Input placeholder="Enter House No" onChange={(e) => handleChange('HouseNo', e.target.value)} />
            </Form.Item>
          </Form.Item>

          <Form.Item
            name="PersonID"
            label="Contact Person"
            rules={[{ required: true, message: 'Please select a contact person' }]}
          >
            <Select placeholder="Select Contact Person" onChange={(value) => handleChange('PersonID', value)}>
              {persons.map((person) => (
                <Option key={person.PersonID} value={person.PersonID}>
                  {person.FirstName} {person.LastName}
                </Option>
              ))}
    
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Organization
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddOrganization;

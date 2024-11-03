import React, { useState, useEffect } from 'react';
import { Form, Input, Button,Modal, Typography, Layout, Select, DatePicker, InputNumber, message as antMessage, Table } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { Column } = Table;
const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

const AddSalesPerson = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [contactTypes, setContactTypes] = useState([]);
  const [salesAgents, setSalesAgents] = useState([]); // State for sales agents
  const [isNewAddress, setIsNewAddress] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

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


    const fetchSalesAgents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`);
        const data = await response.json();
    
        // Filter the data to only include agents with PersonTypeID equal to 2
        const filteredData = data.filter(agent => agent.PersonTypeID === 2);
        
        // Sort the filtered data by CreatedAt in descending order
        const sortedData = filteredData.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        
        setSalesAgents(sortedData); // Set the sorted sales agents
      } catch (error) {
        console.error('Error fetching sales agents:', error);
        antMessage.error('Failed to fetch sales agents.');
      }
    };
    
    

    fetchAddresses();
    fetchContactTypes();
    fetchSalesAgents(); // Fetch sales agents
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
      PersonTypeID: 2, // Assuming PersonTypeID is constant for now
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
      window.location.reload(); 
    
    } catch (error) {
      antMessage.error(`An error occurred: ${error.message}`);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleModalOk = async () => {
    try {
        const values = await form.validateFields();
        
        // Format DateOfBirth to "YYYY-MM-DD"
        if (values.DateOfBirth) {
            values.DateOfBirth = values.DateOfBirth.format('YYYY-MM-DD');
        }

        const recordID = currentType === 'organizations' ? editingRecord.OrganizationID : editingRecord.PersonID;

        // Update the record
        await axios.put(`${API_BASE_URL}/persons/${recordID}`, values);
        console.log(values);
        antMessage.success('Record updated successfully');
        setIsModalVisible(false);
        setEditingRecord(null);
        fetchData(); // Refetch data to update the table
    } catch (error) {
      antMessage.error('Failed to update record: ' + error.message);
    }
    window.location.reload(); // Refresh the page
};
const handleModalCancel = () => {
  setIsModalVisible(false);
  setEditingRecord(null);
};
 
  const handleDelete = async (recordID,addressID) => {
    try {

      await axios.delete(`${API_BASE_URL}/persons/${recordID}`);
      antMessage.success('Record deleted successfully');

      // If it's a person, delete the associated address
      if (addressID) {
        await axios.delete(`${API_BASE_URL}/addresses/${addressID}`);
        antMessage.success('Associated address deleted successfully');
      }

      fetchData(); // Refetch data to update the table
    } catch (error) {
      antMessage.error('Failed to delete record: ' + error.message);
    }
    window.location.reload(); // Refresh the page
  };
  const handleEditAddress = async (address) => {
    setEditingAddress(address);
    form.setFieldsValue({ ...address });
    setIsAddressModalVisible(true);
  };
  
  const handleAddressModalOk = async () => {
    try {
      const values = await form.validateFields();
      const addressID = editingAddress.AddressID;
  
      await axios.put(`${process.env.REACT_APP_API_URL}/addresses/${addressID}`, values);
      console.log(values)
      antMessage.success('Address updated successfully');
      setIsAddressModalVisible(false);
      setEditingAddress(null);
      fetchData();
    } catch (error) {
      antMessage.error('Failed to update address: ' + error.message);
    }
    window.location.reload(); // Refresh the page
  };
  const handleEdit = (type, record) => {
    setCurrentType(type);
    setEditingRecord(record);
    
    // Convert DateOfBirth to a moment object if it exists
    const updatedRecord = {
      ...record,
      DateOfBirth: record.DateOfBirth ? moment(record.DateOfBirth) : null,
    };
    
    form.setFieldsValue(updatedRecord);
    setIsModalVisible(true);
  };


  const handleAddressModalCancel = () => {
    setIsAddressModalVisible(false);
    setEditingAddress(null);
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: 'Phone Number',
      dataIndex: 'PhoneNumber',
      key: 'PhoneNumber',
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: 'Address',
      key: 'Address',
      render: (text, record) => {
        // Check if addresses data and AddressID are available
        const address = addresses?.find(addr => addr.AddressID === record.AddressID);
        
        if (address) {
          return (
            <div>
              <p>City: {address.City}</p>
              <p>Subcity: {address.Subcity}</p>
              <p>House No: {address.HouseNo}</p>
              <p>Wereda: {address.Wereda}</p>
              <Button onClick={() => handleEditAddress("persons", address)}>Edit</Button>
            </div>
          );
        } else {
          return <span>No Address Found</span>;
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit("persons", record)} 
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() =>{
              const salesAgent = salesAgents?.find(agent => agent.AddressID === record.AddressID);

      if (salesAgent) {
        const { AddressID } = salesAgent; // Extract AddressID for use in rendering or fetching

        // Optionally, fetch or display the address details
        const address = addresses?.find(addr => addr.AddressID === AddressID);
        handleDelete(record.PersonID, address)
      }
             
            }
              
              
              
              } 
            style={{ marginLeft: 8 }} 
          />
        </span>
      ),
    },
  ];
  
  return (
    
    <Layout style={{ minHeight: '100vh', display: 'flex' }}>
      
      <Modal
    title={`Edit ${currentType === 'organizations' ? 'Organization' : 'Person'}`}
  visible={isModalVisible}
  onOk={handleModalOk}
  onCancel={handleModalCancel}
>
  <Form form={form} layout="vertical" initialValues={editingRecord}>
    {currentType === 'persons' && (
      <>
        <Form.Item name="FirstName" label="First Name" rules={[{ required: true, message: 'Please enter the first name' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="LastName" label="Last Name" rules={[{ required: true, message: 'Please enter the last name' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="PhoneNumber" label="Phone Number" rules={[{ required: true, message: 'Please enter the phone number' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item name="NationalIDNo" label="National ID No" rules={[{ required: true, message: 'Please enter the National ID No' }]}>
          <Input />
        </Form.Item>
        
        <Form.Item
          name="Gender"
          label="Gender"
          style={{ display: 'inline-block', width: 'calc(50% - 8px)', marginRight: '8px' }}
          rules={[{ required: true, message: 'Please select the gender' }]}
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
          rules={[{ required: true, message: 'Please select the date of birth' }]}
        >
          <DatePicker style={{ width: '100%' }} placeholder="Select Date of Birth" />
        </Form.Item>
      </>
    )}
  </Form>
</Modal>

      <Content style={{ padding: '20px', display: 'flex', flexDirection: 'row' }}>
        {/* Left: Add Sales Person Form */}
        <div style={{ width: '50%', paddingRight: '20px' }}>
          <Title level={2} style={{ color: '#001529' }}>Add New Sales Person</Title>
          <Form
            name="add-sales-person"
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
                style={{ display: 'inline-block', width: 'calc(25% - 8px)', marginRight: '8px'}}
                rules={[{ required: true, message: 'Please enter wereda' }]}
              >
                <Input placeholder="Enter Wereda" />
              </Form.Item>

              <Form.Item
                name="HouseNo"
                label="House No"
                style={{ display: 'inline-block', width: 'calc(25% - 8px)' }}
                rules={[{ required: true, message: 'Please enter house number' }]}
              >
                <Input placeholder="House Number" />
              </Form.Item>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Sales Person
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Right: View Sales Agents Table */}
        <div style={{ width: '100%', paddingLeft: '20px' }}>
          <Title level={3} style={{ color: '#001529' }}>View Sales Agents</Title>
          <Table dataSource={salesAgents} columns={columns} rowKey="PersonID" />
        </div>
      </Content>
      
      <Modal
        title="Edit Address"
        visible={isAddressModalVisible}
        onOk={handleAddressModalOk}
        onCancel={handleAddressModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="City" label="City" rules={[{ required: true, message: 'Please input the city!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Subcity" label="Subcity" rules={[{ required: true, message: 'Please input the subcity!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="HouseNo" label="House No" rules={[{ required: true, message: 'Please input the house number!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Wereda" label="Wereda" rules={[{ required: true, message: 'Please input the wereda!' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>


    </Layout>
  );
};

export default AddSalesPerson;

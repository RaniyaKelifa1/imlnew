import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form,DatePicker, Select, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; 
import axios from 'axios';
import moment from 'moment';

const { Column } = Table;
const { Search } = Input;
const { Option } = Select;

const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

const DemoViewPage = () => {

  const [data, setData] = useState({
    organizations: [],
    persons: [],
    addresses: [],
  });
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [visible, setVisible] = useState('');
  const [onClose, setOnClose] = useState('');
  const [onRefresh, setOnRefresh] = useState('');
  const [address, setAddress] = useState('');
  // visible, onClose, address, onRefresh 
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState({
    organizations: '',
    persons: '',
    addresses: '',
  });
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
          const [addressesResponse, personsResponse, organizationsResponse] = await Promise.all([
              axios.get(`${API_BASE_URL}/addresses`),
              axios.get(`${API_BASE_URL}/persons`),
              axios.get(`${API_BASE_URL}/organizations`),
          ]);
  
          // Filter persons to only include those with PersonTypeID = 1
          const filteredPersons = personsResponse.data.filter(person => person.PersonTypeID === 1);
  
          // Sort addresses by CreatedAt in descending order
          const sortedAddresses = addressesResponse.data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  
          // Sort persons by CreatedAt in descending order
          const sortedPersons = filteredPersons.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  
          // Sort organizations by CreatedAt in descending order
          const sortedOrganizations = organizationsResponse.data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  
          setData({
              addresses: sortedAddresses,
              persons: sortedPersons, // Use the sorted data
              organizations: sortedOrganizations,
          });
      } catch (error) {
          message.error('Failed to fetch data: ' + error.message);
      }
  };
  
    

    fetchData();
  }, []);
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
  const handleDelete = async (type, recordID) => {
    try {
        // Check if it's a person or organization and get the associated AddressID
        const record = type === 'organizations' 
            ? data.organizations.find(org => org.OrganizationID === recordID) 
            : data.persons.find(person => person.PersonID === recordID);

        const addressID = type === 'persons' ? record.AddressID : null;

        // Delete the record based on its type
        if (type === 'persons') {
            await axios.delete(`${API_BASE_URL}/persons/${recordID}`);
            message.success('Record for persons deleted successfully');
        } else if (type === 'organizations') {
            await axios.delete(`${API_BASE_URL}/organizations/${recordID}`);
            message.success('Record for organizations deleted successfully');
        }

        // If it's a person, delete the associated address
        if (addressID) {
            await axios.delete(`${API_BASE_URL}/addresses/${addressID}`);
            message.success('Associated address deleted successfully');
        }

        // Fetch updated data without refreshing the page
        fetchData(); 
    } catch (error) {
        message.error('Failed to delete record: ' + error.message);
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
        await axios.put(`${API_BASE_URL}/${currentType}/${recordID}`, values);
        console.log(values);
        message.success('Record updated successfully');
        setIsModalVisible(false);
        setEditingRecord(null);
        fetchData(); // Refetch data to update the table
    } catch (error) {
        message.error('Failed to update record: ' + error.message);
    }
    window.location.reload(); // Refresh the page
};


  const handleSearch = (value, type) => {
    setSearchText(prev => ({ ...prev, [type]: value }));
  };

  const filteredData = (type) => {
    return data[type].filter(record =>
      Object.values(record).some(val => val.toString().toLowerCase().includes(searchText[type].toLowerCase()))
    );
  };



const handleModalCancel = () => {
  setIsModalVisible(false);
  setEditingRecord(null);
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

    await axios.put(`${API_BASE_URL}/addresses/${addressID}`, values);
    console.log(values)
    message.success('Address updated successfully');
    setIsAddressModalVisible(false);
    setEditingAddress(null);
    fetchData();
  } catch (error) {
    message.error('Failed to update address: ' + error.message);
  }
  window.location.reload(); // Refresh the page
};

const handleAddressModalCancel = () => {
  setIsAddressModalVisible(false);
  setEditingAddress(null);
};
  return (
    
    <>
    
      <div style={{ padding: '24px', backgroundColor: '#fff' }}>
     
        <h2>Organizations</h2>
        <Search
          placeholder="Search organizations"
          onSearch={value => handleSearch(value, 'organizations')}
          style={{ marginBottom: 16 }}
        />
        <Table dataSource={filteredData('organizations')} rowKey="OrganizationID">
          <Column title="Name" dataIndex="Name" key="Name" />
          <Column title="Phone Number" dataIndex="PhoneNumber" key="PhoneNumber" />
          <Column title="Email" dataIndex="Email" key="Email" />
          <Column title="TIN" dataIndex="TINNo" key="TINNo" />
          <Column title="PersonID" key="PersonID"   
          render={(text, record) => {
        // Find the address object that matches the record's AddressID
        const person = data.persons.find(addr => addr.PersonID === record.PersonID);

        if (person) {
            // Display each field in the address object as desired
            return (
                <div>
                   <p>Name: {person.Name}</p>
    <p>Phone Number: {person.PhoneNumber}</p>
    <p>Email: {person.Email}</p>
                  
                </div>
            );
        } else {
            return <span>No person Found</span>;
        }
    }}
/>
          <Column 
    title="Address" 
    key="Address"   
    render={(text, record) => {
      // Find the address object that matches the record's AddressID
      const address = data.addresses.find(addr => addr.AddressID === record.AddressID);
  
      if (address) {
          // Display each field in the address object as desired
          return (
              <div>
                  <p>City: {address.City}</p>
                  <p>Subcity: {address.Subcity}</p>
                  <p>House No: {address.HouseNo}</p>
                  <p>Wereda: {address.Wereda}</p>
                  <button onClick={() => handleEditAddress(address)}>Edit</button>
              </div>
          );
      } else {
          return <span>No Address Found</span>;
      }
  }}
/>
          <Column
            title="Actions"
            key="actions"
            render={(text, record) => (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit('organizations', record)}
                  type="primary"
                  style={{ marginRight: 8 }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete('organizations', record.OrganizationID)}
                  type="danger"
                />
              </>
            )}
          />
        </Table>

        <h2 style={{ marginTop: '24px' }}>Individual</h2>
        <Search
          placeholder="Search Individual"
          onSearch={value => handleSearch(value, 'persons')}
          style={{ marginBottom: 16 }}
        />
        <Table dataSource={filteredData('persons')} rowKey="PersonID">
        <Column title="Name" dataIndex="Name" key="Name" />
          <Column title="Phone Number" dataIndex="PhoneNumber" key="PhoneNumber" />
          <Column title="Email" dataIndex="Email" key="Email" />
          <Column title="National ID" dataIndex="NationalIDNo" key="NationalIDNo" />
          <Column title="Gender" dataIndex="Gender" key="Gender" />
          <Column title="Date Of Birth" dataIndex="DateOfBirth" key="DateOfBirth" />


          
          <Column 
    title="Address" 
    key="Address"   
    render={(text, record) => {
        // Find the address object that matches the record's AddressID
        const address = data.addresses.find(addr => addr.AddressID === record.AddressID);

        if (address) {
            // Display each field in the address object as desired
            return (
                <div>
                    <p>City: {address.City}</p>
                    <p>Subcity: {address.Subcity}</p>
                    <p>House No: {address.HouseNo}</p>
                    <p>Wereda: {address.Wereda}</p>
                    <button onClick={() => handleEditAddress(address)}>Edit</button>
                   
                </div>
            );
        } else {
            return <span>No Address Found</span>;
        }
    }}
/>

          <Column
            title="Actions"
            key="actions"
            render={(text, record) => (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit('persons', record)}
                  type="primary"
                  style={{ marginRight: 8 }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete('persons', record.PersonID)}
                  type="danger"
                />
              </>
            )}
          />
        </Table>
      </div>

      <Modal
        title={`Edit ${currentType === 'organizations' ? 'Organization' : 'Person'}`}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical" initialValues={editingRecord}>
          {currentType === 'persons' && (
            <>
              <Form.Item name="FirstName" label="First Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="LastName" label="Last Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="PhoneNumber" label="Phone Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="NationalIDNo" label="National ID No" rules={[{ required: true }]}>
                <Input />
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
              {/* <Form.Item
                name="AddressID"
                label="Address"
                rules={[{ required: true, message: 'Please select an address' }]}
              >
                <Select placeholder="Select Address">
                  {data.addresses.map((address) => (
                    <Option key={address.AddressID} value={address.AddressID}>
                      {address.City} - {address.Subcity} - {address.HouseNo} - {address.Wereda}
                    </Option>
                  ))}
                </Select>
              </Form.Item> */}
            </>
          )}
          {currentType === 'organizations' && (
            <>
              <Form.Item name="Name" label="Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="PhoneNumber" label="Phone Number" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="Email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="TINNo" label="TIN No" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              {/* <Form.Item
                name="AddressID"
                label="Address"
                rules={[{ required: true, message: 'Please select an address' }]}
              >
                <Select placeholder="Select Address">
                  {data.addresses.map((address) => (
                    <Option key={address.AddressID} value={address.AddressID}>
                      {address.City} - {address.Subcity} - {address.HouseNo} - {address.Wereda}
                    </Option>
                  ))}
                </Select>
              </Form.Item> */}
              <Form.Item
                name="PersonID"
                label="Contact Person"
                rules={[{ required: true, message: 'Please select a contact person' }]}
              >
                <Select placeholder="Select Contact Person">
                  {data.persons.map((person) => (
                    <Option key={person.PersonID} value={person.PersonID}>
                      {person.FirstName} {person.LastName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>


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
   
   
    </>
    
  );
};

export default DemoViewPage;

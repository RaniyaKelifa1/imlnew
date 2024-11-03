import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PropertyObjectsViewPage = () => {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit', 'add'
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://bminsurancebrokers.com/imstest/properties');
      setData(response.data);
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };

  const handleDelete = async (PropertyID) => {
    try {
      await axios.delete(`https://bminsurancebrokers.com/imstest/properties/${PropertyID}`);
      message.success('Property Object deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete property object');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalMode('edit');
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalMode('add');
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      if (modalMode === 'edit') {
        await axios.put(`https://bminsurancebrokers.com/imstest/properties/${editingItem.PropertyID}`, values);
        message.success('Property Object updated successfully');
      } else if (modalMode === 'add') {
        await axios.post('https://bminsurancebrokers.com/imstest/properties', values);
        message.success('Property Object added successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update property object');
    }
  };

  const handleAddPolicy = (propertyId) => {
    const propertydata={
      PInsurableObjectID: propertyId 
    }
    console.log(propertydata)
    navigate('/dashboard/addinsurance', { state: {propertydata } });
  };

  const columns = [
    { title: 'Address', dataIndex: 'Address', key: 'Address' },
    { title: 'Property Type', dataIndex: 'PropertyType', key: 'PropertyType' },
    { title: 'Sum Insured', dataIndex: 'SumInsured', key: 'SumInsured' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
          <Button onClick={() => handleDelete(record.PropertyID)} danger style={{ marginRight: 8 }}>Delete</Button>
          <Button onClick={() => handleAddPolicy(record.PropertyID)} type="primary">Add Policy</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={data} rowKey="PropertyID" />

      <Modal
        title={modalMode === 'edit' ? 'Edit Property Object' : 'Add Property Object'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={editingItem}
          onFinish={handleUpdate}
        >
          <Form.Item name="PropertyID" label="Property ID">
            <Input disabled={true} />
          </Form.Item>
          <Form.Item name="Address" label="Address" rules={[{ required: true, message: 'Please enter the address' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="PropertyType" label="Property Type" rules={[{ required: true, message: 'Please enter the property type' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="SumInsured" label="Sum Insured" rules={[{ required: true, message: 'Please enter the sum insured' }]}>
            <InputNumber min={0} style={{ width: '100%' }} disabled={modalMode === 'view'} />
          </Form.Item>

          {modalMode !== 'view' && (
            <Button type="primary" htmlType="submit">
              {modalMode === 'edit' ? 'Update' : 'Add'}
            </Button>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default PropertyObjectsViewPage;

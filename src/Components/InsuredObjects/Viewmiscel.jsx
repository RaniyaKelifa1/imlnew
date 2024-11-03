import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import axios from 'axios';

const MiscellaneousObjectsViewPage = () => {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit', 'view', 'add'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://bminsurancebrokers.com/imstest/miscellaneous-objects');
      setData(response.data);
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };

  const handleDelete = async (MiscellaneousObjectID) => {
    try {
      await axios.delete(`https://bminsurancebrokers.com/imstest/miscellaneous-objects/${MiscellaneousObjectID}`);
      message.success('Miscellaneous Object deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete miscellaneous object');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalMode('edit');
    setIsModalVisible(true);
  };

  const handleView = (item) => {
    setEditingItem(item);
    setModalMode('view');
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
        await axios.put(`https://bminsurancebrokers.com/imstest/miscellaneous-objects/${editingItem.MiscellaneousObjectID}`, values);
        message.success('Miscellaneous Object updated successfully');
      } else if (modalMode === 'add') {
        await axios.post('https://bminsurancebrokers.com/imstest/miscellaneous-objects', values);
        message.success('Miscellaneous Object added successfully');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update miscellaneous object');
    }
  };

  const columns = [
    { title: 'Miscellaneous Object ID', dataIndex: 'MiscellaneousObjectID', key: 'MiscellaneousObjectID' },
    { title: 'Description', dataIndex: 'Description', key: 'Description' },
    { title: 'Insurable Object ID', dataIndex: 'InsurableObjectID', key: 'InsurableObjectID' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleView(record)}>View</Button>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.MiscellaneousObjectID)} danger>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
        Add Miscellaneous Object
      </Button>

      <Table columns={columns} dataSource={data} rowKey="MiscellaneousObjectID" />

      <Modal
        title={modalMode === 'view' ? 'View Miscellaneous Object' : modalMode === 'edit' ? 'Edit Miscellaneous Object' : 'Add Miscellaneous Object'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={editingItem}
          onFinish={handleUpdate}
        >
          <Form.Item name="MiscellaneousObjectID" label="Miscellaneous Object ID">
            <Input disabled={true} />
          </Form.Item>
          <Form.Item name="Description" label="Description" rules={[{ required: true, message: 'Please enter the description' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="InsurableObjectID" label="Insurable Object ID" rules={[{ required: true, message: 'Please enter the insurable object ID' }]}>
            <Input disabled={modalMode === 'view'} />
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

export default MiscellaneousObjectsViewPage;

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import axios from 'axios';

const MachineriesViewPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null); // State for viewing item
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false); // State for view modal
  const [searchText, setSearchText] = useState(""); // State to handle search text

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get('https://bminsurancebrokers.com/imstest/machineries');
      setData(response.data);
      setFilteredData(response.data); // Initialize filtered data
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };

  // Handle deleting a machinery
  const handleDelete = async (MachineryID) => {
    try {
      await axios.delete(`https://bminsurancebrokers.com/imstest/machineries/${MachineryID}`);
      message.success('Machinery deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete machinery');
    }
  };

  // Handle editing a machinery
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  // Handle viewing a machinery
  const handleView = (item) => {
    setViewingItem(item);
    setIsViewModalVisible(true);
  };

  // Handle updating the machinery data
  const handleUpdate = async (values) => {
    try {
      await axios.put(`https://bminsurancebrokers.com/imstest/machineries/${editingItem.MachineryID}`, values);
      message.success('Machinery updated successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update machinery');
    }
  };

  // Handle searching by filtering the data
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.MakeAndModel.toLowerCase().includes(value.toLowerCase()) || 
      item.SerialNoOrChassisNo.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const columns = [
    { title: 'Make and Model', dataIndex: 'MakeAndModel', key: 'MakeAndModel' },
    { title: 'Year', dataIndex: 'Year', key: 'Year' },
    { title: 'Serial No / Chassis No', dataIndex: 'SerialNoOrChassisNo', key: 'SerialNoOrChassisNo' },
    { title: 'Sum Insured', dataIndex: 'SumInsured', key: 'SumInsured' },
    { title: 'Usage', dataIndex: 'Usage', key: 'Usage' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleView(record)}>View</Button>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.MachineryID)} danger>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      {/* Search Input */}
      <Input.Search
        placeholder="Search by Make and Model or Serial No"
        value={searchText}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      
      {/* Table for displaying machineries */}
      <Table columns={columns} dataSource={filteredData} rowKey="MachineryID" />

      {/* Modal for editing machineries */}
      <Modal
        title="Edit Machinery"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form initialValues={editingItem} onFinish={handleUpdate}>
          <Form.Item name="MakeAndModel" label="Make and Model">
            <Input />
          </Form.Item>
          <Form.Item name="Year" label="Year">
            <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="SerialNoOrChassisNo" label="Serial No / Chassis No">
            <Input />
          </Form.Item>
          <Form.Item name="SumInsured" label="Sum Insured">
            <Input />
          </Form.Item>
          <Form.Item name="Usage" label="Usage">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form>
      </Modal>

      {/* Modal for viewing machineries */}
      <Modal
        title="View Machinery"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Make and Model">
            <Input value={viewingItem?.MakeAndModel} disabled />
          </Form.Item>
          <Form.Item label="Year">
            <InputNumber value={viewingItem?.Year} disabled />
          </Form.Item>
          <Form.Item label="Serial No / Chassis No">
            <Input value={viewingItem?.SerialNoOrChassisNo} disabled />
          </Form.Item>
          <Form.Item label="Sum Insured">
            <Input value={viewingItem?.SumInsured} disabled />
          </Form.Item>
          <Form.Item label="Usage">
            <Input value={viewingItem?.Usage} disabled />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MachineriesViewPage;

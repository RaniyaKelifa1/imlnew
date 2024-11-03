import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Layout, Typography, Table, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;

const InsurableObjectForm = ({ insurableObjectID = null }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    fetchData();
    if (insurableObjectID) {
      setIsEditing(true);
      // Fetch the insurable object data by ID to prefill the form for editing
      axios.get(`https://bminsurancebrokers.com/imstest/insurable-objects/${insurableObjectID}`)
        .then(response => {
          form.setFieldsValue(response.data);
          setSelectedObject(response.data);
        })
        .catch(error => {
          message.error('Failed to load Insurable Object data');
        });
    } else {
      form.resetFields();
      setIsEditing(false);
    }
  }, [insurableObjectID, form]);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://bminsurancebrokers.com/imstest/insurable-objects');
      setData(response.data);
    } catch (error) {
      message.error('Failed to fetch Insurable Objects');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        // Update the existing insurable object
        await axios.put(`https://bminsurancebrokers.com/imstest/insurable-objects/${insurableObjectID}`, values);
        message.success('Insurable Object updated successfully!');
      } else {
        // Add a new insurable object
        await axios.post('https://bminsurancebrokers.com/imstest/insurable-objects', values);
        message.success('Insurable Object added successfully!');
      }
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('Failed to save Insurable Object');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setIsEditing(true);
    setSelectedObject(record);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://bminsurancebrokers.com/imstest/insurable-objects/${id}`);
      message.success('Insurable Object deleted successfully!');
      fetchData();
    } catch (error) {
      message.error('Failed to delete Insurable Object');
    }
  };

  const columns = [
    { title: 'Object Type', dataIndex: 'ObjectType', key: 'ObjectType' },
    { title: 'Description', dataIndex: 'Description', key: 'Description' },

  ];

  return (
    <Layout style={{ padding: '24px' }}>
      <Content>
        <Title level={2} style={{ color: '#001529' }}>
          {isEditing ? 'Edit Insurable Object' : 'Add Insurable Object'}
        </Title>
        <Form
          form={form}
          name="insurable-object-form"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px', marginBottom: '24px' }}
        >
          <Form.Item
            name="ObjectType"
            label="Object Type"
            rules={[{ required: true, message: 'Please enter the Object Type' }]}
          >
            <Input placeholder="Object Type" />
          </Form.Item>

          <Form.Item
            name="Description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditing ? 'Update Insurable Object' : 'Add Insurable Object'}
            </Button>
          </Form.Item>
        </Form>

        {/* Table for displaying insurable objects */}
        <Table columns={columns} dataSource={data} rowKey="id" />
      </Content>
    </Layout>
  );
};

export default InsurableObjectForm;

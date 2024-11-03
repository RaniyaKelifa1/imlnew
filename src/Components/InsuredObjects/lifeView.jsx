import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Radio, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const LifeObjectsViewPage = () => {
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit', 'view', 'add'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://bminsurancebrokers.com/imstest/life-objects');
      setData(response.data);
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };

  const handleDelete = async (LifeObjectID) => {
    try {
      await axios.delete(`https://bminsurancebrokers.com/imstest/life-objects/${LifeObjectID}`);
      message.success('Life Object deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete life object');
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
      // Convert date to YYYY-MM-DD format
      const formattedValues = {
        ...values,
        DateOfBirth: values.DateOfBirth ? values.DateOfBirth.format('YYYY-MM-DD') : null,
      };

      if (modalMode === 'edit') {
        await axios.put(`https://bminsurancebrokers.com/imstest/life-objects/${editingItem.LifeObjectID}`, formattedValues);
        message.success('Life Object updated successfully');
      } else if (modalMode === 'add') {
        await axios.post('https://bminsurancebrokers.com/imstest/life-objects', formattedValues);
        message.success('Life Object added successfully');
      }

      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to update life object');
    }
  };

  const columns = [
    { title: 'Name of Insured', dataIndex: 'NameOfInsured', key: 'NameOfInsured' },
    { title: 'Date of Birth', dataIndex: 'DateOfBirth', key: 'DateOfBirth', render: (date) => moment(date).format('YYYY-MM-DD') },
    { title: 'Gender', dataIndex: 'Gender', key: 'Gender' },
    { title: 'Occupation', dataIndex: 'Occupation', key: 'Occupation' },
    { title: 'Beneficiary Name', dataIndex: 'BeneficiaryName', key: 'BeneficiaryName' },
    { title: 'Beneficiary Relation', dataIndex: 'BeneficiaryRelation', key: 'BeneficiaryRelation' },
    { title: 'Health Condition', dataIndex: 'HealthCondition', key: 'HealthCondition' },
    { title: 'Medical History', dataIndex: 'MedicalHistory', key: 'MedicalHistory' },
    { title: 'Additional Coverage', dataIndex: 'AdditionalCoverage', key: 'AdditionalCoverage' },
    { title: 'Policy Terms', dataIndex: 'PolicyTerms', key: 'PolicyTerms' },
    { title: 'Exclusions', dataIndex: 'Exclusions', key: 'Exclusions' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button onClick={() => handleView(record)}>View</Button>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.LifeObjectID)} danger>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: '20px' }}>
        Add Life Object
      </Button>

      <Table columns={columns} dataSource={data} rowKey="LifeObjectID" />

      <Modal
        title={modalMode === 'view' ? 'View Life Object' : modalMode === 'edit' ? 'Edit Life Object' : 'Add Life Object'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          initialValues={{
            ...editingItem,
            DateOfBirth: editingItem?.DateOfBirth ? moment(editingItem.DateOfBirth, 'YYYY-MM-DD') : null,
          }}
          onFinish={handleUpdate}
        >
          <Form.Item name="NameOfInsured" label="Name of Insured" rules={[{ required: true, message: 'Please enter the name of the insured' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item
            name="DateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Please select the date of birth' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Date of Birth" />
          </Form.Item>

          <Form.Item name="Gender" label="Gender" rules={[{ required: true, message: 'Please select the gender' }]}>
            <Radio.Group disabled={modalMode === 'view'}>
              <Radio value="M">Male</Radio>
              <Radio value="F">Female</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="Occupation" label="Occupation" rules={[{ required: true, message: 'Please enter the occupation' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="BeneficiaryName" label="Beneficiary Name" rules={[{ required: true, message: 'Please enter the beneficiary name' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="BeneficiaryRelation" label="Beneficiary Relation" rules={[{ required: true, message: 'Please enter the beneficiary relation' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="HealthCondition" label="Health Condition" rules={[{ required: true, message: 'Please enter the health condition' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="MedicalHistory" label="Medical History" rules={[{ required: true, message: 'Please enter the medical history' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="AdditionalCoverage" label="Additional Coverage" rules={[{ required: true, message: 'Please enter additional coverage details' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="PolicyTerms" label="Policy Terms" rules={[{ required: true, message: 'Please enter policy terms' }]}>
            <Input disabled={modalMode === 'view'} />
          </Form.Item>
          <Form.Item name="Exclusions" label="Exclusions" rules={[{ required: true, message: 'Please enter exclusions' }]}>
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

export default LifeObjectsViewPage;

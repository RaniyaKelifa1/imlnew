import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Typography, Layout, message, Select } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddMachinery = () => {
  const [form] = Form.useForm();
  const [insurableObjects, setInsurableObjects] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch insurable objects when component mounts
    const fetchInsurableObjects = async () => {
      try {
        const response = await fetch('https://bminsurancebrokers.com/imstest/insurable-objects');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setInsurableObjects(data);
      } catch (error) {
        console.error('Error fetching insurable objects:', error);
        message.error('Failed to fetch insurable objects');
      }
    };

    fetchInsurableObjects();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('https://bminsurancebrokers.com/imstest/machineries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('Machinery added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding machinery:', error);
      message.error('Failed to add Machinery');
    }
  };

  // Handle view machinery redirection
  const handleViewMachinery = () => {
    navigate('/dashboard/viewMachinary'); // Use navigate instead of history.push
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add Machinery</Title>

        <Form
          form={form}
          name="add-machinery"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          {/* View Machinery Button */}
          <Form.Item>
            <Button
              onClick={handleViewMachinery}
              style={{ width: '100%', maxWidth: '500px', backgroundColor: '#008080', color: '#ffffff' }}
              block
            >
              View Machinery
            </Button>
          </Form.Item>

          <Form.Item
            name="InsurableObjectID"
            label="Insurable Object"
            rules={[{ required: true, message: 'Please select an insurable object' }]}
          >
            <Select placeholder="Select an insurable object">
              {insurableObjects.map(obj => (
                <Option key={obj.InsurableObjectID} value={obj.InsurableObjectID}>
                  {obj.ObjectType}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="MakeAndModel"
            label="Make and Model"
            rules={[{ required: true, message: 'Please enter the make and model' }]}
          >
            <Input placeholder="Make and Model" />
          </Form.Item>

          <Form.Item
            name="Year"
            label="Year"
            rules={[{ required: true, message: 'Please enter the year' }]}
          >
            <InputNumber placeholder="Year" min={1900} max={2100} />
          </Form.Item>

          <Form.Item
            name="SerialNoOrChassisNo"
            label="Serial No / Chassis No"
          >
            <Input placeholder="Serial No / Chassis No" />
          </Form.Item>

          <Form.Item
            name="SumInsured"
            label="Sum Insured"
            rules={[{ required: true, message: 'Please enter the sum insured' }]}
          >
            <InputNumber placeholder="Sum Insured" min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="Usage"
            label="Usage"
          >
            <Input placeholder="Usage" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Machinery
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddMachinery;

import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, Typography, Layout, message, Select, Radio } from 'antd';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddLifeObject = () => {
  const [form] = Form.useForm();
  const [insurableObjects, setInsurableObjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch insurable objects when the form loads
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
      // Convert date format to ISO string
      const formattedValues = {
        ...values,
        DateOfBirth: values.DateOfBirth ? values.DateOfBirth.format('YYYY-MM-DD') : null,
      };

      const response = await fetch('https://bminsurancebrokers.com/imstest/life-objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('Life Object added successfully!');
      form.resetFields();
    } catch (error) {
      console.error('Error adding life object:', error);
      message.error('Failed to add Life Object');
    }
  };

  const handleViewLifeObjects = () => {
    navigate('/dashboard/ViewLife');
  };

  return (
    <Layout style={{ padding: '24px' }}>
      <Content style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
        <Title level={2} style={{ color: '#001529' }}>Add Life Object</Title>

        <Form
          form={form}
          name="add-life-object"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <Form.Item>
            <Button
              onClick={handleViewLifeObjects}
              style={{ width: '100%', backgroundColor: '#008080', color: '#ffffff' }}
              block
            >
              View Life Objects
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
            name="NameOfInsured"
            label="Name of Insured"
            rules={[{ required: true, message: 'Please enter the name of the insured' }]}
          >
            <Input placeholder="Name of Insured" />
          </Form.Item>

          <Form.Item
            name="DateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Please select a date of birth' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Date of Birth" />
          </Form.Item>

          <Form.Item
            name="Gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select a gender' }]}
          >
            <Radio.Group>
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="Occupation"
            label="Occupation"
            rules={[{ required: true, message: 'Please enter the occupation' }]}
          >
            <Input placeholder="Occupation" />
          </Form.Item>

          <Form.Item
            name="BeneficiaryName"
            label="Beneficiary Name"
            rules={[{ required: true, message: 'Please enter the beneficiary name' }]}
          >
            <Input placeholder="Beneficiary Name" />
          </Form.Item>

          <Form.Item
            name="BeneficiaryRelation"
            label="Beneficiary Relation"
            rules={[{ required: true, message: 'Please enter the beneficiary relation' }]}
          >
            <Input placeholder="Beneficiary Relation" />
          </Form.Item>

          <Form.Item
            name="HealthCondition"
            label="Health Condition"
          >
            <Input.TextArea placeholder="Health Condition" />
          </Form.Item>

          <Form.Item
            name="MedicalHistory"
            label="Medical History"
          >
            <Input.TextArea placeholder="Medical History" />
          </Form.Item>

          <Form.Item
            name="AdditionalCoverage"
            label="Additional Coverage"
          >
            <Input.TextArea placeholder="Additional Coverage" />
          </Form.Item>

          <Form.Item
            name="PolicyTerms"
            label="Policy Terms"
          >
            <Input.TextArea placeholder="Policy Terms" />
          </Form.Item>

          <Form.Item
            name="Exclusions"
            label="Exclusions"
          >
            <Input.TextArea placeholder="Exclusions" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Life Object
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AddLifeObject;

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography,  DatePicker, Layout, InputNumber, Select, message, Row, Col,Radio } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, PlusCircleOutlined, EyeOutlined ,PlusOutlined} from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;


const WorkmensCompensationForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasAssistant, setHasAssistant] = useState(false); // Track if assistant is present
  const [vehicles, setVehicles] = useState([]); // State to store fetched vehicles
  const navigate = useNavigate();

  // Fetch the vehicles when the component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`);
        setVehicles(response.data); // Assuming response data contains an array of vehicles
      } catch (error) {
        message.error('Failed to fetch vehicles');
      }
    };

    fetchVehicles();
  }, []); // Empty dependency array to run only on component mount

  const onFinish = async (values) => {
    setLoading(true);
    
    // Set assistantSalary to null if no assistant
    values.assistantSalary = hasAssistant ? values.assistantSalary : null;

    try {
        // Make a POST request to save the data
        await axios.post(`${process.env.REACT_APP_API_URL}/WorkmenCompensation`, values);
        message.success('Workmen Compensation data saved successfully!');
        form.resetFields();
        setHasAssistant(false); // Reset assistant state
        navigate('/dashboard/viewworkmen')
    } catch (error) {
        message.error('Failed to save data: ' + error.message);
    } finally {
        setLoading(false);
    }
};




  return (

    <Layout style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
    <Content>
    <Title level={2} style={{ color: '#001529', textAlign: 'left' }}>

Add Workmen Compensation
</Title>

 
<Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ width: '100%', maxWidth: '500px' }}
    >
      {/* Salary */}
      <Form.Item
        label="Salary"
        name="salary"
        rules={[{ required: true, message: 'Please enter the salary!' }]}
      >
        <InputNumber
          min={0}
          precision={2}
          style={{ width: '100%' }}
          placeholder="Enter salary"
        />
      </Form.Item>

      {/* Assistant Presence */}
      <Form.Item label="Is there an assistant?" required>
        <Radio.Group
          onChange={(e) => setHasAssistant(e.target.value)}
          value={hasAssistant}
        >
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      </Form.Item>

      {/* Assistant Salary (show only if assistant is present) */}
      {hasAssistant && (
        <Form.Item
          label="Assistant Salary"
          name="assistantSalary"
          rules={[{ required: true, message: 'Please enter the assistant salary!' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            placeholder="Enter assistant salary"
          />
        </Form.Item>
      )}

      {/* Remark */}
      <Form.Item label="Remark" name="remark" rules={[{ required: true, message: 'Please enter a remark!' }]}>
        <TextArea rows={4} placeholder="Enter any remarks" />
      </Form.Item>

      {/* Vehicle ID */}
      <Form.Item
        label="Vehicle"
        name="vehicleID"
        rules={[{ required: true, message: 'Please select a vehicle!' }]}
      >
        <Select placeholder="Select a vehicle" loading={vehicles.length === 0}>
          {vehicles.map((vehicle) => (
            <Select.Option key={vehicle.VehicleID} value={vehicle.VehicleID}>
              {vehicle.PlateNo} ({vehicle.MakeAndModel})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>

      {/* View List Button */}
      <Form.Item>
       
      </Form.Item>
    </Form>
  
  </Content>
  </Layout>


 

);
};

export default WorkmensCompensationForm;

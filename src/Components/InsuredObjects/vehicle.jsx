import React from 'react';
import { Form, Input, Button, Typography,  DatePicker, Layout, InputNumber, Select, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, PlusCircleOutlined, EyeOutlined,PlusOutlined,MinusCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddVehicle = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    try {
      // Prepare vehicle data without the Excess field for the initial vehicle POST request
      const { Excess, ...vehicleData } = values; // Destructure to exclude Excess
      vehicleData.BoloDate = vehicleData.BoloDate ? vehicleData.BoloDate.format('YYYY-MM-DD') : null;
  
      console.log(vehicleData);
      
      // Send vehicle data to create the vehicle and get its ID
      const vehicleResponse = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
  


      const vehicleResult = await vehicleResponse.json();
      const vehicleId = vehicleResult.VehicleID; // Ensure you're accessing VehicleID, not id
      
      // Process each Excess entry and send it to the backend
      if (values.Excess && values.Excess.length > 0) {
          for (const excessEntry of values.Excess) {
              const excessData = {
                  VehicleID: vehicleId,
                  title: excessEntry.title,
                  amount: excessEntry.amount,
              };
              console.log(excessData);
      
              const excessResponse = await fetch(`${process.env.REACT_APP_API_URL}/excess`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(excessData),
              });
      
              if (!excessResponse.ok) {
                  console.error('Failed to add excess:', excessData);
                  throw new Error('Failed to add excess');
              }
          }
      }
      

      message.success('Vehicle and excess entries added successfully!');
      navigate('/dashboard/Viewveh');
      form.resetFields();
  
    } catch (error) {
      console.error('Error adding vehicle or excess:', error);
      message.error('Failed to add vehicle or excess entries');
    }
  };
  
  

  const handleViewVehicle = () => {
    navigate('/dashboard/Viewveh');
  };

  return (
    <Layout style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
    <Content>
    <Title level={2} style={{ color: '#001529', textAlign: 'left' }}>

Add Vehicles
</Title>
<Form
          form={form}
          name="add-vehicle"
          onFinish={handleSubmit}
          layout="vertical"
          style={{ width: '100%', maxWidth: '600px' }}
        >
          <Form.Item
            name="PlateNo"
            label="Plate No"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the Plate No' }]}
          >
            <Input placeholder="Enter Plate No" />
          </Form.Item>

          <Form.Item
            name="SerialNoOrChassisNo"
            label="Chassis No"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the Chassis No' }]}
          >
            <Input placeholder="Enter Chassis No" />
          </Form.Item>

          <Form.Item
            name="EngineNo"
            label="Engine No"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the Engine No' }]}
          >
            <Input placeholder="Enter Engine No" />
          </Form.Item>

          <Form.Item
            name="MakeAndModel"
            label="Make and Model"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the Make and Model' }]}
          >
            <Input placeholder="Enter Make and Model" />
          </Form.Item>

          <Form.Item
            name="CC_HP"
            label="CC/HP"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the CC/HP' }]}
          >
            <Input placeholder="Enter CC/HP" />
          </Form.Item>
          <Form.Item name="BoloDate"
          label =  'Bolo Date'
           style={{ display: 'inline-block',}} 
           rules={[{ required: true, message: 'Please select the bolo date' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="Bolo Date" />
        </Form.Item>
          <Form.Item
            name="Year"
            label="Year of Make"
            style={{ textAlign: 'left' }} // Left align
            rules={[
              { required: true, message: 'Please enter the Year' },
              { type: 'number', min: 1900, max: new Date().getFullYear(), message: 'Year must be between 1900 and the current year' },
            ]}
          >
            <InputNumber placeholder="Enter Year" style={{ width: '100%' }} />
          </Form.Item>

          {/* Capacity Section */}
          <Form.Item label="Capacity" style={{ textAlign: 'left' }}> {/* Left align */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="CarrierCapacity"
                  label="Carrier Capacity"
                  style={{ textAlign: 'left' }} // Left align
                  rules={[{ required: true, message: 'Please enter the Carrier Capacity' }]}
                >
                  <InputNumber placeholder="Enter Carrier Capacity" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="SeatCapacity"
                  label="Seat Capacity"
                  style={{ textAlign: 'left' }} // Left align
                  rules={[{ required: true, message: 'Please enter the Seat Capacity' }]}
                >
                  <InputNumber placeholder="Enter Seat Capacity" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item
            name="UseOfVehicle"
            label="Use of Vehicle"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ message: 'Please enter the Use of Vehicle' }]}
          >
            <Input placeholder="Enter Use of Vehicle" />
          </Form.Item>
          <Form.Item
            name="BodyType"
            label="Body Type"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ message: 'Please enter the Body Type' }]}
          >
            <Input placeholder="Enter Use of Body Type" />
          </Form.Item>
          <Form.Item
            name="SumInsured"
            label="Sum Insured"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please enter the Sum Insured' }]}
          >
            <InputNumber placeholder="Enter Sum Insured" style={{ width: '100%' }} />
          </Form.Item>

    {/* Excess - Dynamic List of Title and Amount */}
    <Form.Item label="Excess" style={{ textAlign: 'left' }}>
            <Form.List name="Excess">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Row gutter={16} key={key} align="middle">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          fieldKey={[fieldKey, 'title']}
                          rules={[{ required: true, message: 'Please enter a title' }]}
                        >
                          <Input placeholder="Title" />
                        </Form.Item>
                      </Col>
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'amount']}
                          fieldKey={[fieldKey, 'amount']}
                          rules={[{ required: true, message: 'Please enter an amount' }]}
                        >
                          <Input placeholder="Amount" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: '100%' }}
                    >
                      Add Excess Entry
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="DutyFree"
            label="Duty Free"
            style={{ textAlign: 'left' }} // Left align
            rules={[{ required: true, message: 'Please select Duty Free status' }]}
          >
            <Select placeholder="Select Duty Free Status" style={{ width: '100%' }}>
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="Remark"
            label="Remark"
            style={{ textAlign: 'left' }} // Left align
          >
            <Input placeholder="Enter Remark" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              icon={<PlusCircleOutlined />}
              style={{ backgroundColor: '#007acc', borderColor: '#005bb5' }}
            >
              Add Vehicle
            </Button>
          </Form.Item>
        </Form>

  </Content>
  </Layout>



  );
};

export default AddVehicle;

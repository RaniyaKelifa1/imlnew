import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography, Layout, Row, Col, message, Input as AntdInput, InputNumber } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, PlusCircleOutlined, EyeOutlined ,PlusOutlined} from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const WorkmenCompensationViewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddPolicyModalVisible, setIsAddPolicyModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCompensationId, setSelectedCompensationId] = useState(null);
  const [existingPolicies, setExistingPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [linkedPolicyNo, setLinkedPolicyNo] = useState(null); // State for linked policy number
  const objectType = 'WorkmenCompensation';
  const [vehicles, setVehicles] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Workmen's Compensation Data
      const compensationResponse = await axios.get(`${process.env.REACT_APP_API_URL}/WorkmenCompensation`);
      const compensations = compensationResponse.data;
  
      // Fetch all vehicles
      const vehiclesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`);
      const vehiclesData = vehiclesResponse.data;
  
      // Map vehicleID to PlateNo and add it to the compensation data
      const enrichedData = compensations.map((compensation) => {
        const vehicle = vehiclesData.find(v => v.VehicleID === compensation.VehicleID);
  
        return {
          ...compensation,
          plateNo: vehicle ? vehicle.PlateNo : 'N/A' // Add PlateNo to compensation data
        };
      });
  
      setData(enrichedData);
      setFilteredData(enrichedData);
      setVehicles(vehiclesData); // Store vehicles in state
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };
  

  const fetchExistingPolicies = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/policies`);
      const filteredPolicies = response.data.filter(
        (policy) => policy.PolicyType === '1a2b3c4d5e'
      );
      setExistingPolicies(filteredPolicies);
    } catch (error) {
      message.error(`Failed to fetch Workmen's Compensation policies`);
    }
  };
  

  const handleDelete = async (CompensationID) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/WorkmenCompensation/${CompensationID}`);
      message.success('Compensation deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete compensation');
    }
  };



  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
        // Ensure Salary and AssistantSalary are numbers
        const salary = parseFloat(values.salary);
        const assistantSalary = parseFloat(values.assistantSalary);
        const remark = values.remark; // Should be a string
        const vehicleID = values.vehicleID; // Should be a string

        // Optional: Validate lengths
        if (remark.length > 510) {
            return message.error('Remark must not exceed 510 characters.');
        }
        if (vehicleID.length > 10) {
            return message.error('Vehicle ID must not exceed 10 characters.');
        }

        // Create the payload with the updated values
        const payload = {
            salary,
            assistantSalary,
            remark,
            vehicleID,
        };

        // Send the update request
        await axios.put(`${process.env.REACT_APP_API_URL}/WorkmenCompensation/${editingItem.CompensationID}`, payload);
        
        message.success('Compensation updated successfully');
        console.log(payload);
        setIsModalVisible(false);
        setEditingItem(null);
        fetchData();
    } catch (error) {
        console.log(values);
        console.error("Error updating compensation:", error); // Log error for debugging
        message.error('Failed to update compensation');
    }
};

  

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.remark.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };
  const handleAddPolicyClick = async (compensationId) => {
    setSelectedCompensationId(compensationId);

    // Fetch all insurable objects first
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurableobjects`);
      const insurableObjects = response.data; // Assuming the API returns an array of insurable objects
  
      // Loop through the insurable objects to check if the compensation has a linked policy
      for (let i = 0; i < insurableObjects.length; i++) {
        console.log("d")
        console.log(insurableObjects[i].ObjectID)
        if (insurableObjects[i].ObjectID == compensationId) {
       
          // If the compensation is already linked to a policy, show the info message and stop
          message.info('This compensation is already linked to a policy.');
          return; // Exit the function and prevent the modal from opening or other actions
        }
      }
  
      // If no linked policy is found, proceed with other actions
      setSelectedPolicyId(null); // No existing policy, user will select/create
      setLinkedPolicyNo(null); // Reset linked policy number
      setIsAddPolicyModalVisible(true); // Open the modal to add a new policy
    } catch (error) {
      message.error('Failed to fetch insurable objects.');
    }
  };
  

  const handleAddToExistingPolicy = async () => {
    if (!selectedCompensationId || !selectedPolicyId) return;

    try {
      const insurableObjectData = {
        PolicyID: selectedPolicyId,           // Selected policy ID
        ObjectID: selectedCompensationId,     // Compensation ID as ObjectID
        ObjectType: 'WorkmenCompensation',
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/insurableobjects`, insurableObjectData);

      message.success('Compensation added to existing policy successfully');
      setIsAddPolicyModalVisible(false);
      setSelectedCompensationId(null);
      setSelectedPolicyId(null);
      setLinkedPolicyNo(null); // Reset linked policy number
      fetchData();
    } catch (error) {
      message.error('Failed to add compensation to policy');
    }
  };

  const columns = [
    { title: 'Salary', dataIndex: 'Salary', key: 'Salary' },
    { title: 'Assistant Salary', dataIndex: 'AssistantSalary', key: 'AssistantSalary' },
    { title: 'Remark', dataIndex: 'Remark', key: 'Remark' },
    { title: 'Vehicle Plate No', dataIndex: 'plateNo', key: 'plateNo' }, // Display the plate number
    // { title: 'Vehicle ID', dataIndex: 'vehicleID', key: 'vehicleID' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          {/* <Button onClick={() => handleEdit(record)}>Edit</Button> */}
        
          <Button onClick={() => handleEdit(record)}style={{ marginLeft: '8px',color: 'green' }}>
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.CompensationID)}style={{ marginLeft: '8px' }} danger>
            Delete
          </Button>
          <Button onClick={() => handleAddPolicyClick(record.CompensationID)} style={{ marginLeft: '8px',backgroundColor: '#001529' ,color: "white"}}>
            Add Policy
          </Button>
          

        </>
      ),
    },
  ];

  return (
    
    <>




     <Title level={2} style={{ textAlign: 'center', marginBottom: 20, }}>Workmen Compensation Overview</Title>
     
      
    <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Col>
          <Input.Search
          placeholder="Search by Remark"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={(value) => handleSearch(value)}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/dashboard/workmen')}
          >
            Add Workmen Compensation
          </Button>
        </Col>
      </Row>
      <Table columns={columns} dataSource={filteredData} rowKey="CompensationID" />

      {/* Edit Compensation Modal */}
      <Modal
  title="Edit Compensation"
  visible={isModalVisible}
  onCancel={() => {
    setIsModalVisible(false);
    setEditingItem(null);
  }}
  footer={null}
>
  <Form initialValues={editingItem} onFinish={handleUpdate}>
    <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
      <InputNumber />
    </Form.Item>
    
    <Form.Item name="assistantSalary" label="Assistant Salary">
      <InputNumber />
    </Form.Item>
    
    <Form.Item name="remark" label="Remark">
      <Input />
    </Form.Item>

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

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Update
      </Button>
    </Form.Item>
  </Form>
</Modal>




      {/* Add Policy Modal */}
      <Modal
        title="Add Policy"
        visible={isAddPolicyModalVisible}
        onCancel={() => {
          setIsAddPolicyModalVisible(false);
          setSelectedCompensationId(null);
          setSelectedPolicyId(null);
          setLinkedPolicyNo(null); // Reset linked policy number
        }}
        footer={null}
      >
        <Select
          placeholder="Select an existing policy"
          onChange={(value) => setSelectedPolicyId(value)}
          style={{ width: '100%', marginBottom: 16 }}
          disabled={existingPolicies.length === 0}
        >
          {existingPolicies.map((policy) => (
            <Option key={policy.PolicyID} value={policy.PolicyID}>
              {policy.PolicyNo} - {policy.NameOfInsured}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          onClick={handleAddToExistingPolicy}
          disabled={!selectedPolicyId || !!linkedPolicyNo} // Disable if linked policy exists
        >
          Add to Selected Policy
        </Button>

        {/* Display the linked policy number */}
        {linkedPolicyNo && (
          <div style={{ marginTop: '16px' }}>
            <strong>Already Linked:</strong> Policy Number: {linkedPolicyNo}
          </div>
        )}

        <Button
          type="secondary"
          onClick={() => navigate(`/dashboard/addinsurance`, { state: { selectedCompensationId, objectType } })}
          style={{ marginLeft: 16 }}
          disabled={!!linkedPolicyNo} // Disable if a policy is linked
        >
          Create New Policy
        </Button>
      </Modal>
    </>
  );
};

export default WorkmenCompensationViewPage;

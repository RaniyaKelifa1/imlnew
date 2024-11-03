import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Select, Space, Tooltip, Typography, Row, Col, Card ,Tag, Modal, Checkbox, DatePicker,Button, message} from 'antd';
import {CarOutlined, PlusOutlined, FileAddOutlined, EditOutlined, DeleteOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title } = Typography;


const VehiclesViewPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEModalVisible, setIsEModalVisible] = useState(false);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [isAddPolicyModalVisible, setIsAddPolicyModalVisible] = useState(false);
  const [isAddAdditionalPolicyModalVisible, setIsAddAdditionalPolicyModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false); // New state for view modal
  const [searchText, setSearchText] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [existingPolicies, setExistingPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [linkedPolicyNo, setLinkedPolicyNo] = useState(null);
  const [excessData, setExcessData] = useState({});
  const [selectedAdditionalPolicies, setSelectedAdditionalPolicies] = useState([]);
  const [insurablePolicy,setinsurablePolicy] =useState([]);
  const [currentExcess, setCurrentExcess] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
   const objectTypes = 'Vehicles'



  useEffect(() => {
    fetchExcessData ();
    fetchData();
  }, []);

  const fetchExcessData = async (vehicleId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/excess/${vehicleId}`);
      setExcessData(prev => ({ ...prev, [vehicleId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch excess data:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`);
      
      // Sort the fetched data by CreatedAt in descending order
      const sortedData = response.data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
  
      setData(sortedData); // Set the sorted data
      setFilteredData(sortedData); // Also set the filtered data to the sorted data
    } catch (error) {
      message.error('Failed to fetch data');
    }
  };
  
  
  const fetchExistingPolicies = async () => {
    try {
      // Fetch policies and policy types
      const [policiesResponse, policyTypesResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/policies`),
        axios.get(`${process.env.REACT_APP_API_URL}/insurancepolicytypes`)
      ]);
  
      const filteredPolicyTypeIDs = policyTypesResponse.data
      .filter(type => ['Motor Insurance', 'Carriers Liability'].includes(type.Ptype))
      .map(type => type.PolicyTypeID);
  
  
      const filteredPolicies = policiesResponse.data.filter(policy => 
        filteredPolicyTypeIDs.includes(policy.PolicyType)
      );
  
      const FilteredPolicies = filteredPolicies.map(policy => ({
        PolicyID: policy.PolicyID,
        PolicyNo: policy.PolicyNo
      }));
  console.log(FilteredPolicies)
      setExistingPolicies(FilteredPolicies);
      console.log("Existing Policies:", FilteredPolicies); // Debug log
    } catch (error) {
      message.error('Failed to fetch Motor policies');
      console.error('Error fetching policies:', error);
    }
  };
  
  const handleDelete = async (VehicleID) => {
    try {
      // First, delete excess entries associated with the vehicle
      await axios.delete(`${process.env.REACT_APP_API_URL}/excess/excess/${VehicleID}`);
      
      // Then, delete the vehicle
      await axios.delete(`${process.env.REACT_APP_API_URL}/vehicles/${VehicleID}`);
      
      message.success('Vehicle and associated excess entries deleted successfully');
      fetchData(); // Refresh data after deletion
    } catch (error) {
      message.error('Failed to delete vehicle or excess entries');
      console.error('Error deleting vehicle:', error);
    }
  };
  
 

  const handleOk = async () => {
    // Your save logic here
    console.log('Saved excess:', currentExcess);
  
    // Prepare the request body
    const updatedExcess = {
      title: currentExcess.Title,
      amount: currentExcess.Amount,
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/excess/${currentExcess.ExcessID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExcess),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update excess');
      }
  
      const result = await response.json();
      console.log(result.message); // Log success message
  
      // Optionally refresh the excess data or re-fetch the data if necessary
  
      // Close the modal after saving
      setIsEModalVisible(false);
    } catch (error) {
      console.error('Error updating excess:', error);
      // Handle error (show notification, alert, etc.)
    }
  };
  
  const handleCancel = () => {
    setIsEModalVisible(false);
  };

  const handleEditChange = (field, value) => {
    setCurrentExcess(prev => ({ ...prev, [field]: value }));
  };
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsEModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
   console.log(values)
    // await axios.put(`https://bminsurancebrokers.com/imstestvehicles/${editingItem.VehicleID}`, values);
      message.success('Vehicle updated successfully');
      setIsModalVisible(false);
      setEditingItem(null);
      fetchData();

      // if (values && values.BoloDate) {
      //   const BoloDate = moment(values.BoloDate, 'YYYY-MM-DD');
      //   if (BoloDate.isValid()) {
      //     form.setFieldsValue({ BoloDate: BoloDate });
      //   } else {
      //     console.error('Invalid Bolo Date:', values.BoloDate);
      //   }
      // }
    } catch (error) {
      message.error('Failed to update vehicle');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.MakeAndModel.toLowerCase().includes(value.toLowerCase()) || 
      item.PlateNo.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleView = (vehicle) => {
    setSelectedVehicleId(vehicle.VehicleID);
    setIsViewModalVisible(true);
  };




  const handleAddAdditionalPolicyClick = async (vehicleId, plateno) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurableobjects`);
      const insurableObjects = response.data;
  
      let policyId = null;
  
      // Loop through the insurable objects to find the matching vehicleId
      for (let i = 0; i < insurableObjects.length; i++) {
        if (insurableObjects[i].ObjectID === vehicleId) {
          console.log(insurableObjects[i].PolicyID);
          policyId = insurableObjects[i].PolicyID;
          setinsurablePolicy(policyId);  // Set policy in state
          break;
        }
      }
  
      // If no policy found, reset the selectedPolicyId and show the modal
      if (!policyId) {
        setSelectedPolicyId(null);
        setLinkedPolicyNo(null);
        setIsAddPolicyModalVisible(true);
        return; // Exit early if no policy is found
      }
  
      // If a policy is found, navigate to the next page
      const policyData = { PlateNo: plateno, PolicyID: policyId ,VehicleID: vehicleId, objectTypes:objectTypes};  // Use the local variable policyId
      navigate('/dashboard/addpolicies', { state: policyData });
  
      setSelectedVehicleId(vehicleId);
      fetchExistingPolicies();  // Assuming this fetches any additional policies
      setSelectedAdditionalPolicies([]);  // Reset additional policy selection
  
    } catch (error) {
      console.error('Error fetching insurable objects:', error);
      message.error('Failed to fetch insurable objects.');
    }
  };
  

  const handleAddPolicyClick = async (vehicleId) => {
    fetchExistingPolicies(); 
    setSelectedVehicleId(vehicleId);
  
    // Fetch all insurable objects first
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurableobjects`);
      const insurableObjects = response.data; // Assuming the API returns an array of insurable objects
  

      for (let i = 0; i < insurableObjects.length; i++) {
        if (insurableObjects[i].ObjectID === vehicleId) {
          // If the vehicle is already linked to a policy, show the info message and stop
          message.info('This vehicle is already linked to a policy.');
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
    if (!selectedVehicleId || !selectedPolicyId) return;
 console.log(selectedVehicleId)
    try {
      const insurableObjectData = {
        PolicyID: selectedPolicyId,           // Selected policy ID
        ObjectID: selectedVehicleId,          // Vehicle ID as ObjectID
        ObjectType:'Vehicles',
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/insurableobjects`, insurableObjectData);

      message.success('Vehicle added to existing policy successfully');
      setIsAddPolicyModalVisible(false);
      // setSelectedVehicleId(null);
      // setSelectedPolicyId(null);
      // setLinkedPolicyNo(null); // Reset linked policy number
      fetchData();
    } catch (error) {
      message.error('Failed to add vehicle to policy');
    }
  };
  const showModal = (excess) => {
    setCurrentExcess(excess);
    setIsEModalVisible(true);
  };

  const handleEditVehicle = (item) => {
    setEditingVehicle(item);
    setIsVehicleModalVisible(true);
  };
  
  

  const handleVehicleUpdate = async (values) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/vehicles/${editingVehicle.VehicleID}`, values);
      message.success('Vehicle updated successfully');
      setIsVehicleModalVisible(false);
      setEditingVehicle(null);
      fetchData();
    } catch (error) {
      message.error('Failed to update vehicle');
    }
  };

  const showExcessModal = (excess) => {
    setCurrentExcess(excess);
    setIsExcessModalVisible(true);
  };

  const handleExcessUpdate = async () => {
    try {
      const updatedExcess = {
        title: currentExcess.Title,
        amount: currentExcess.Amount,
      };
      await axios.put(`${process.env.REACT_APP_API_URL}/excess/${currentExcess.ExcessID}`, updatedExcess);
      message.success('Excess updated successfully');
      setIsExcessModalVisible(false);
    } catch (error) {
      message.error('Failed to update excess');
    }
  };
  const columns = [
    {
      title: 'Make and Model',
      dataIndex: 'MakeAndModel',
      key: 'MakeAndModel',
      render: (text) => (
        <span>
          <CarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          <strong>{text}</strong>
        </span>
      ),
    },
    { title: 'Year', dataIndex: 'Year', key: 'Year' },
    // { title: 'Body Type', dataIndex: 'BodyType', key: 'BodyType' },
    { title: 'Plate Number', dataIndex: 'PlateNo', key: 'PlateNo' },


    {
      title: 'Excess',
      render: (_, record) => {
        fetchExcessData(record.VehicleID);
    
        const vehicleExcess = excessData[record.VehicleID] || [];
      
        
      
    
        return (
          <div>
            <ul>
              {vehicleExcess.map(excess => (
                  <li key={excess.ExcessID}>
                  {excess.Title} : {excess.Amount}
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    onClick={() => showModal(excess)} 
                    style={{ marginLeft: '10px' }}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      },
    },
  
  



    { title: 'Sum Insured', dataIndex: 'SumInsured', key: 'SumInsured' },
    { title: 'Use of Vehicle', dataIndex: 'UseOfVehicle', key: 'UseOfVehicle' },

    

    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="View Vehicle Details">
            <Button onClick={() => handleView(record)} icon={<EyeOutlined />} style={{ color: '#1890ff' }} />
          </Tooltip>
          {/* <Tooltip title="Edit this vehicle">
            <Button onClick={() => handleEditVehicle(record)} icon={<EditOutlined />} />
          </Tooltip> */}
          <Tooltip title="Delete this vehicle">
            <Button onClick={() => handleDelete(record.VehicleID)} icon={<DeleteOutlined />} danger />
          </Tooltip>
          <Tooltip title="Add Policy">
        <Button 
               onClick={() => handleAddPolicyClick(record.VehicleID)} 
          icon={<FileAddOutlined />} 
          type="primary"
        >
         
        </Button>
      </Tooltip>

      {/* Modal for adding policy */}
{/*     
          <Tooltip title="Add Additional Policy">
            <Button 
              onClick={() => handleAddAdditionalPolicyClick(record.VehicleID, record.PlateNo)} 
              icon={<PlusOutlined />} 
              type="dashed"
            >
          
            </Button>
          </Tooltip> */}
    
          {/* Add Additional Policy Modal */}
        
        </Space>
      ),
    },
    
  ];

  return (
    <>
  <Modal
  title="Edit Excess"
  visible={isEModalVisible}
  onOk={handleOk}
  onCancel={handleCancel}
  footer={[
    <Button key="back" onClick={handleCancel}>
      Cancel
    </Button>,
    <Button key="submit" type="primary" onClick={handleOk}>
      Save
    </Button>,
  ]}
>
  {currentExcess && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={{ fontWeight: 'bold' }}>Title:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          value={currentExcess.Title}
          onChange={(e) => handleEditChange('Title', e.target.value)}
        />
      </div>
      <div>
        <label style={{ fontWeight: 'bold' }}>Amount:</label>
        <input
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          value={currentExcess.Amount}
          onChange={(e) => handleEditChange('Amount', e.target.value)}
        />
      </div>
    </div>
  )}
</Modal>

      <Title level={2} style={{ textAlign: 'center', marginBottom: 20, }}>Vehicles Overview</Title>
      <Row justify="space-between" style={{ marginBottom: 20 }}>
      <Col>
          <Input.Search
            placeholder="Search by Make, Model, or Plate Number"
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
            onClick={() => navigate('/dashboard/addvehicle')}
          >
            Add Vehicles
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="VehicleID"
        pagination={{ pageSize: 10}}
        bordered
        title={() => <Title level={4}>List of Registered Vehicles</Title>}
        style={{ backgroundColor: '#F5F5F5' }} // Table background color
    
      />

      {/* Edit Vehicle Modal */}
      <Modal
  title="Edit Vehicle"
  visible={isVehicleModalVisible}
  onOk={() => handleVehicleUpdate(editingItem)}
  onCancel={() => setIsVehicleModalVisible(false)}
>
  <Form 
    initialValues={editingItem} 
    onFinish={handleUpdate}
  >
    <Form.Item 
      name="MakeAndModel" 
      label="Make and Model"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="Year" 
      label="Year"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="BodyType" 
      label="Body Type"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="PlateNo" 
      label="Plate Number"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="SeatCapacity" 
      label="Seat Capacity"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="SumInsured" 
      label="Sum Insured"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="UseOfVehicle" 
      label="Use of Vehicle"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="CC_HP" 
      label="CC/HP"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="DutyFree" 
      label="Duty Free"
    >
      <Input />
    </Form.Item>

    <Form.Item 
      name="CarrierCapacity" 
      label="Carrier Capacity"
    >
      <Input />
    </Form.Item>

    {/* Uncomment if you want to include Bolo Date */}
    {/* <Form.Item name="BoloDate" label="Bolo Date">
      <DatePicker format="YYYY-MM-DD" placeholder="Bolo Date" />
    </Form.Item> */}

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Save Changes
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

        {/* <Button 
          type="secondary" 
          onClick={() => navigate(`/dashboard/addinsurance`, { state: { selectedVehicleId,objectTypes }})} 
          style={{ marginLeft: 16 }} 
          disabled={!!linkedPolicyNo} // Disable if a policy is linked
        >
          Create New Policy
        </Button> */}
      </Modal>

      {/* View Vehicle Modal */}
      <Modal
        title="Vehicle Details"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedVehicleId && (
          <Card>
            <p><strong>Make and Model:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.MakeAndModel}</p>
            <p><strong>Year:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.Year}</p>
            <p><strong>Body Type:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.BodyType}</p>
            <p><strong>Plate Number:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.PlateNo}</p>
            <p><strong>Excess:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.Excess}</p>
            <p><strong>Seat Capacity:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.SeatCapacity}</p>
            <p><strong>Sum Insured:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.SumInsured}</p>
            <p><strong>Use of Vehicle:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.UseOfVehicle}</p>
            <p><strong>CC/HP:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.CC_HP}</p>
            <p><strong>Duty Free:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.DutyFree}</p>
            <p><strong>Carrier Capacity:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.CarrierCapacity}</p>
            {/* <p><strong>Bolo Date:</strong> {data.find(vehicle => vehicle.VehicleID === selectedVehicleId)?.BoloDate ? new Date(data.find(vehicle => vehicle.VehicleID === selectedVehicleId).BoloDate).toLocaleDateString() : 'N/A'}</p> */}
          </Card>
        )}
      </Modal>
    </>
  );
};

export default VehiclesViewPage;

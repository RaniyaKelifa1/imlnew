import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Modal,  InputNumber, Space, DatePicker,  Form, Tooltip,Pagination  } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CarOutlined,DisconnectOutlined, CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, FolderViewOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';


const { Option } = Select;
const { Search } = Input;

const ViewInsurancePolicyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [clientTypeFilter, setClientTypeFilter] = useState('');
  const navigate = useNavigate();
  const [policyTypeFilter, setPolicyTypeFilter] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalPolicyVisible, setIsModalPolicyVisible] = useState(false);
  const [isModalPolicy, setIsModalPolicy] = useState(false);
  const [policyTypes, setPolicyTypes] = useState({});
  const [selectedArea, setSelectedArea] = useState('');
  const [form] = Form.useForm();
  const [selectedObject, setSelectedObject] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isObjectModalVisible, setIsObjectModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
const [isWorkmenCompensationModalVisible, setIsWorkmenCompensationModalVisible] = useState(false);
const [selectedWorkmenCompensation, setSelectedWorkmenCompensation] = useState([]);
const [personData, setPersonData] = useState({});
const [records, setRecords] = useState([]); // Your main data array

const fetchPersonNames = async () => {
  try {
    // Fetch all persons in a single request
    const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/persons`);
    // Create a map of PersonID to Name
    const personMap = data.reduce((acc, person) => {
      acc[person.PersonID] = person.Name; // Map PersonID to Name
 
      return acc;
    }, {});
    personMap
    setPersonData(personMap); // Store the map in state
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurance-companies`);
        setCompanies(response.data);
      } catch (error) {
        message.error('Failed to fetch companies');
      }
   

    fetchPersonNames();
    };
    fetchPolicies();
    fetchCompanies();
    fetchPolicyTypes();
  }, []);
  
  const styles = {
    container: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      backgroundColor: '#f9f9f9',
      maxWidth: '600px',
      margin: '20px auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333',
    },
    detailsContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    detail: {
      padding: '10px 0',
      borderBottom: '1px solid #e0e0e0',
    },
  };
const handlePolicyModalOk = () => {
  setIsModalPolicy(false); // Close the modal
};

const handlePolicyModalCancel = () => {
  setIsModalPolicy(false); // Close the modal
};

  const getPoliciesForRenewal = (policies) => {
    const now = moment();
    const notifications = [];
  
    policies.forEach(policy => {
      const renewalDate = moment(policy.RenewalDate);
      const daysLeft = renewalDate.diff(now, 'days');
  
      // Check if the policy is new or has a null status
      if (policy.PolicyStatus === null || policy.PolicyStatus === 'New') {
        // Add notifications for specific days left
        if (daysLeft === 45 || daysLeft === 30 || daysLeft === 15 || daysLeft === 7) {
          notifications.push({
            ...policy,
            daysLeft,
            notificationType: 'reminder'
          });
        }
        // Check if the policy has expired
        else if (daysLeft === 0) {
          notifications.push({
            ...policy,
            daysLeft,
            notificationType: 'expiration'
          });
        }
      }
    });
  
    return notifications;
  };
  
  const sendNotifications = (notifications) => {
    notifications.forEach(notification => {
      if (notification.notificationType === 'reminder') {
        console.log(`Reminder: Policy ${notification.PolicyNo} is due for renewal in ${notification.daysLeft} days.`);
        // Here you would send your reminder notification
      } else if (notification.notificationType === 'expiration') {
        console.log(`Expiration Notice: Policy ${notification.PolicyNo} has expired.`);
        // Here you would send your expiration notice
      }
    });
  };
  
  
  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/policies`);
      const fetchedPolicies = response.data;
  
      const clientIds = fetchedPolicies.map(policy => policy.ClientID);
      const uniqueClientIds = [...new Set(clientIds)];
  
      const clientsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/clients`);
      const clientsData = clientsResponse.data;
  
      const clientsMap = {};
      clientsData.forEach(client => {
        clientsMap[client.ClientID] = client;
      });
  
      const policiesWithInsuredNames = await Promise.all(
        fetchedPolicies.map(async (policy) => {
          const client = clientsMap[policy.ClientID];
  
          if (client) {
            const insuredName = await fetchInsuredName(client);
            return { ...policy, NameOfInsured: insuredName, ClientType: client.ClientType };
          }
          return policy;
        })
      );
  
      const formattedPolicies = policiesWithInsuredNames.map(policy => ({
        ...policy,
        PeriodStart: new Date(policy.PeriodStart).toISOString().split('T')[0],
        PeriodEnd: new Date(policy.PeriodEnd).toISOString().split('T')[0],
        RenewalDate: new Date(policy.RenewalDate).toISOString().split('T')[0],
        CreatedOn: new Date(policy.CreatedOn).toISOString().split('T')[0],
      }));
  
      // Sort the formatted policies by CreatedOn in descending order (newest first)
      const sortedPolicies = formattedPolicies.sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn));
  
      const policiesForRenewal = getPoliciesForRenewal(sortedPolicies);
      sendNotifications(policiesForRenewal);
      setPolicies(sortedPolicies);
      setFilteredPolicies(sortedPolicies);
    } catch (error) {
      message.error('Failed to fetch policies');
    }
  };
  


  const fetchPolicyTypes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurancepolicytypes`);
      const policyTypesData = response.data;

      const policyTypesMap = {};
      policyTypesData.forEach(type => {
        policyTypesMap[type.PolicyTypeID] = type.Ptype;
      });

      setPolicyTypes(policyTypesMap);
    } catch (error) {
      message.error('Failed to fetch policy types');
    }
  };

  const fetchInsuredName = async (client) => {
    const personsData = {};
    const organizationsData = {};

    try {
      const personsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/persons`);
      personsResponse.data.forEach(person => {
        personsData[person.PersonID] = person.Name;
      });

      const organizationsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/organizations`);
      organizationsResponse.data.forEach(org => {
        organizationsData[org.OrganizationID] = org.Name;
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      return 'Unknown';
    }

    return client.ClientType === 'Person'
      ? personsData[client.PersonID] || 'Unknown'
      : organizationsData[client.OrganizationID] || 'Unknown';
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = policies.filter((policy) =>
      (policy.PolicyNo && policy.PolicyNo.toLowerCase().includes(value.toLowerCase())) ||
      (policy.NameOfInsured && policy.NameOfInsured.toLowerCase().includes(value.toLowerCase())) ||
      (policy.ExternalPolicyNo && policy.ExternalPolicyNo.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredPolicies(filtered);
  };

  const handleFilterByClientType = (value) => {
    setClientTypeFilter(value);
    filterPolicies(value, policyTypeFilter);
  };

  const handleFilterByPolicyType = (value) => {
    setPolicyTypeFilter(value);
    filterPolicies(clientTypeFilter, value);
  };

  const filterPolicies = (clientType, policyType) => {
    const filtered = policies.filter((policy) => {
      const matchesClientType = clientType === '' || policy.ClientType === clientType;
      const matchesPolicyType = policyType === '' || policy.PolicyType === policyType;
      return matchesClientType && matchesPolicyType;
    });
    setFilteredPolicies(filtered);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const recordID = editingRecord.PolicyID; // Get the PolicyID from the editing record

      await axios.put(`${process.env.REACT_APP_API_URL}/policies/${recordID}`, values);
      message.success('Record updated successfully');
      setIsModalVisible(false);
      setEditingRecord(null);
      fetchPolicies(); // Fetch updated policies after edit
    } catch (error) {
      if (error.response?.status === 404) {
        message.success('Updating...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        message.error('Failed to update record: ' + error.message);
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setIsModalPolicy(true); // Set modal visibility to true
  };

  const handleModalClose = () => {
    setPolicyTypeFilter(false)
    setIsModalVisible(false);
    setSelectedPolicy(null);
  };

  // const handleViewObjectDetails = async (policy) => {
  //   try {
  //     const response = await axios.get(`https://bminsurancebrokers.com/imstest/insurableobjects`);
  //     const insurableObjects = response.data;

  //     const filteredObjects = insurableObjects.filter(obj => obj.PolicyID === policy.PolicyID);

  //     const objectDetails = [];
  //     for (const obj of filteredObjects) {
  //       const objectResponse = await axios.get(`https://bminsurancebrokers.com/imstest/${obj.ObjectType}/${obj.ObjectID}`);
  //       objectDetails.push({ ...obj, details: objectResponse.data });
  //     }

  //     setSelectedObject(objectDetails);
  //     setIsObjectModalVisible(true);
  //   } catch (error) {
  //     message.error('Failed to fetch object details');
  //   }
  // };

  const handleObjectModalClose = () => {
    setIsObjectModalVisible(false);
    setSelectedObject(null);
  };

  const handleDeletePolicy = async (policy) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/policies/${policy.PolicyID}`);
      message.success('Policy deleted successfully');
      fetchPolicies(); // Refresh the policies list after deletion
      console.log(`${process.env.REACT_APP_API_URL}/policies/${policy.PolicyID}`);
    } catch (error) {
      message.error('Failed to delete policy', policy.PolicyID);
    }
  };

  const handleViewObjectDetails = async (policy) => {
    try {
      // Fetch all insurable objects once
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurableobjects`);
      const insurableObjects = response.data;
  
      // Check if insurableObjects is an array
      if (!Array.isArray(insurableObjects)) {
      
        return; // Exit if not an array
      }
  
      // Log the ObjectType of each item
   
      // Filter the insurable objects that match the PolicyID
      const filteredObjects = insurableObjects.filter(obj => obj.PolicyID === policy.PolicyID);
      const objectDetails = []; // Initialize an array to hold the object details
    // Debug log for filtered objects
  console.log(policy.PolicyID)
      // Use a for loop to fetch details for each filtered object sequentially
      for (const obj of filteredObjects) {
        console.log(`ObjectType real: ${obj.ObjectType}, ObjectID: ${obj.ObjectID}`); // Debug log
  
        // Check for undefined ObjectType
        if (!obj.ObjectType) {
          console.error('ObjectType is undefined for this object:', obj);
          continue; // Skip this object if ObjectType is not defined
        }
  
        // Construct the URL correctly using backticks
        const objectResponse = await axios.get(`${process.env.REACT_APP_API_URL}/${obj.ObjectType}/${obj.ObjectID}`);
        
        // Merge the details with the original object
        objectDetails.push({ ...obj, details: objectResponse.data });
  

      }
  
      // Determine the type of object and set the appropriate state
      if (objectDetails.length > 0) {
        const firstObject = objectDetails[0]; // Handle based on the first object type
        if (firstObject.ObjectType === "Vehicles") {
          setSelectedObject(objectDetails);
          setIsVehicleModalVisible(true); // Show the vehicle modal
        } else if (firstObject.ObjectType === "WorkmenCompensation") {
          setSelectedWorkmenCompensation(objectDetails);
          setIsWorkmenCompensationModalVisible(true); // Show the Workmen's Compensation modal
        }
      }else if(objectDetails.length === 0){
        message.info('No object is connected to this policy'); 


      }
    } catch (error) {
      message.error(`Failed to fetch object details: ${error.message}`); // Log the error message
      console.error(error); // Additional logging for debugging
    }
  };
  
  
  

  const VehicleModal = ({ visible, onClose, objectDetails }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1; // Display one vehicle per page
  
    // Check if objectDetails is null or not an array
    if (!objectDetails || !Array.isArray(objectDetails)) {
      return null; // or handle the case differently (e.g., show a loading message)
    }
  
    // Calculate total pages based on the number of vehicle details
    const totalPages = Math.ceil(objectDetails.length / itemsPerPage);
  
    // Calculate which vehicle details to display on the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVehicles = objectDetails.slice(startIndex, startIndex + itemsPerPage);
  
    const handleDisconnect = async (VehicleID,PlateNo) => {
      try {
          // Find the insurable object ID associated with the given VehicleID
          const insurableObject = currentVehicles.find(vehicle => vehicle.details.VehicleID === VehicleID);
  
          if (!insurableObject) {
              console.error('Insurable object not found for VehicleID:', VehicleID);
              return;
          }
  
          const insurableObjectID = insurableObject.InsurableObjectID; // Adjust according to your data structure
  
          const response = await fetch(`${process.env.REACT_APP_API_URL}/insurableobjects/${insurableObjectID}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
  
          if (!response.ok) {
              throw new Error('Failed to disconnect the vehicle.');
          }
  
          const result = await response.json();
          message.success(`Vehicle with Plate Number ${PlateNo} has been disconnected successfully!`);
          window.location.reload(); // Refresh the page
  
          // Optionally, refresh or update your state here to reflect the changes in the UI
  
      } catch (error) {
          console.error('Error disconnecting vehicle:', error);
      }
  };
    return (

      <Modal
      title={`Vehicle Details (${objectDetails.length} vehicles associated)`}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {currentVehicles.length > 0 ? (
        currentVehicles.map((obj, index) => (
          <div key={index} style={{ marginBottom: '20px', border: '1px solid #f0f0f0', padding: '10px', borderRadius: '8px' }}>
            <h3>
              <CarOutlined style={{ marginRight: '8px' }} />
              {obj.details.MakeAndModel}
              <Button
                            icon={<DisconnectOutlined style={{ color: 'white' }} />}
                            onClick={() => handleDisconnect(obj.details.VehicleID,obj.details.PlateNo)} // Pass a function reference
                            type="primary" // Use 'primary' for a button-like appearance
                            danger // This adds a danger color scheme
                            style={{ marginLeft: '8px', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }} // Set button color
                        />


            </h3>
            <p>
  <CarOutlined style={{ marginRight: '8px' }} />
  Plate No: {obj.details.PlateNo || 'N/A'}
</p>
        
            <p>Year: {obj.details.Year || 'N/A'}</p>
<p>Engine No: {obj.details.EngineNo || 'N/A'}</p>
<p>Body Type: {obj.details.BodyType || 'N/A'}</p>
<p>Use of Vehicle: {obj.details.UseOfVehicle || 'N/A'}</p>
<p>Seat Capacity: {obj.details.SeatCapacity} kg</p>
<p>Excess: {obj.details.Excess || 'N/A'}</p>
<p>Sum Insured: {obj.details.SumInsured} ETB</p>
<p>CC/HP: {obj.details.CC_HP || 'N/A'}</p>
<p>Carrier Capacity: {obj.details.CarrierCapacity || 'N/A'}</p>
<p>Year: {obj.details.Year || 'N/A'}</p>
<p>Bolo Date: {obj.details.BoloDate || 'N/A'}</p>

          </div>
        ))
      ) : (
        <p>No vehicle details available.</p>
      )}
      
      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={objectDetails.length}
          pageSize={itemsPerPage}
          onChange={(page) => setCurrentPage(page)}
          style={{ marginTop: '20px', textAlign: 'center' }}
        />
      )}
    </Modal>
  
  );
  };

  const WorkmenCompensationModal = ({ visible, onClose, objectDetails }) => {
    return (
      <Modal title="Workmen's Compensation Details" visible={visible} onCancel={onClose} footer={null}>
        {objectDetails && objectDetails.length > 0 ? (
          objectDetails.map((obj, index) => (
            <div key={index}>
              <h3>Compensation ID: {obj.details.CompensationID}</h3>
              <p>Salary: {obj.details.Salary}</p>
              {/* Add more Workmen's Compensation details as needed */}
            </div>
          ))
        ) : (
          <p>No Workmen's Compensation details available.</p>
        )}
      </Modal>
    );
  };
  
    
  const showDeleteConfirmation = (policy) => {
    setSelectedPolicy(policy);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setSelectedPolicy(null);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);

    // Set other form values
    form.setFieldsValue(record);

    // Handle PeriodStart, PeriodEnd, and RenewalDate separately as they need moment objects for DatePicker
    if (record && record.PeriodStart) {
        const periodStart = moment(record.PeriodStart, 'YYYY-MM-DD');
        if (periodStart.isValid()) {
            form.setFieldsValue({ PeriodStart: periodStart });
        } else {
            console.error('Invalid PeriodStart:', record.PeriodStart);
        }
    }

    if (record && record.PeriodEnd) {
        const periodEnd = moment(record.PeriodEnd, 'YYYY-MM-DD');
        if (periodEnd.isValid()) {
            form.setFieldsValue({ PeriodEnd: periodEnd });
        } else {
            console.error('Invalid PeriodEnd:', record.PeriodEnd);
        }
    }

    if (record && record.RenewalDate) {
        const renewalDate = moment(record.RenewalDate, 'YYYY-MM-DD');
        if (renewalDate.isValid()) {
            form.setFieldsValue({ RenewalDate: renewalDate });
        } else {
            console.error('Invalid RenewalDate:', record.RenewalDate);
        }
    }

    // Open the modal for editing
    setIsModalVisible(true);
};

// Function to handle form submission
const handleSubmit = async (values) => {
  const updatedRecord = {
    ...editingRecord, // Keep existing data
    ...values, // Include updated form values
    PeriodStart: values.PeriodStart ? values.PeriodStart.format('YYYY-MM-DD') : null, // Check for existence
    PeriodEnd: values.PeriodEnd ? values.PeriodEnd.format('YYYY-MM-DD') : null, // Check for existence
    RenewalDate: values.RenewalDate ? values.RenewalDate.format('YYYY-MM-DD') : null, // Check for existence
};

    
console.log(updatedRecord)
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/policies/${updatedRecord.PolicyID}`, updatedRecord);
        console.log('Policy updated successfully:', response.data);
        // Optionally, refresh your data or close the modal here
        setIsModalVisible(false);
        // refreshData(); // Uncomment if you have a function to refresh data
    } catch (error) {
        console.error('Error updating policy:', error);
    }
};
  const handleChange = (fieldName, value) => {
    form.setFieldsValue({ [fieldName]: value });
  };
  const handleAdd = async (values) => {
    navigate('/dashboard/AddInsurance');
  };

  const confirmDelete = () => {
    handleDeletePolicy(selectedPolicy);
    handleDeleteModalClose();
  };
  const handleAreaChange = (value) => {
    setSelectedArea(value);
    if (value !== 'Others') {
      setOtherArea('');
    }
  };
  const updatedFilteredPolicies = filteredPolicies.map(policy => ({
    ...policy,
    PolicyType: policyTypes[policy.PolicyType] || 'Unknown',
  }));

  const columns = [
    { title: 'Policy No', dataIndex: 'PolicyNo', key: 'PolicyNo' },
    { title: 'Policy Type', dataIndex: 'PolicyType', key: 'PolicyType' },
    { title: 'Name of Insured', dataIndex: 'NameOfInsured', key: 'NameOfInsured' },
    {
      title: 'Sales Person',
      render: (text, record) => personData[record.PersonID] || 'Direct',
    },
    { title: 'Premium', dataIndex: 'Premium', key: 'Premium' },
    { title: 'Period Start', dataIndex: 'PeriodStart', key: 'PeriodStart' },
    { title: 'Period End', dataIndex: 'PeriodEnd', key: 'PeriodEnd' },
    // { title: 'Renewal Date', dataIndex: 'RenewalDate', key: 'RenewalDate' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Details">
            <Button      onClick={() => handleViewObjectDetails(record)}  icon={<FolderViewOutlined />} />
          </Tooltip>
          {/* <Tooltip title="Edit">
            <Button onClick={() => handleEdit(record)} icon={<EditOutlined />} />
          </Tooltip> */}
          <Tooltip title="Delete">
            <Button onClick={() => showDeleteConfirmation(record)} icon={<DeleteOutlined />} />
          </Tooltip>
           <Tooltip title="View Policy">
          <Button 
            onClick={() => handleViewDetails(record)} 
            icon={<EyeOutlined />} 
            type="primary"
          >
            View Policy
          </Button>
        </Tooltip> 
        </Space>
      ),
    },
  ];

  return (
    <div>
       <div>
    {/* Your existing components */}
    
    <VehicleModal 
      visible={isVehicleModalVisible} 
      onClose={() => setIsVehicleModalVisible(false)} 
      objectDetails={selectedObject} 
    />

    <WorkmenCompensationModal 
      visible={isWorkmenCompensationModalVisible} 
      onClose={() => setIsWorkmenCompensationModalVisible(false)} 
      objectDetails={selectedWorkmenCompensation} 
    />
  </div>
      <h1>View Insurance Policies</h1>
    
      <Search placeholder="Search" onSearch={handleSearch} style={{ width: 300, marginBottom: 16 ,marginRight: 8}} />
      <Select placeholder="Filter by Client Type" onChange={handleFilterByClientType} style={{ width: 200, marginRight: 8 }}>
        <Option value="">All</Option>
        <Option value="Person">Person</Option>
        <Option value="Organization">Organization</Option>
      </Select>
      <Select placeholder="Filter by Policy Type" onChange={handleFilterByPolicyType} style={{ width: 200, marginRight: 8 }}>
        <Option value="">All</Option>
        {Object.keys(policyTypes).map((key) => (
          <Option key={key} value={key}>{policyTypes[key]}</Option>
        ))}
      </Select>
      <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd()}
          >
            Add Policy
          </Button>
      <Table dataSource={updatedFilteredPolicies} columns={columns} rowKey="PolicyID" />
   {/* View Policy Modal */}
  
  
   <Modal
      title="Policy Details"
      visible={isModalPolicy} // Modal visibility controlled by state
      onOk={handlePolicyModalOk}
      onCancel={handlePolicyModalCancel}
    >
      {selectedPolicy && (

<div style={styles.container}>
  <h2 style={styles.header}>Policy Details</h2>
  <div style={styles.detailsContainer}>
    <div style={styles.detail}>
      <strong>Policy No:</strong> {selectedPolicy.PolicyNo || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Policy Type:</strong> {selectedPolicy.PolicyType || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Premium:</strong> ${selectedPolicy.Premium ? parseFloat(selectedPolicy.Premium).toLocaleString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Period Start:</strong> {selectedPolicy.PeriodStart ? new Date(selectedPolicy.PeriodStart).toLocaleDateString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Period End:</strong> {selectedPolicy.PeriodEnd ? new Date(selectedPolicy.PeriodEnd).toLocaleDateString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Renewal Date:</strong> {selectedPolicy.RenewalDate ? new Date(selectedPolicy.RenewalDate).toLocaleDateString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Policy Status:</strong> {selectedPolicy.PolicyStatus || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Created By:</strong> {selectedPolicy.CreatedBy || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Branch:</strong> {selectedPolicy.Branch || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>External Policy No:</strong> {selectedPolicy.ExternalPolicyNo || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Geographical Area:</strong> {selectedPolicy.GeographicalArea || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Commission:</strong> ${selectedPolicy.Commission ? parseFloat(selectedPolicy.Commission).toLocaleString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Branch Contact Name:</strong> {selectedPolicy.BranchName || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Branch Contact Telephone:</strong> {selectedPolicy.BranchTelephone || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Branch Contact Email:</strong> {selectedPolicy.BranchEmail || 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>Created At:</strong> {selectedPolicy.CreatedAt ? new Date(selectedPolicy.CreatedAt).toLocaleDateString() : 'N/A'}
    </div>
    <div style={styles.detail}>
      <strong>PVT (Political Violence and Terrorism):</strong> {selectedPolicy.PVT === '1' ? 'Yes' : 'No'}
    </div>
    <div style={styles.detail}>
      <strong>Third Party Extension:</strong> {selectedPolicy.ThirdPartyExtension === '1' ? 'Yes' : 'No'}
    </div>
    <div style={styles.detail}>
      <strong>Policy Liability Limit:</strong> {selectedPolicy.PolicyLiabilityLimit !== null ? selectedPolicy.PolicyLiabilityLimit : 'N/A'}
    </div>
  </div>
</div>

     
     
     
     )}
    </Modal>


      {/* Edit Modal */}

      <Modal
  title="Edit Insurance Policy"
  visible={isModalVisible}
  onCancel={handleModalCancel}
  footer={null}
>
  <Form
    form={form}
    name="edit-insurance"
    onSubmit={handleSubmit(form.getFieldsValue())}
    layout="vertical"
    style={{ width: '100%', maxWidth: '600px' }}
    initialValues={{
      ExternalPolicyNo: selectedPolicy?.ExternalPolicyNo,
      PolicyType: selectedPolicy?.PolicyType,
      Premium: selectedPolicy?.Premium,
      Commission: selectedPolicy?.Commission,
      PeriodStart: selectedPolicy?.PeriodStart ? moment(selectedPolicy.PeriodStart) : null,
      PeriodEnd: selectedPolicy?.PeriodEnd ? moment(selectedPolicy.PeriodEnd) : null,
      RenewalDate: selectedPolicy?.RenewalDate ? moment(selectedPolicy.RenewalDate) : null,
      Branch: selectedPolicy?.Branch,
      GeographicalArea: selectedPolicy?.GeographicalArea,
      BranchName: selectedPolicy?.BranchName,
      BranchTelephone: selectedPolicy?.BranchTelephone,
      BranchEmail: selectedPolicy?.BranchEmail,
      CreatedBy: selectedPolicy?.CreatedBy,
      IsDeleted: selectedPolicy?.IsDeleted ? 1 : 0,
      SalesPerson: selectedPolicy?.PersonID
    }}
  >
    <Form.Item name="ExternalPolicyNo" label="External Policy Number" rules={[{ required: true, message: 'Please enter the external policy number' }]}>
      <Input placeholder="Enter External Policy Number" />
    </Form.Item>

    <Form.Item name="CompanyID" label="Insurance Company" rules={[{ required: true, message: 'Please select an insurance company' }]}>
      <Select placeholder="Select Insurance Company">
        {companies.map((company) => (
          <Select.Option key={company.CompanyID} value={company.CompanyID}>
            {company.CompanyName}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>


    <Form.Item label="Policy Period" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Form.Item name="PeriodStart" style={{ flex: '1', marginRight: '8px' }} rules={[{ required: true, message: 'Please select the period start date' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="Start Date" />
        </Form.Item>
        <Form.Item name="PeriodEnd" style={{ flex: '1' }} rules={[{ required: true, message: 'Please select the period end date' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="End Date" />
        </Form.Item>
      </div>
    </Form.Item>

    <Form.Item name="GeographicalArea" label="Geographical Area">
      <Select placeholder="Select Geographical Area" onChange={handleAreaChange} style={{ width: '100%' }}>
        <Option value="Ethiopia">Ethiopia</Option>
        <Option value="Ethiopia & Djibuti">Ethiopia & Djibouti</Option>
        <Option value="Ethiopia & Kenya">Ethiopia & Kenya</Option>
        <Option value="Others">Others</Option>
      </Select>
    </Form.Item>

    {selectedArea === 'Others' && (
      <Form.Item name="OtherGeographicalArea" label="Specify Geographical Area" rules={[{ required: true, message: 'Please specify the geographical area' }]}>
        <Input placeholder="Enter Geographical Area" />
      </Form.Item>
    )}

    <Form.Item name="Premium" label="Premium" rules={[{ required: true, message: 'Please enter the premium' }]}>
      <InputNumber min={0} style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item name="Commission" label="Commission" rules={[{ required: true, message: 'Please enter the commission' }]}>
      <Input min={0} max={100} style={{ width: '100%' }} />
    </Form.Item>

    <Form.Item name="Branch" label="Branch" rules={[{ required: true, message: 'Please enter the branch' }]}>
      <Input placeholder="Enter Branch" />
    </Form.Item>

    <Form.Item label="Branch Details" style={{ marginBottom: 0 }}>
      <Form.Item name="BranchName" style={{ display: 'inline-block', width: 'calc(33% - 8px)' }} rules={[{ required: true, message: 'Please enter the branch name' }]}>
        <Input placeholder="Branch Contact Name" />
      </Form.Item>
      <Form.Item name="BranchTelephone" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }} rules={[{ required: true, message: 'Please enter the branch telephone' }]}>
        <Input placeholder="Branch Contact Telephone" />
      </Form.Item>
      <Form.Item name="BranchEmail" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }} rules={[{ required: true, message: 'Please enter the branch email' }]}>
        <Input placeholder="Branch Contact Email" />
      </Form.Item>
    </Form.Item>

    <Form.Item>
      <button type="submit" style={{ marginRight: '8px' }}>Save</button>
      <button type="button" onClick={handleModalCancel}>Cancel</button>
    </Form.Item>
  </Form>
</Modal>



      <Modal
        title="Insurable Objects"
        visible={isObjectModalVisible}
        onCancel={handleObjectModalClose}
        footer={null}
      >
        {selectedObject && selectedObject.map(obj => (
          <div key={obj.ObjectID}>
            <p><strong>Object ID:</strong> {obj.ObjectID}</p>
            <p><strong>Object Type:</strong> {obj.ObjectType}</p>
            {/* Display more details about the object here */}
          </div>
        ))}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={handleDeleteModalClose}
      >
        <p>Are you sure you want to delete this policy?</p>
      </Modal>
    </div>
  );
};

export default ViewInsurancePolicyPage;

import React, { useState, useEffect } from 'react';
import { Table, Form, Input, DatePicker, Space, Select, Tooltip, Typography, Row,Divider, Col, Modal, Upload,  Button, message, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, PlusOutlined, AppstoreAddOutlined,UploadOutlined, DollarOutlined ,EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';

const firebaseConfig = {
  apiKey: "AIzaSyAfGmqOViFESamu15ixWGXgc7oYGt2DyfQ",
  authDomain: "bm-ims-phase-i.firebaseapp.com",
  projectId: "bm-ims-phase-i",
  storageBucket: "bm-ims-phase-i.appspot.com",
  messagingSenderId: "536222985169",
  appId: "1:536222985169:web:10596dd214068c1d5b0ef0",
  measurementId: "G-SJ47G7SJ52"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const uploadFileToFirebase = async (file) => {
  const storageRef = ref(storage, 'uploads/' + file.name);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};


const { Title } = Typography;
const { Option } = Select;

const ViewClaimsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // State to control the visibility of the detail modal
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [policiesWithInsuredNames, setPoliciesWithInsuredNames] = useState([]);
  const [clientType, setClientType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [policies, setPolicies] = useState([]);
  const [policy, setPolicy] = useState([]);
  const [company, setCompany] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [claimNumber, setClaimNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [showMotorFields, setShowMotorFields] = useState(false);
  const [objects, setObjects] = useState([]);
  const [form] = Form.useForm();
  const [steps, setSteps] = useState([]); // Initialize steps as an empty array
  const [customStepName, setCustomStepName] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
 


  const onStepNameChange = (value) => {
    setCustomStepName(value); // Update state based on the value passed
    // Additional logic can be added here if necessary
  };
  
  // Update handleSelectChange to use the defined function
  const handleSelectChange = (value) => {
    if (value === 'Others') {
      setIsOtherSelected(true);
      onStepNameChange(customStepName); // Set to custom value initially
    } else {
      setIsOtherSelected(false);
      setCustomStepName(''); // Reset custom input
      onStepNameChange(value); // Update parent with selected value
    }
  };
  
  // Function to generate a new claim number
  const generatePolicyNumber = () => {
    const randomFiveDigitNumber = Math.floor(10000 + Math.random() * 90000);
    return `BM-CLM-${randomFiveDigitNumber}`;
  };

 
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/policies`);
        const data = await response.json();
        setPolicies(data);
        return data; // Return the fetched policies
      } catch (error) {
        console.error('Error fetching policies:', error);
        message.error('Failed to fetch policies.');
        return []; // Return an empty array in case of error
      }
    };


    const fetchClientNames = async (policies) => {
      const clientData = {};
    
      await Promise.all(
        policies.map(async (record) => {
          try {
            // Fetch policy details
            const policyResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/policies/${record.PolicyID}`
            );
    
            const clientID = policyResponse.data.ClientID;
    
            // Fetch client details by ClientID
            const clientResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/clients/${clientID}`
            );
    
            const clientType = clientResponse.data.ClientType;
            let clientName = '';
    
            // Determine the client name based on the client type
            if (clientType === 'Person' && clientResponse.data.PersonID) {
              // Fetch person data
              const personResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/persons/${clientResponse.data.PersonID}`
              );
              clientName = `${personResponse.data.FirstName} ${personResponse.data.LastName}`;
            } else if (clientType === 'Organization') {
              const organizationID = clientResponse.data.OrganizationID;
              console.log(`Fetching organization with ID: ${organizationID}`); // Log the ID
              if (organizationID) {
                // Fetch organization data if OrganizationID is present
                const orgResponse = await axios.get(
                  `${process.env.REACT_APP_API_URL}/organizations/${organizationID}`
                );
                clientName = orgResponse.data.Name;
              } else {
                clientName = 'No Organization ID'; // Handle case where OrganizationID is missing
              }
            }
    
            clientData[record.PolicyID] = clientName;
          } catch (error) {
            console.error(`Error fetching data for PolicyID ${record.PolicyID}:`, error);
            clientData[record.PolicyID] = 'Error fetching name'; // Handle error gracefully
          }
        })
      );
    
      setClientNames(clientData);
    };
    
    

    const fetchCompanies = async (policies) => {
      const companyData = {};
      await Promise.all(
        policies.map(async (record) => {
          const policyResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/policies/${record.PolicyID}`
          );
          const companyID = policyResponse.data.CompanyID;

          // Fetch company details by CompanyID
          const companyResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/insurance-companies/${companyID}`
          );

          // Map PolicyID to CompanyName
          companyData[record.PolicyID] = companyResponse.data.CompanyName;
        })
        
      );
      setCompanies(companyData);
    };
    const fetchVehicles = async (policies) => {
  console.log(policies)
      const companyData = {};
  
      // Using Promise.all to fetch data for all policies
      await Promise.all(
          policies.map(async (record) => {
              try {
                  // Fetch claim details
                  const policyResponse = await axios.get(
                      `${process.env.REACT_APP_API_URL}/claims/${record.ClaimID}`
                  );
                  console.log(`Fetching claims from: ${process.env.REACT_APP_API_URL}/claims/${record.ClaimID}`);
                  
                  const companyID = policyResponse.data.VehicleID;
                  console.log(`VehicleID for PolicyID ${record.PolicyID}:`, companyID);
  
                  // Fetch vehicle details by VehicleID
                  const companyResponse = await axios.get(
                      `${process.env.REACT_APP_API_URL}/vehicles/${companyID}`
                  );
                  console.log(`Fetching vehicles from: ${process.env.REACT_APP_API_URL}/vehicles/${companyID}`);
  
                  // Map PolicyID to PlateNo
                  companyData[record.PolicyID] = companyResponse.data.PlateNo;
                  
              } catch (error) {
                  console.error(`Error fetching data for PolicyID ${record.PolicyID}:`, error);
                  // Optionally handle the error for this specific record
              }
          })
      );
  
      // Update state with the gathered company data
      setObjects(companyData);
  
  };
  

    const fetchPolicy = async (policies) => {
      const policyData = {};
      const companyData = {};
      await Promise.all(
        policies.map(async (record) => {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/policies/${record.PolicyID}`
          );
          policyData[record.PolicyID] = response.data.PolicyNo;
          companyData[record.PolicyID] = response.data.CompanyID;
        })
      );
      
      setPolicy(policyData);
      setCompany(companyData);
      fetchCompanies(policies); // Ensure the fetchCompanies is called with policies
    };

    const fetchInsuredData = async (policies) => {
      const clientsMap = {}; // Populate this map with client data as needed

      const policiesWithNames = await Promise.all(
        policies.map(async (policy) => {
          const client = clientsMap[policy.ClientID];
          if (client) {
            const insuredName = await fetchInsuredName(client);
            return { ...policy, NameOfInsured: insuredName, ClientType: client.ClientType };
          }
          return policy;
        })
      );

      setPoliciesWithInsuredNames(policiesWithNames);
    };


    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/claims`);
        
        if (!response.data || response.data.length === 0) {
          setData(null); // or setData('none'); depending on your requirements
          setFilteredData(null); // or setFilteredData('none');
          return 'Claims found'; // Return 'Claims found' if there are no claims
        }
    
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        message.info('No calims avaliable');
        return 'none'; // Optionally return 'none' on error as well
      }
    };
    
    

    const initializeData = async () => {
      try {
        const policies = await fetchPolicies(); // Fetch policies and store in policies state
        if (policies.length > 0) {
          // Call other fetch functions with the policies fetched
          await Promise.all([
            fetchClientNames(policies),
            fetchInsuredData(policies),
            fetchVehicles(filteredData),
            fetchCompanies(policies),
            fetchData(),
            fetchPolicy(policies),
          ]);
        }
        // Set the claim number after all data is fetched
        setClaimNumber(generatePolicyNumber());
      } catch (error) {
        console.error('Error initializing data:', error);
        message.error('Failed to initialize data.'); // Notify user of error
      }
    };

    initializeData(); // Call the initialize function
  }, []); // Empty dependency array means this effect runs once on mount


  const [fileList, setFileList] = useState([]);




  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const handleFormSubmit = async (values) => {
    try {
      // Fetch claim steps to verify if "Police Report" exists
      const response = await fetch(`${process.env.REACT_APP_API_URL}/claim-steps/claim/${editingItem?.ClaimID}`);
      const claimSteps = await response.json();
  
      // Check if "Police Report" exists in claim steps
      const hasPoliceReport = claimSteps.some(step => step.StepName === 'Police Report');
  
      if (!hasPoliceReport && values.StepName !== 'Police Report') {
        message.warning('The first step must be "Police Report". Please add it before adding other steps.');
        return;
      }
  
      // Proceed with adding details if the check passes
      await handleDetailAdd({ ...values, fileList });
  
      // Reset form fields and file list after successful submission
      form.resetFields();
      setFileList([]);
  
      // Send final success message
      message.success('Claim details added successfully!');
    } catch (error) {
      console.error('Error fetching claim steps:', error);
      message.error('Failed to validate steps. Please try again.');
    }
  };
  
  

  const handleDelete = async (claimId) => {
    try {
      // Step 1: Delete records from claim steps table
      await axios.delete(`${process.env.REACT_APP_API_URL}/claim-steps/claim/${claimId}`);
  
      // Step 2: Delete records from payment table
      await axios.delete(`${process.env.REACT_APP_API_URL}/payments/claim/${claimId}`);
  
      // Step 3: Delete the claim itself
      await axios.delete(`${process.env.REACT_APP_API_URL}/claims/${claimId}`);
  
      message.success('Claim and associated records deleted successfully');
      window.location.reload(); // Refresh the page
      fetchData(); // Refresh data after deletion
    } catch (error) {
      message.error('Failed to delete claim and associated records');
    }
  };
  

  const handleEdit = (item) => {
    const claimData = {
        ...item,
        ClaimDate: moment(item.ClaimDate), // Ensure it's a moment object
    };
    setEditingItem(claimData);
    setIsModalVisible(true);
};
  const handleUpdate = async (values) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/claims/${editingItem.ClaimID}`, values);
      message.success('Claim updated successfully');
      setIsModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to update claim');
    }
  };

  const handleAdd = async (values) => {
    navigate('/dashboard/addclaim');
  };


  const handleDetailAdd = async (values) => {
    console.log("Initial values:", values); // Log initial values
    
    // Check if a file is uploaded
    if (fileList.length === 0) {
        message.warning('Please upload a document');
        return;
    }

    setUploading(true); // Start the uploading process
    try {
        const file = fileList[0].originFileObj; // Get the first uploaded file
        const fileUrl = await uploadFileToFirebase(file); // Upload the file to Firebase

        // Attach the document URL to form values
        values.Document = fileUrl.toString();
        console.log("Uploaded file URL:", fileUrl.toString());

        // Ensure ClaimID is correctly assigned from `editingItem`
        if (!editingItem?.ClaimID) {
            console.error("ClaimID is undefined or null:", editingItem);
            message.error("Failed to add claim details: ClaimID is missing");
            return; // Exit the function if ClaimID is missing
        }

        // Assign ClaimID and custom step name to the values object
        values.ClaimID = editingItem.ClaimID;
        values.StepName = customStepName; // Ensure `customStepName` is defined in your context

        // Convert StepDate to the required format (e.g., 'YYYY-MM-DD')
        if (values.StepDate) {
            values.StepDate = new Date(values.StepDate).toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
        }

        // Logging for debugging
        console.log("Values to be sent:", values);

        // Make the API call to add claim details
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/claim-steps`, values);
        
        // Log the response from the server
        console.log("Response from server:", response.data);
        
        // Success message and actions
        message.success("Claim details added successfully!");
        form.resetFields(); // Clear form fields
        setIsDetailModalVisible(false); // Close modal
        fetchData(); // Refresh data after adding claim details

    } catch (error) {
        console.error("Error in handleDetailAdd:", error.response ? error.response.data : error); // Log the error
        message.error("Failed to add claim details. Please try again.");
    } finally {
        setUploading(false); // End the uploading process
        setFileList([]); // Clear the file list
    }
};



const handleViewClaimProcess = async (claimId) => {
  try {
    // Fetch claim details from the server
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/claims/${claimId}`);
    
    // You can perform any logic with the response if needed
    console.log('Claim details fetched:', response.data);

    // Navigate to the claim detail page with the claim ID and claim number
    navigate('/dashboard/viewclaimdet', {
      state: {
        claimID: claimId, // Use the claimId parameter directly
        claimNo: response.data.ClaimNumber, // Assuming ClaimNumber is in the response
      },
    });
  } catch (error) {
    console.error('Error fetching claim details:', error);
  }
};


const handleAddPayment = async (values) => {

  try {
      // Validate required fields (already enforced by form rules, but you can keep this for custom handling)
      if (!values.PaymentAmount || !values.PaymentDate) {
          message.warning('Payment Amount and Payment Date are required.');
          return;
      }

      // Create a payment object
      const paymentData = {
          ClaimID: editingItem.ClaimID, // Use the currently editing claim's ID
          PaymentAmount: values.PaymentAmount,   // Using values.Amount for payment amount
          PaymentType:values.PaymentType,             // You can set this to the appropriate value if available
          PaymentStatus: values.PaymentStatus,  
          PaymentDate:  values.PaymentDate.format('YYYY-MM-DD'),
  
      };
      // Send POST request to add payment
       await axios.post(`${process.env.REACT_APP_API_URL}/payments`, paymentData);
 
    
      message.success("Payment added successfully!");
      form.resetFields(); // Clear form fields
      setIsPaymentModalVisible(false); // Close payment modal
      fetchData(); // Refresh data after adding payment
  } catch (error) {
      console.error("Error in handleAddPayment:", error.response ? error.response.data : error); // Log the error
      message.error("Failed to add payment. Please try again.");
  } finally {
      setUploading(false); // End the uploading process if it was set to true
  }
};


  const handleClientTypeChange = (value) => {
    setClientType(value);
   
  };
  const handleSearch = async (value) => {

    setSearchText(value);
    const filtered = data.filter((item) =>
      item.ClaimNumber.toLowerCase().includes(value.toLowerCase()) ||
      item.PolicyID.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };


  const columns = [
    {
      title: 'Claim Number',
      dataIndex: 'ClaimNumber',
      key: 'ClaimNumber',
    },
    {
      title: 'Policy Number',
      // dataIndex: 'PolicyID',
      key: 'PolicyID',
      render: (text, record) => (
      policy[record.PolicyID] || 'Loading...'
 
      )
    },
    {
      title: 'Name of Insured',
      key: 'NameOfInsured',
      render: (text, record) => (
         clientNames[record.PolicyID] || 'Loading...'
        )
    },
    {
      title: 'Insurance Company',
      key: 'CompanyID',
      render: (text, record) => (
        companies[record.PolicyID] || 'Loading...'
        )
    },
    {
      title: 'Vehicle Plate No',
      key: 'VehicleID',
      render: (text, record) => (
        objects[record.PolicyID] || 'Loading...'
        )
    },
    {
      title: 'Claim Date',
      dataIndex: 'ClaimDate',
      key: 'ClaimDate',
    },
    {
      title: 'Claim Status',
      dataIndex: 'ClaimStatus',
      key: 'ClaimStatus',
    },
   
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Space size="middle">
          <Tooltip title="Edit Claim">
            <Button onClick={() => handleEdit(record)} icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Delete Claim">
            <Button onClick={() => handleDelete(record.ClaimID)} icon={<DeleteOutlined />} danger />
          </Tooltip>
          <Tooltip title="Edit Claim Details">
            <Button onClick={() => { setEditingItem(record); setIsDetailModalVisible(true); }} icon={<AppstoreAddOutlined />} />
          </Tooltip>
          <Tooltip title="Confirm Payment">
    <Button onClick={() => { setEditingItem(record); setIsPaymentModalVisible(true); }} icon={<DollarOutlined />} />
</Tooltip>
          <Tooltip title="View Claim Process">
            <Button onClick={() => handleViewClaimProcess(record.ClaimID)}
 icon={<EyeOutlined />} />
          </Tooltip>
          {/* <Tooltip title="View Policy">
          <Button 
            onClick={() => handleViewDetails(record)} 
            icon={<EyeOutlined />} 
            type="primary"
          >
            View claim
          </Button>
        </Tooltip>  */}
        </Space>
      ),
    },
  ];






  
  return (
    <>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 20 }}>Claims Overview</Title>

      <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Col>
          <Input.Search
            placeholder="Search by Claim or Policy Number"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAdd()}
          >
            Add Claim
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="ClaimID"
        pagination={{ pageSize: 10 }}
        bordered
        title={() => <Title level={4}>List of Claims</Title>}
        style={{ backgroundColor: '#F5F5F5' }}
      />

      {/* Edit Claim Modal */}


      <Modal
      visible={isModalVisible}
      title="Edit Claim"
      onCancel={() => setIsModalVisible(false)}
      footer={null}
    >



      <Form
        layout="vertical"
        form={form}
        onFinish={(values) => {
          onEditFinish({ ...values, ClaimID: item.ClaimID });
          onClose();
        }}
      >
        <Divider>Claim Details</Divider>

        <Form.Item name="ClaimNumber" label="Claim Number">
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="PolicyID"
          label="Policy"
          rules={[{ required: true, message: 'Please select a policy' }]}
        >
          <Select placeholder="Select Policy">
            {/* Add policy options dynamically */}
            {policies.map((policy) => (
              <Option key={policy.PolicyID} value={policy.PolicyID}>
                {policy.PolicyNo}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="ClaimDate"
          label="Claim Report Date"
          rules={[{ required: true, message: 'Please select the claim date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="ClaimStatus" label="Claim Status">
          <Select>
            <Option value="Ongoing">Ongoing</Option>
            <Option value="Settled">Settled</Option>
          </Select>
        </Form.Item>

        {/* Additional fields, similar to the original form */}
        {/* Driver Details and Third Party Details conditional rendering */}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
   
   
   
   
    </Modal>


      <Modal
      title="Add Claim Details"
      visible={isDetailModalVisible}
      onCancel={() => setIsDetailModalVisible(false)}
      footer={null}
    >
      <Form form={form} onFinish={handleFormSubmit}>
        <Form.Item name="ClaimID" label="Claim ID" hidden>
          <Input defaultValue={editingItem?.ClaimID} disabled />
        </Form.Item>

        <Form.Item
            name="StepName"
            label="Step Name"
            rules={[{ required: true, message: 'Please input step name' }]}
        >
            <Select placeholder='Select Step Name' onChange={handleSelectChange}>
                <Option value="Police Report">Police Report</Option>
                <Option value="Others">Others</Option>
            </Select>
            {isOtherSelected && (
                <Input
                    placeholder='Please specify'
                    value={customStepName}
                    onChange={(e) => {
                      setCustomStepName(e.target.value);
                      onStepNameChange(e.target.value); // Update parent with custom value
                  }}
                    style={{ marginTop: 8 }} // Optional styling
                />
            )}
        </Form.Item>

        <Form.Item name="StepDate" label="Step Date" rules={[{ required: true, message: 'Please input step date' }]}>
          <DatePicker style={{ width: '100%' }} placeholder='Step Date'/>
        </Form.Item>

        <Form.Item name="StepStatus" label="Step Status" rules={[{ required: true, message: 'Please select step status' }]}>
  <Select placeholder="Select Step Status">
    <Option value="Secured">Secured</Option>
    <Option value="Not Secured">Not Secured</Option>
  </Select>
</Form.Item>


        <Form.Item name="StepDetail" label="Step Detail" rules={[{ required: true, message: 'Please input step detail' }]}>
          <Input.TextArea placeholder='Step Detail' />
        </Form.Item>

        <Form.Item name="Document" label="Upload Document" rules={[{ required: false, message: 'Please upload a document for this step' }]}>
          <Upload
  fileList={fileList}
  onChange={handleUploadChange}
  beforeUpload={() => false}
  accept=".pdf,.doc,.docx"
          >
            <Button icon={<UploadOutlined />}>Upload Document</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} > {uploading ? 'Uploading...' : 'Submit'} </Button>
        </Form.Item>
      </Form>
    </Modal>

      {/* Payment Modal */}

      <Modal
    title="Confirm Payment"
    visible={isPaymentModalVisible}
    onCancel={() => setIsPaymentModalVisible(false)}
    footer={null}
>
    <Form form={form} onFinish={handleAddPayment}>
        {/* Hidden field for Claim ID */}
        <Form.Item name="ClaimID" label="Claim ID" hidden>
            <Input defaultValue={editingItem?.ClaimID} disabled />
        </Form.Item>

        {/* Payment Status Selection */}
        <Form.Item
            name="PaymentStatus"
            label="Payment Status"
            rules={[{ required: true, message: 'Please select a Payment Status' }]}
        >
            <Select placeholder="Select Payment Status">
                <Option value="Accepted">Accepted</Option>
                <Option value="Rejected">Rejected</Option>
            </Select>
        </Form.Item>

        {/* Payment Amount Input */}
        <Form.Item
            name="PaymentAmount" // Ensure this matches the key used in paymentData
            label="Payment Amount"
            rules={[{ required: true, message: 'Please input payment amount' }]}
        >
            <InputNumber />
        </Form.Item>

        {/* Payment Type Input */}
        <Form.Item
            name="PaymentType"
            label="Payment Type"
            rules={[{ required: true, message: 'Please input payment type' }]}
        >
            <Input />
        </Form.Item>

        {/* Payment Date Picker */}
        <Form.Item
            name="PaymentDate"
            label="Date"
            rules={[{ required: true, message: 'Please select date' }]}
        >
            <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
            <Button type="primary" htmlType="submit">Confirm Payment</Button>
        </Form.Item>
    </Form>
</Modal>
    </>
  );
};

export default ViewClaimsPage;


const fetchInsuredName = async (client) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/clients/${client.ClientID}`
    );
    return response.data.name; // Adjust based on the actual data structure returned
  } catch (error) {
    console.error("Error fetching insured name:", error);
    return null; // Handle error case
  }
};
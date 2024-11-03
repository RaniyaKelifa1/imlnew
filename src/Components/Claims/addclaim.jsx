import {Form, Input, Button, DatePicker, Select, notification,message, Divider, Checkbox, Table } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const AddClaimForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  
  const [vehicles, setVehicles] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [policyTypes, setPolicyTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showMotorFields, setShowMotorFields] = useState(false);
  const [thirdPartyInvolved, setThirdPartyInvolved] = useState(false);

  // Fetch data from multiple endpoints on load
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurance-companies`);
        setCompanies(response.data);
      } catch (error) {
        message.error('Failed to fetch companies');
      }
    };
    const fetchData = async () => {
      try {
        // Fetch policies
        const policyResponse = await axios.get(`${process.env.REACT_APP_API_URL}/policies`);
        setPolicies(policyResponse.data);

        // Fetch insurance companies
        const companyResponse = await axios.get(`${process.env.REACT_APP_API_URL}/insurance-companies`);
        setInsuranceCompanies(companyResponse.data);

        // Fetch policy types
        const typeResponse = await axios.get(`${process.env.REACT_APP_API_URL}/insurancepolicytypes`);
        setPolicyTypes(typeResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        notification.error({ message: 'Failed to fetch initial data' });
      }
    };
fetchCompanies();
    fetchData();
  }, []);

  // Handle policy selection
  const onPolicySelect = async (policyID) => {
    // Find the selected policy from the policies array
    const policy = policies.find((p) => p.PolicyID === policyID);
    setSelectedPolicy(policy);
    
    // Show motor fields based on the policy type (assuming '1f2g3h4i5j' is the type for motor insurance)
    setShowMotorFields(policy?.PolicyType === '1f2g3h4i5j');
  
    try {
      // Step 1: Fetch insurable objects
      const insurableResponse = await axios.get(`${process.env.REACT_APP_API_URL}/insurableobjects`);
      
      // Step 2: Find the insurable objects related to the selected policy
      const relatedInsurableObjects = insurableResponse.data.filter(
        obj => obj.PolicyID === policyID // Assuming there's a PolicyID field in insurable objects
      );
 
      // Get the ObjectIDs from related insurable objects to fetch the vehicles
      const objectIDs = relatedInsurableObjects.map(obj => obj.ObjectID);
console.log(objectIDs)
      // Step 3: Fetch all vehicles
      const vehicleResponse = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`);
  console.log(vehicleResponse)
      // Step 4: Filter vehicles based on the ObjectIDs from insurable objects
      const filteredVehicles = vehicleResponse.data.filter(vehicle =>
        objectIDs.includes(vehicle.VehicleID) // Assuming vehicle has an InsurableObjectID
      );
  console.log(filteredVehicles)
      // Update the vehicles state with the filtered vehicle data
      setVehicles(filteredVehicles.map(vehicle => ({
        VehicleID: vehicle.VehicleID, 
        PlateNo: vehicle.PlateNo, // Ensure PlateNo is included
        // Add other fields if necessary
      })));
    } catch (error) {
      console.error('Error fetching vehicles or insurable objects:', error);
      notification.error({ message: 'Failed to fetch associated vehicles' });
    }
  };
  

  const onFinish = async (values) => {
    // Validate Report Date
    if (selectedPolicy && values.ReportDate && values.ReportDate.isAfter(selectedPolicy.PeriodEnd)) {
      return notification.error({
        message: 'Date Error',
        description: 'Report date must be before the policy end date.',
      });
    }

    const claimData = {
      PolicyID: values.PolicyID,
      ClaimNumber: values.ClaimNumber,
      ClaimDate: values.ClaimDate.format('YYYY-MM-DD'),
      ReportDate: values.ReportDate?.format('YYYY-MM-DD'),
      AccReportDate: values.AccReportDate?.format('YYYY-MM-DD'),
      DriverName: values.DriverName,
      DriversLicense: values.DriversLicense,
      DriversLicenseRenewalDate: values.DriversLicenseRenewalDate?.format('YYYY-MM-DD'),
      VehicleID: values.VehicleID,
      ThirdPartyInvolved: values.ThirdPartyInvolved,
      TPDetails: thirdPartyInvolved ? {
        TPPlateNumber: values.TPPlateNumber,
        TPAddress: values.TPAddress,
        TPInsurer: values.TPInsurer,
        TPClaimAmount: values.TPClaimAmount,
      } : null,
      PoliceReport: values.PoliceReport,
      ClaimStatus: values.ClaimStatus,
    };

    try {
      // POST request to submit claim data
      await axios.post(`${process.env.REACT_APP_API_URL}/Claims`, claimData);
      notification.success({ message: 'Claim added successfully!' });
      form.resetFields();
      setSelectedPolicy(null);
      setVehicles([]); // Clear vehicles when a new claim is submitted
      setShowMotorFields(false);
      setThirdPartyInvolved(false);
      navigate('/dashboard/viewClaims');
    } catch (error) {
      console.error('Error adding claim:', error);
      notification.error({ message: 'Failed to add claim' });
    }
    navigate('/dashboard/viewClaims');
  };
  const companyColumns = [
    {
      title: 'Company Name',
      dataIndex: 'CompanyName',
      key: 'name',
    },
    {
      title: 'Contact Number',
      dataIndex: 'PhoneNumber',
      key: 'contactNumber',
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'email',
    },
  ];

   const branchColumns = [
    {
      title: 'Branch Name',
      dataIndex: 'BranchName',
      key: 'branchName',
    },
    {
      title: 'Branch Telephone',
      dataIndex: 'BranchTelephone',
      key: 'branchTelephone',
    },
    {
      title: 'Branch Email',
      dataIndex: 'BranchEmail',
      key: 'branchEmail',
    },
  ]

  return (


    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ ClaimStatus: 'Ongoing', ClaimNumber: `BM-CLM-${Math.floor(10000 + Math.random() * 90000)}` }}
      form={form}
      style={{ width: '100%', maxWidth: '600px' }}
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
        <Select
          placeholder="Select Policy"
          onChange={onPolicySelect}
        >
          {policies.map((policy) => (
            <Option key={policy.PolicyID} value={policy.PolicyID}>
              {policy.PolicyNo}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="ExternalNumber" label="External Policy Number">
           <Input placeholder="External Policy Number" />
      </Form.Item>
      {selectedPolicy && (
        <>
          <Divider>Insurance Company Details</Divider>
          <Table
            dataSource={insuranceCompanies.filter(company => company.CompanyID === selectedPolicy.CompanyID)} // Filter to show only the selected company's info
            columns={companyColumns}
            pagination={false}
            rowKey="ID" // Assuming there's an ID field in your company data
            style={{ marginBottom: '20px' }}
          />
          
          <Divider>Branch Details</Divider>
          <Table
            dataSource={[{
              BranchName: selectedPolicy.BranchName,
              BranchTelephone: selectedPolicy.BranchTelephone,
              BranchEmail: selectedPolicy.BranchEmail,
            }]} // Displaying the selected policy's branch details
            columns={branchColumns}
            pagination={false}
            rowKey="BranchName" // Using BranchName as a unique key
          />
        </>
      )}

      <Form.Item
        name="ClaimDate"
        label="Claim Report Date"
        rules={[{ required: true, message: 'Please select the claim date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="AccReportDate"
        label="Accident Report Date"
        rules={[{ required: true, message: 'Please select the Accident date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      {showMotorFields && (
        <>
        <Form.Item
  name="VehicleID"
  label="Associated Vehicle"
  rules={[{ required: true, message: 'Please select a vehicle' }]}
>
  <Select placeholder="Select Vehicle">
    {vehicles.map((vehicle) => (
      <Select.Option key={vehicle.VehicleID} value={vehicle.VehicleID}>
        {vehicle.PlateNo}
      </Select.Option>
    ))}
  </Select>
</Form.Item>


          <Form.Item label="Driver Details" style={{ marginBottom: 0 }}>
        <Form.Item     name="DriverName" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}        rules={[{ required: true, message: 'Please enter the driver\'s name' }]}>
          <Input placeholder="Driver's Name" />
        </Form.Item>
        <Form.Item  name="DriversLicense" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}  rules={[{ required: true, message: 'Please enter the driver\'s license' }]}>
          <Input placeholder="Driver's license" />
        </Form.Item>
        <Form.Item         name="DriversLicenseRenewalDate" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}       rules={[{ required: true, message: 'Please enter the renewal date' }]}>
       
          <DatePicker format="YYYY-MM-DD" placeholder="Driver's License Renewal Date"/>
        </Form.Item>
      </Form.Item>

          <Form.Item
            name="ThirdPartyInvolved"
            valuePropName="checked"
          >
            <Checkbox onChange={(e) => setThirdPartyInvolved(e.target.checked)}>
              Third Party Involved?
            </Checkbox>
          </Form.Item>

          {thirdPartyInvolved && (
            <>
              <Form.Item
                name="TPPlateNumber"
                label="TP Plate Number"
                rules={[{ required: true, message: 'Please enter the TP plate number' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="TPAddress"
                label="TP Address"
                rules={[{ required: true, message: 'Please enter the TP address' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
  name="TPInsurer"
  label="TP Insurer"
  rules={[{ required: true, message: 'Please select or enter the TP insurer' }]}
>


    <Select placeholder="Select Company">
      {companies.map((company) => (
        <Select.Option key={company.CompanyID} value={company.CompanyID}>
          {company.CompanyName}
        </Select.Option>
      ))}
    </Select>
 
</Form.Item>


              <Form.Item
                name="TPClaimAmount"
                label="TP Claim Amount"
                rules={[{ required: true, message: 'Please enter the TP claim amount' }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          )}

          {/* <Form.Item
            name="PoliceReport"
            label="Police Report"
            rules={[{ required: true, message: 'Please provide the police report details' }]}
          >
            <Input.TextArea />
          </Form.Item> */}
        </>

      )}

<Form.Item
  name="ClaimStatus"
  label="Claim Status"
  initialValue="Ongoing" // You can set the initial value as "Ongoing" or "Settled" as needed
>
  <Select>
    <Option value="Ongoing">Ongoing</Option>
    <Option value="Settled">Settled</Option>
  </Select>
</Form.Item>


      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
          Submit Claim
        </Button>
      </Form.Item>
    </Form>



);
};

export default AddClaimForm;

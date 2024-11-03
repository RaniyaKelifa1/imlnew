import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Typography, Button, DatePicker, Layout, Select, message ,Checkbox } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const AddInsurancePolicy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedVehicleId, objectTypes, selectedCompensationId, objectType } = location.state || {};
  const [form] = Form.useForm();
  
  const [clients, setClients] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policyTypes, setPolicyTypes] = useState([]);
  
  const [selectedClientID, setSelectedClientID] = useState(null);
  const [clientType, setClientType] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [otherArea, setOtherArea] = useState('');
  
  const [premium, setPremium] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [commission, setCommission] = useState(0);
  const [salesPersons, setSalesPersons] = useState([]);
  const [isSalesPersonSelected, setIsSalesPersonSelected] = useState(false);
  const [checkboxValues, setCheckboxValues] = useState({
    PVT: false,
    ThirdPartyExtension: false,
  });

  const fetchSalesPersons = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/persons`);
      const filteredSalesPersons = response.data.filter(person => person.PersonTypeID === 2);
      setSalesPersons(filteredSalesPersons);
    } catch (error) {
      console.error('Error fetching sales persons:', error);
    }
  };

  const generatePolicyNumber = () => {
    const randomFiveDigitNumber = Math.floor(10000 + Math.random() * 90000);
    return `BM-${randomFiveDigitNumber}`;
  };

  const calculateCommission = (premium, rate) => {
    const calculatedCommission = (premium * rate) / 100;
    setCommission(calculatedCommission);
  };

  const fetchClients = async (type) => {
    const endpoint = type === 'person'
      ? `${process.env.REACT_APP_API_URL}/persons`
      : `${process.env.REACT_APP_API_URL}/organizations`;
    try {
      const response = await axios.get(endpoint);
      setClients(response.data);
    } catch (error) {
      message.error(`Failed to fetch ${type} clients`);
    }
  };

  const handleClientSelect = async (value) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/clients`);
      const data = response.data;
  
      const matchedClient = data.find(client => 
        (clientType === 'organization' && client.OrganizationID === value) ||
        (clientType === 'person' && client.PersonID === value && client.PersonTypeID === 1)
      );
  
      if (matchedClient) {
        setSelectedClientID(matchedClient.ClientID);
      } else {
        console.error('No matching client found');
      }
    } catch (error) {
      console.error('Error fetching ClientID:', error);
    }
  };
  

  const handlePremiumChange = (value) => {
    setPremium(value);
    calculateCommission(value, commissionRate);
  };

  const handleCommissionRateChange = (value) => {
    const rate = value ? parseFloat(value) : 0;
    setCommissionRate(rate);
    calculateCommission(premium, rate);
  };

  const handleAreaChange = (value) => {
    setSelectedArea(value);
    if (value !== 'Others') {
      setOtherArea('');
    }
  };

  const handleClientTypeChange = (value) => {
    setClientType(value);
    setClients([]);
    setSelectedClientID(null);
    if (value) fetchClients(value);
  };

  const handleSubmit = async (values) => {
    console.log(values.PVT)
    const data = {
      PolicyNo: values.PolicyNo,
      ExternalPolicyNo: values.ExternalPolicyNo,
      PolicyType: values.PolicyType,
      Premium: parseFloat(values.Premium),
      GeographicalArea: values.GeographicalArea,
      PeriodStart: values.PeriodStart.format('YYYY-MM-DD'),
      PeriodEnd: values.PeriodEnd.format('YYYY-MM-DD'),
      RenewalDate: values.PeriodEnd.format('YYYY-MM-DD'),
      PolicyStatus: 'New',
      CreatedBy: values.CreatedBy,
      CreatedOn: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), // 
      ClientID: selectedClientID,
      CompanyID: values.CompanyID,
      Branch: values.Branch,
      VehicleID: selectedVehicleId || selectedCompensationId,
      objectTypes: objectType || objectTypes || "Undefined",
      Commission: commission,
      BranchName: values.BranchName,
      BranchTelephone: values.BranchTelephone,
      BranchEmail: values.BranchEmail,
      CreatedAt: moment().format('YYYY-MM-DD HH:mm:ss.SSS'), 
      PersonID: values.SalesPerson || null,
      PVT: checkboxValues.PVT ? '1' : '0',
      ThirdPartyExtension: checkboxValues.ThirdPartyExtension ? '1' : '0',
      PolicyLiabilityLimit: values.PolicyLiabilityLimit ? parseFloat(values.PolicyLiabilityLimit) : null // Parse to float or set to null
    };    
    console.log(data)
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/policy`, data);
      message.success('Insurance Policy added successfully!');
      navigate('/dashboard/viewInsurance');
      form.resetFields();
      form.setFieldsValue({ PolicyNo: generatePolicyNumber() });
      setSelectedClientID(null);
    } catch (error) {
      console.error('Error adding insurance policy:', error);
      message.error('Failed to add insurance policy');
    }
  };
  const handleCheckboxChange = (e) => {
    setCheckboxValues({
      ...checkboxValues,
      [e.target.name]: e.target.checked,
    });
  };

  useEffect(() => {
    fetchSalesPersons();
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurance-companies`);
        setCompanies(response.data);
      } catch (error) {
        message.error('Failed to fetch companies');
      }
    };

    const fetchPolicyTypes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/insurancepolicytypes`);
        setPolicyTypes(response.data);
      } catch (error) {
        message.error('Failed to fetch policy types');
      }
    };
    fetchPolicyTypes();
    fetchCompanies();
    form.setFieldsValue({ PolicyNo: generatePolicyNumber() });
  }, [form]);

  const handleCreatedByChange = (value) => {
    setIsSalesPersonSelected(value === "Sales Person");
    if (value !== "Sales Person") {
      form.setFieldsValue({ SalesPerson: undefined });
    }
  };

  const filteredPolicyTypes = objectTypes === 'Vehicles'
    ? policyTypes.filter(type => type.Ptype === 'Motor Insurance' || type.Ptype === 'Carriers Liability')
    : policyTypes;

  return (

    <Layout style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
      <Content>
      <Title level={2} style={{ color: '#001529', textAlign: 'left' }}>

  Add Policy
</Title>

    <Form
      form={form}
      name="add-insurance"
      onFinish={handleSubmit}
      layout="vertical"
      style={{ width: '100%', maxWidth: '600px' }}
    >
      <Form.Item
        name="PolicyNo"
        label="Customer Code"
        rules={[{ required: true, message: 'Policy Number is auto-generated.' }]}
      >
        <Input placeholder={generatePolicyNumber()} disabled />
      </Form.Item>

      <Form.Item
        name="ExternalPolicyNo"
        label="External Policy Number"
        rules={[{ required: true, message: 'Please enter the external policy number' }]}
      >
        <Input placeholder="Enter External Policy Number" />
      </Form.Item>

  <Form.Item
  name="PolicyType"
  label="Policy Type"
  rules={[{ required: true, message: 'Please select the policy type' }]}
>
  <Select placeholder="Select Policy Type" style={{ width: '100%' }}>
    {filteredPolicyTypes.map((policyType) => (
      <Select.Option key={policyType.PolicyTypeID} value={policyType.PolicyTypeID}>
        {policyType.Ptype}
      </Select.Option>
    ))}
  </Select>
</Form.Item>

<Form.Item
  name="CompanyID"
  label="Insurance Companies"
  rules={[{ required: true, message: 'Please select an insurance company' }]}
>
  <Select placeholder="Select Insurance Company" style={{ width: '100%' }}>
    {companies.map((company) => (
      <Select.Option key={company.CompanyID} value={company.CompanyID}>
        {company.CompanyName}
      </Select.Option>
    ))}
  </Select>
</Form.Item>



      <Form.Item
        name="ClientType"
        label="Client Type"
        rules={[{ required: true, message: 'Please select a client type' }]}
      >
        <Select placeholder="Select Client Type" onChange={handleClientTypeChange}>
          <Option value="person">Person</Option>
          <Option value="organization">Organization</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="ClientID"
        label="Client"
        rules={[{ required: true, message: 'Please select a client' }]}
      >
        <Select placeholder="Select Client" onChange={handleClientSelect} disabled={!clientType}>
          {clients.map((client, index) => {
            const clientKey = client[clientType === 'organization' ? 'OrganizationID' : 'PersonID'] || `client-${index}`;
            const clientValue = client[clientType === 'organization' ? 'OrganizationID' : 'PersonID'];
            
            return (
              <Option key={clientKey} value={clientValue}>
                {client.Name}
              </Option>
            );
          })}
        </Select>
      </Form.Item>

      <Form.Item label="Policy Period" style={{ marginBottom: 0 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <Form.Item
      name="PeriodStart"
      style={{ flex: '1', marginRight: '8px' }}
      rules={[{ required: true, message: 'Please select the period start date' }]}
    >
      <DatePicker format="YYYY-MM-DD" placeholder="Start Date" />
    </Form.Item>
    <Form.Item
      name="PeriodEnd"
      style={{ flex: '1' }}
      rules={[{ required: true, message: 'Please select the period end date' }]}
    >
      <DatePicker format="YYYY-MM-DD" placeholder="End Date" />
    </Form.Item>
  </div>


        {/* <Form.Item name="RenewalDate" style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }} rules={[{ required: true, message: 'Please select the renewal date' }]}>
          <DatePicker format="YYYY-MM-DD" placeholder="Renewal Date" />
        </Form.Item> */}
      </Form.Item>
  
      <Form.Item
        name="GeographicalArea"
        label="Geographical Area"
        rules={[{ required: false, message: 'Please select a geographical area' }]}
      >
        <Select placeholder="Select Geographical Area" value={selectedArea} onChange={handleAreaChange} style={{ width: '100%' }}>
          <Option value="Ethiopia">Ethiopia</Option>
          <Option value="Ethiopia & Djibuti">Ethiopia & Djibouti</Option>
          <Option value="Ethiopia & Kenya">Ethiopia & Kenya</Option>
          <Option value="Others">Others</Option>
        </Select>
      </Form.Item>

      {selectedArea === 'Others' && (
        <Form.Item
          name="OtherGeographicalArea"
          label="Please specify"
          rules={[{ required: true, message: 'Please specify the geographical area' }]}
        >
          <Input
            placeholder="Enter geographical area"
            value={otherArea}
            onChange={(e) => setOtherArea(e.target.value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}

      <Form.Item
        name="Premium"
        label="Premium"
        rules={[{ required: true, message: 'Please enter the premium' }]}
      >
        <InputNumber
          placeholder="Enter Premium Amount"
          onChange={handlePremiumChange}
          min={0}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="CommissionRate"
        label="Commission Rate (%)"
        rules={[{ required: true, message: 'Please enter the commission rate' }]}
      >
        <InputNumber
          placeholder="Enter Commission Rate"
          onChange={handleCommissionRateChange}
          min={0}
          max={100}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item label="Commission">
        <InputNumber
          value={commission}
          disabled
          style={{ width: '100%' }}
        />
      </Form.Item>

      {/* <Form.Item
        name="PolicyStatus"
        label="Policy Status"
        rules={[{ required: true, message: 'Please select the policy status' }]}
      >
        <Select placeholder="Select Policy Status">
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </Form.Item> */}
       <Form.Item
        name="Branch"
        label="Branch"
        rules={[{ required: true, message: 'Please enter the Branch' }]}
      >
        <Input placeholder="Please enter the Branch" />
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
      
      <Form.Item
          name="PolicyLiabilityLimit"
          label="Policy Liability Limit"
          rules={[{ required: false, message: 'Please enter the Policy Liability Limit' }]}
        >
          <InputNumber
            placeholder="Enter Policy Liability Limit"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Additional Coverage Options">
        <Form.Item name="PVT" valuePropName="checked">
            <Checkbox name="PVT" onChange={handleCheckboxChange}>PVT</Checkbox>
          </Form.Item>

          <Form.Item name="ThirdPartyExtension" valuePropName="checked">
            <Checkbox name="ThirdPartyExtension" onChange={handleCheckboxChange}>Third Party Extension</Checkbox>
          </Form.Item>
</Form.Item>


      <Form.Item name="CreatedBy" label="Created By" rules={[{ required: true }]}>
                <Select placeholder="Select Created By" onChange={handleCreatedByChange}>
                    <Option value="Direct">Direct</Option>
                    <Option value="Sales Person">Sales Person</Option>
                </Select>
            </Form.Item>

            {/* Conditionally render the sales person dropdown */}
            {isSalesPersonSelected && (
                <Form.Item name="SalesPerson" label="Select Sales Person" rules={[{ required: true }]}>
                    <Select placeholder="Select Sales Person">
                        {salesPersons.map(person => (
                            <Option key={person.PersonID} value={person.PersonID}>
                                {person.Name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            )}

      {/* <Form.Item
        name="IsDeleted"
        valuePropName="checked"
        label="Is Deleted"
      >
        <Checkbox>Mark as Deleted</Checkbox>
      </Form.Item> */}

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
    
    </Content>
    </Layout>
  


);
};

export default AddInsurancePolicy;

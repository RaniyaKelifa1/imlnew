import React, { useState, useEffect } from 'react';
import { createRoutesFromChildren, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Select, DatePicker, message, Tabs, Row,Col } from 'antd';
import {CarOutlined, PlusOutlined, FileAddOutlined, EditOutlined, DeleteOutlined, LinkOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;
const { TabPane } = Tabs;

const AddInsurancePolicy = () => {
  const location = useLocation();
  const { PlateNo, PolicyID, VehicleID } = location.state || {};
  const [form] = Form.useForm();
  const [motorInsuranceDetails, setMotorInsuranceDetails] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [premium, setPremium] = useState(0);
  const [commissionRate, setCommissionRate] = useState(0);
  const [commission, setCommission] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [policyTypes, setPolicyTypes] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [existingPolicies, setExistingPolicies] = useState([]);
  const [policyTypeIDs, setPolicyTypeIDs]= useState([]);
  const [PolicyPeriodLiabilityLimit, setPolicyPeriodLiabilityLimit] = useState([]);
  const [EventLiabilityLimit, setEventLiabilityLimit] = useState([]);
  const [AddexisitngPolicy, setAddexisitngPolicy] = useState([]);
  const [remark,setRemark]=useState([]);
  const [policyNo, setPolicyNo] = useState('');
  const [thirdPartyExtension, setThirdPartyExtension] = useState([]);
  const [pvtPolicies, setPvtPolicies] = useState([]);
  const [carriersLiability, setCarriersLiability] = useState([]);

  // Fetch necessary data
  useEffect(() => {
    const generatePolicyNumber = () => {
      const randomFiveDigitNumber = Math.floor(10000 + Math.random() * 90000);
      setPolicyNo(`BM-${randomFiveDigitNumber}`);
      return `BM-${randomFiveDigitNumber}`;
    };
    const fetchExistingPolicies = async () => {
      try {
        // Fetch policies and policy types
        const [policiesResponse, policyTypesResponse] = await Promise.all([
          axios.get('https://bminsurancebrokers.com/imstest/policies'),
          axios.get('https://bminsurancebrokers.com/imstest/insurancepolicytypes')
        ]);
    
        // Define policy types to filter
        const pvtType = "PVT (Political Violence and Terrorism)";
        // const pvtType = "Motor Insurance";
        const carriersLiabilityType = "Carriers Liability";
        const thirdPartyExtensionType = "Third Party Extension";
    
        // Get PolicyTypeIDs for each type
        const filteredPolicyTypeIDs = policyTypesResponse.data
          .filter(type => type.Ptype === pvtType)
          .map(type => type.PolicyTypeID);
        
        const filteredPolicyTypeIDC = policyTypesResponse.data
          .filter(type => type.Ptype === carriersLiabilityType)
          .map(type => type.PolicyTypeID);
        
        const filteredPolicyTypeIDT = policyTypesResponse.data
          .filter(type => type.Ptype === thirdPartyExtensionType)
          .map(type => type.PolicyTypeID);
    
        // Filter policies based on each PolicyTypeID
        const filteredPoliciesPVT = policiesResponse.data.filter(policy => 
          filteredPolicyTypeIDs.includes(policy.PolicyType)
        );
    
        const filteredPoliciesCarriersLiability = policiesResponse.data.filter(policy => 
          filteredPolicyTypeIDC.includes(policy.PolicyType)
        );
    
        const filteredPoliciesThirdPartyExtension = policiesResponse.data.filter(policy => 
          filteredPolicyTypeIDT.includes(policy.PolicyType)
        );
    
        // Map to get PolicyID and PolicyNo for each set of policies
        const existingPoliciesPVT = filteredPoliciesPVT.map(policy => ({
          PolicyID: policy.PolicyID,
          PolicyNo: policy.PolicyNo
        }));
    
        const existingPoliciesCarriersLiability = filteredPoliciesCarriersLiability.map(policy => ({
          PolicyID: policy.PolicyID,
          PolicyNo: policy.PolicyNo
        }));
    
        const existingPoliciesThirdPartyExtension = filteredPoliciesThirdPartyExtension.map(policy => ({
          PolicyID: policy.PolicyID,
          PolicyNo: policy.PolicyNo
        }));
    
        // Set the existing policies (if needed)
        setExistingPolicies({
          PVT: existingPoliciesPVT,
          CarriersLiability: existingPoliciesCarriersLiability,
          ThirdPartyExtension: existingPoliciesThirdPartyExtension
        });
  
        
    
      } catch (error) {
        message.error('Failed to fetch Motor policies');
        console.error('Error fetching policies:', error);
      }
    };
    
    const fetchData = async () => {
      try {
        const [policyResponse, companiesResponse, policyTypesResponse] = await Promise.all([
          axios.get(`https://bminsurancebrokers.com/imstest/policies/${PolicyID}`),
          axios.get('https://bminsurancebrokers.com/imstest/insurance-companies'),
          axios.get('https://bminsurancebrokers.com/imstest/insurancepolicytypes')
        ]);

        const filteredPolicies = policyTypesResponse.data.filter(type =>
          ['Third Party Extension', 'PVT (Political Violence and Terrorism)', 'Carriers Liability'].includes(type.Ptype)
        );

        setPolicyTypes(filteredPolicies);
        setMotorInsuranceDetails(policyResponse.data);
        setCompanies(companiesResponse.data);
      

        if (policyResponse.data.CompanyID) {
          const companyResponse = await axios.get(`https://bminsurancebrokers.com/imstest/insurance-companies/${policyResponse.data.CompanyID}`);
          setCompanyName(companyResponse.data.CompanyName);
        }
      } catch (error) {
        message.error('Failed to fetch data');
      }
    };
     // Utility function to generate a random policy number
 
  

    if (PolicyID) {
      fetchData();
    }
    fetchExistingPolicies();
    generatePolicyNumber();
  }, [PolicyID]);

  // Update commission based on premium and commission rate
  const updateCommission = (premium, commissionRate) => {
    setCommission((premium * commissionRate) / 100);
  };



  const handlePolicyChange = (selectedValues) => {
    if (selectedValues.length > 1) {
      // Display warning and reset to the first selection only
      message.warning('You can only select one policy type at a time.');
      setSelectedPolicies([selectedValues[0]]); // Keep only the first selected value
    } else {
      setSelectedPolicies(selectedValues);
    }
  };


   const handleAddToExistingPolicy = async () => {
   

    try {
      const insurableObjectData = {
        PolicyID: AddexisitngPolicy,
        ObjectID: VehicleID,
        ObjectType: 'Vehicles',
      };
   
     await axios.post('https://bminsurancebrokers.com/imstest/insurableobjects', insurableObjectData);
      message.success('Vehicle added to existing policy successfully');
     
    } catch (error) {

      message.error('Failed to add vehicle to policy');
    }
  };
  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const data = {
        PolicyNo: policyNo,
        ExternalPolicyNo: motorInsuranceDetails?.ExternalPolicyNo || values[`${selectedPolicies[0]}-ExternalPolicyNo`],
        PolicyType: selectedPolicies.join(', '),
        Premium: parseFloat(values.Premium || premium),
        GeographicalArea: motorInsuranceDetails?.GeographicalArea,
        PeriodStart: moment(values.PeriodStart).isValid() ? moment(values.PeriodStart).format('YYYY-MM-DD') : null,
        PeriodEnd: moment(values.PeriodEnd).isValid() ? moment(values.PeriodEnd).format('YYYY-MM-DD') : null,
        RenewalDate: moment(values.RenewalDate || moment().add(1, 'year')).isValid() ? moment(values.RenewalDate).format('YYYY-MM-DD') : null,
        PolicyStatus: motorInsuranceDetails?.PolicyStatus,
        CreatedBy: motorInsuranceDetails?.CreatedBy,
        CreatedOn: moment().format('YYYY-MM-DD'),
        IsDeleted: motorInsuranceDetails?.IsDeleted ? 1 : 0,
        ClientID: motorInsuranceDetails?.ClientID,
        CompanyID: motorInsuranceDetails?.CompanyID,
        Branch: motorInsuranceDetails?.Branch,
        VehicleID:VehicleID,
        Commission: motorInsuranceDetails?.Commission,
        BranchName: values.BranchName,
        BranchTelephone: values.BranchTelephone,
        BranchEmail: values.BranchEmail,
      };
      

      await axios.post('https://bminsurancebrokers.com/imstest/policies', data);
      message.success('Insurance Policy added successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add insurance policy');
    }
  };
  

 



  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: 'auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ PolicyNo: policyNo }}
      >


<Form.Item
      name="PolicyType"
      label="Policy Type"
      rules={[{ required: true, message: 'Please select the policy type' }]}
    >
      <Select
        mode="multiple"
        placeholder="Select Policy Types"
        onChange={handlePolicyChange}
        value={selectedPolicies} // Bind the selected values
      >
        {policyTypes.map((type) => (
          <Option key={type.PolicyTypeID} value={type.PolicyTypeID}>
            {type.Ptype}
          </Option>
        ))}
      </Select>
    </Form.Item>

        <Tabs
          defaultActiveKey={selectedPolicies.length > 0 ? selectedPolicies[0] : '1'}
          style={{ marginTop: '20px' }}
        >
          {selectedPolicies.map(policy => {
            const policyType = policyTypes.find(option => option.PolicyTypeID === policy)?.Ptype || 'Unknown Policy';
            
            return (
              <TabPane tab={policyType} key={policy}>
                {policyType === 'PVT (Political Violence and Terrorism)' && motorInsuranceDetails && (
                  <>
                    
                    {renderPVTForm()}
                  </>
                )}
                    {policyType === 'Third Party Extension' && motorInsuranceDetails && (
                  <>
               
                    {renderThirdForm()}
                  </>
                )}
                   {policyType === 'Carriers Liability' && motorInsuranceDetails && (
                  <>
                
                    {renderCarrierForm()}
                  </>
                )}
              </TabPane>
              
            );
          })}
        </Tabs>


        <Form.Item style={{ marginTop: '20px' }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Add Insurance Policy
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  function renderPVTForm() {
    return (
      
      <Form
      
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          PeriodStart: motorInsuranceDetails?.PeriodStart ? moment(motorInsuranceDetails.PeriodStart) : null,
          PeriodEnd: motorInsuranceDetails?.PeriodEnd ? moment(motorInsuranceDetails.PeriodEnd) : null,
          RenewalDate: motorInsuranceDetails?.RenewalDate ? moment(motorInsuranceDetails.RenewalDate) : null,
          Premium: motorInsuranceDetails?.Premium,
          Commission: motorInsuranceDetails?.Commission,
          CompanyID: companyName, // Assuming you want to set the initial company name as default
          Branch: motorInsuranceDetails?.Branch,
          BranchName: motorInsuranceDetails?.BranchName,
          BranchTelephone: motorInsuranceDetails?.BranchTelephone,
          BranchEmail: motorInsuranceDetails?.BranchEmail,
        }}
      >
   <Form.Item
  name="PolicyType"
  label="Add to Existing Policies"
  rules={[{ required: false, message: 'Please select the policy type' }]}
>
  <Row gutter={8} align="middle">
    <Col flex="auto">
      <Select
        placeholder="Add to existing policy"
        onChange={setAddexisitngPolicy}
        value={AddexisitngPolicy}
        style={{ width: '100%', backgroundColor: '#e6f7ff' }} // light blue tone
      >
        {/* Log existingPolicies.PVT to verify data */}
        {console.log(AddexisitngPolicy)} 

        {(existingPolicies?.PVT || []).map((type) => (
          <Option key={type.PolicyID} value={type.PolicyID}>
            {type.PolicyNo}
          </Option>
        ))}
      </Select>
    </Col>
    <Col>
      <Button 
        onClick={() => handleAddToExistingPolicy()} 
        icon={<FileAddOutlined />} 
        type="primary"
        style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} // blue-toned button
      >
        Add
      </Button>
    </Col>
  </Row>
</Form.Item>



<h3>Vehicle Additional Details</h3>
<h4>Plate No: {PlateNo}</h4>

         <Form.Item
          name="PolicyType"
          label="Policy Type"
          rules={[{ required: true, message: 'Please select the policy type' }]}
        >
          <Select
            placeholder="Select Policy Types"
            onChange={setSelectedPolicies}
            value={selectedPolicies} // Display the currently selected policies
            disabled // Make the select read-only
          >
            {policyTypes.map((type) => (
              <Option key={type.PolicyTypeID} value={type.PolicyTypeID}>
                {type.Ptype}
              </Option>
            ))}
          </Select>
        </Form.Item>
    
        <Form.Item
  name="PolicyNo"
  label="Customer Code"
>
  <Input 
    placeholder={policyNo} 
    defaultValue={policyNo} 
    disabled
  />
</Form.Item>




        <Form.Item label="Policy Period" style={{ marginBottom: 0 }}>
          <Form.Item
            name="PeriodStart"
            label= "Period Start"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)' }}
            rules={[{ required: true, message: 'Please select the period start date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period Start" />
          </Form.Item>
          <Form.Item
            name="PeriodEnd"
              label= "Period End"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the period end date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period End" />
          </Form.Item>
          <Form.Item
            name="RenewalDate"
            label= "Renewal Date"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the renewal date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Renewal Date" />
          </Form.Item>
        </Form.Item>
    
        <Form.Item
          name="Premium"
          label="Premium"
          rules={[{ required: true, message: 'Please enter the premium amount' }]}
        >
          <InputNumber
            placeholder="Enter Premium"
            style={{ width: '100%' }}
            value={premium}
            onChange={(value) => {
              setPremium(value);
              updateCommission(value, commissionRate);
            }}
          />
        </Form.Item>
    
        <Form.Item
          name="Commission"
          label="Commission"
          rules={[{ required: false, message: 'Please enter the commission rate' }]}
        >
          <InputNumber
            placeholder="Enter Commission Rate"
            value={commission}
            onChange={(value) => {
              setCommissionRate(value);
              updateCommission(premium, value);
            }}
          />
        </Form.Item>
    
        <Form.Item
          name="CompanyID"
          label="Insurance Company"
          rules={[{ required: true, message: 'Please select an insurance company' }]}
        >
          <Select placeholder="Select Insurance Company" defaultValue={companyName}>
            {companies.map((company) => (
              <Option key={company.CompanyID} value={company.CompanyID}>
                {company.CompanyName}
              </Option>
            ))}
          </Select>
        </Form.Item>
    
        <Form.Item
          name="Branch"
          label="Branch"
          rules={[{ required: true, message: 'Please enter the branch' }]}
        >
          <Input placeholder="Enter Branch" />
        </Form.Item>
    
        <Form.Item label="Branch Details" style={{ marginBottom: 0 }}>
          <Form.Item
            name="BranchName"
            label="Branch Name"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '0px' }}
            rules={[{ required: true, message: 'Please enter the branch name' }]}
          >
            <Input placeholder="Enter Branch Name" />
          </Form.Item>
          <Form.Item
            name="BranchTelephone"
            label="Branch Telephone"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch telephone' }]}
          >
            <Input placeholder="Enter Branch Telephone" />
          </Form.Item>
          <Form.Item
            name="BranchEmail"
            label="Branch Email"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch email' }]}
          >
            <Input placeholder="Enter Branch Email" />
          </Form.Item>
        </Form.Item>
      
            <Form.Item
          name="Remark"
          label="Remark"
          rules={[{ required: false, message: 'Please enter the Renark' }]}
        >
          <Input
            placeholder="Enter Remark"
            style={{ width: '100%' }}
            value={premium}
            onChange={(value) => {
              setPremium(value);
              updateCommission(value, commissionRate);
            }}
          />
        </Form.Item>
      </Form>
    );
    
  }
  function renderThirdForm() {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          PeriodStart: motorInsuranceDetails?.PeriodStart ? moment(motorInsuranceDetails.PeriodStart) : null,
          PeriodEnd: motorInsuranceDetails?.PeriodEnd ? moment(motorInsuranceDetails.PeriodEnd) : null,
          RenewalDate: motorInsuranceDetails?.RenewalDate ? moment(motorInsuranceDetails.RenewalDate) : null,
          Premium: motorInsuranceDetails?.Premium,
          Commission: motorInsuranceDetails?.Commission,
          CompanyID: companyName, // Assuming you want to set the initial company name as default
          Branch: motorInsuranceDetails?.Branch,
          BranchName: motorInsuranceDetails?.BranchName,
          BranchTelephone: motorInsuranceDetails?.BranchTelephone,
          BranchEmail: motorInsuranceDetails?.BranchEmail,
        }}
      >
            
   <Form.Item
  name="PolicyType"
  label="Add to Existing Policies"
  rules={[{ required: false, message: 'Please select the policy type' }]}
>
  <Row gutter={8} align="middle">
    <Col flex="auto">
      <Select
        placeholder="Add to existing policy"
        onChange={setAddexisitngPolicy}
        value={AddexisitngPolicy}
        style={{ width: '100%', backgroundColor: '#e6f7ff' }} // light blue tone
      >
        {/* Log existingPolicies.PVT to verify data */}
        {console.log(AddexisitngPolicy)} 

        {(existingPolicies?.ThirdPartyExtension || []).map((type) => (
          <Option key={type.PolicyID} value={type.PolicyID}>
            {type.PolicyNo}
          </Option>
        ))}
      </Select>
    </Col>
    <Col>
      <Button 
        onClick={() => handleAddToExistingPolicy()} 
        icon={<FileAddOutlined />} 
        type="primary"
        style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} // blue-toned button
      >
        Add
      </Button>
    </Col>
  </Row>
</Form.Item>



<h3>Vehicle Additional Details</h3>
<h4>Plate No: {PlateNo}</h4>

         <Form.Item
          name="PolicyType"
          label="Policy Type"
          rules={[{ required: true, message: 'Please select the policy type' }]}
        >
          <Select
            placeholder="Select Policy Types"
            onChange={setSelectedPolicies}
            value={selectedPolicies} // Display the currently selected policies
            disabled // Make the select read-only
          >
            {policyTypes.map((type) => (
              <Option key={type.PolicyTypeID} value={type.PolicyTypeID}>
                {type.Ptype}
              </Option>
            ))}
          </Select>
        </Form.Item>
    
        <Form.Item
  name="PolicyNo"
  label="Customer Code"
>
  <Input 
    placeholder={policyNo} 
    defaultValue={policyNo} 
    disabled
  />
</Form.Item>
        <Form.Item label="Policy Period" style={{ marginBottom: 0 }}>
          <Form.Item
            name="PeriodStart"
            label= "Period Start"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)' }}
            rules={[{ required: true, message: 'Please select the period start date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period Start" />
          </Form.Item>
          <Form.Item
            name="PeriodEnd"
              label= "Period End"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the period end date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period End" />
          </Form.Item>
          <Form.Item
            name="RenewalDate"
            label= "Renewal Date"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the renewal date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Renewal Date" />
          </Form.Item>
        </Form.Item>
    
        <Form.Item
          name="Premium"
          label="Premium"
          rules={[{ required: true, message: 'Please enter the premium amount' }]}
        >
          <InputNumber
            placeholder="Enter Premium"
            style={{ width: '100%' }}
            value={premium}
            onChange={(value) => {
              setPremium(value);
              updateCommission(value, commissionRate);
            }}
          />
        </Form.Item>
    
        <Form.Item
          name="Commission"
          label="Commission"
          rules={[{ required: false, message: 'Please enter the commission rate' }]}
        >
          <InputNumber
            placeholder="Enter Commission Rate"
            value={commission}
            onChange={(value) => {
              setCommissionRate(value);
              updateCommission(premium, value);
            }}
          />
        </Form.Item>
    
        <Form.Item
          name="CompanyID"
          label="Insurance Company"
          rules={[{ required: true, message: 'Please select an insurance company' }]}
        >
          <Select placeholder="Select Insurance Company" defaultValue={companyName}>
            {companies.map((company) => (
              <Option key={company.CompanyID} value={company.CompanyID}>
                {company.CompanyName}
              </Option>
            ))}
          </Select>
        </Form.Item>
    
        <Form.Item
          name="Branch"
          label="Branch"
          rules={[{ required: true, message: 'Please enter the branch' }]}
        >
          <Input placeholder="Enter Branch" />
        </Form.Item>
    
        <Form.Item label="Branch Details" style={{ marginBottom: 0 }}>
          <Form.Item
            name="BranchName"
            label="Branch Name"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '0px' }}
            rules={[{ required: true, message: 'Please enter the branch name' }]}
          >
            <Input placeholder="Enter Branch Name" />
          </Form.Item>
          <Form.Item
            name="BranchTelephone"
            label="Branch Telephone"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch telephone' }]}
          >
            <Input placeholder="Enter Branch Telephone" />
          </Form.Item>
          <Form.Item
            name="BranchEmail"
            label="Branch Email"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch email' }]}
          >
            <Input placeholder="Enter Branch Email" />
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="Remark"
          label="Remark"
          rules={[{ required: false, message: 'Please enter the Renark' }]}
        >
          <Input
            placeholder="Enter Remark"
            style={{ width: '100%' }}
            value={premium}
            onChange={(value) => {
              setPremium(value);
              updateCommission(value, commissionRate);
            }}
          />
        </Form.Item>
       
      </Form>
    );
    
  }

  function renderCarrierForm() {
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          PeriodStart: motorInsuranceDetails?.PeriodStart ? moment(motorInsuranceDetails.PeriodStart) : null,
          PeriodEnd: motorInsuranceDetails?.PeriodEnd ? moment(motorInsuranceDetails.PeriodEnd) : null,
          RenewalDate: motorInsuranceDetails?.RenewalDate ? moment(motorInsuranceDetails.RenewalDate) : null,
          Premium: motorInsuranceDetails?.Premium,
          Commission: motorInsuranceDetails?.Commission,
          CompanyID: companyName,
          Branch: motorInsuranceDetails?.Branch,
          BranchName: motorInsuranceDetails?.BranchName,
          BranchTelephone: motorInsuranceDetails?.BranchTelephone,
          BranchEmail: motorInsuranceDetails?.BranchEmail,
        }}
      >
            
   <Form.Item
  name="PolicyType"
  label="Add to Existing Policies"
  rules={[{ required: false, message: 'Please select the policy type' }]}
>
  <Row gutter={8} align="middle">
    <Col flex="auto">
      <Select
        placeholder="Add to existing policy"
        onChange={setAddexisitngPolicy}
        value={AddexisitngPolicy}
        style={{ width: '100%', backgroundColor: '#e6f7ff' }} // light blue tone
      >
        {/* Log existingPolicies.PVT to verify data */}
        {console.log(AddexisitngPolicy)} 

        {(existingPolicies?.CarriersLiability || []).map((type) => (
          <Option key={type.PolicyID} value={type.PolicyID}>
            {type.PolicyNo}
          </Option>
        ))}
      </Select>
    </Col>
    <Col>
      <Button 
        onClick={() => handleAddToExistingPolicy()} 
        icon={<FileAddOutlined />} 
        type="primary"
        style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }} // blue-toned button
      >
        Add
      </Button>
    </Col>
  </Row>
</Form.Item>



<h3>Vehicle Additional Details</h3>
<h4>Plate No: {PlateNo}</h4>

        <Form.Item
          name="PolicyType"
          label="Policy Type"
          rules={[{ required: true, message: 'Please select the policy type' }]}
        >
          <Select
            placeholder="Select Policy Types"
            onChange={setSelectedPolicies}
            value={selectedPolicies} // Display the currently selected policies
            disabled // Make the select read-only
          >
            {policyTypes.map((type) => (
              <Option key={type.PolicyTypeID} value={type.PolicyTypeID}>
                {type.Ptype}
              </Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
  name="PolicyNo"
  label="Customer Code"
>
  <Input 
    placeholder={policyNo} 
    defaultValue={policyNo} 
    disabled
  />
</Form.Item>
        
        <Form.Item label="Policy Period" style={{ marginBottom: 0 }}>
          <Form.Item
            name="PeriodStart"
            label="Period Start"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)' }}
            rules={[{ required: true, message: 'Please select the period start date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period Start" />
          </Form.Item>
          <Form.Item
            name="PeriodEnd"
            label="Period End"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the period end date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Period End" />
          </Form.Item>
          <Form.Item
            name="RenewalDate"
            label="Renewal Date"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please select the renewal date' }]}
          >
            <DatePicker format="YYYY-MM-DD" placeholder="Select Renewal Date" />
          </Form.Item>
        </Form.Item>
  
        <Form.Item
          name="PolicyPeriodLiabilityLimit"
          label="Policy Period Liability Limit"
          rules={[{ required: true, message: 'Please enter the Policy Period Liability Limit' }]}
        >
          <InputNumber
            placeholder="Enter Policy Period Liability Limit"
            style={{ width: '100%' }}
            value={PolicyPeriodLiabilityLimit} // Make sure to set this state in your component
            onChange={(value) => setPolicyPeriodLiabilityLimit(value)} // Update your state
          />
        </Form.Item>
        
        <Form.Item
          name="EventLiabilityLimit"
          label="Event Liability Limit"
          rules={[{ required: true, message: 'Please enter the Event Liability Limit' }]}
        >
          <InputNumber
            placeholder="Enter Event Liability Limit"
            style={{ width: '100%' }}
            value={EventLiabilityLimit} // Make sure to set this state in your component
            onChange={(value) => setEventLiabilityLimit(value)} // Update your state
          />
        </Form.Item>
        
        <Form.Item
          name="Premium"
          label="Premium"
          rules={[{ required: true, message: 'Please enter the premium amount' }]}
        >
          <InputNumber
            placeholder="Enter Premium"
            style={{ width: '100%' }}
            value={premium} // Ensure state is set
            onChange={(value) => {
              setPremium(value);
              updateCommission(value, commissionRate);
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="Commission"
          label="Commission"
          rules={[{ required: false, message: 'Please enter the commission rate' }]}
        >
          <InputNumber
            placeholder="Enter Commission Rate"
            value={commission} // Ensure state is set
            onChange={(value) => {
              setCommissionRate(value);
              updateCommission(premium, value);
            }}
          />
        </Form.Item>
  
        <Form.Item
          name="CompanyID"
          label="Insurance Company"
          rules={[{ required: true, message: 'Please select an insurance company' }]}
        >
          <Select placeholder="Select Insurance Company" defaultValue={companyName}>
            {companies.map((company) => (
              <Option key={company.CompanyID} value={company.CompanyID}>
                {company.CompanyName}
              </Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item
          name="Branch"
          label="Branch"
          rules={[{ required: true, message: 'Please enter the branch' }]}
        >
          <Input placeholder="Enter Branch" />
        </Form.Item>
  
        <Form.Item label="Branch Details" style={{ marginBottom: 0 }}>
          <Form.Item
            name="BranchName"
            label="Branch Name"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)' }}
            rules={[{ required: true, message: 'Please enter the branch name' }]}
          >
            <Input placeholder="Enter Branch Name" />
          </Form.Item>
          <Form.Item
            name="BranchTelephone"
            label="Branch Telephone"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch telephone' }]}
          >
            <Input placeholder="Enter Branch Telephone" />
          </Form.Item>
          <Form.Item
            name="BranchEmail"
            label="Branch Email"
            style={{ display: 'inline-block', width: 'calc(33% - 8px)', marginLeft: '8px' }}
            rules={[{ required: true, message: 'Please enter the branch email' }]}
          >
            <Input placeholder="Enter Branch Email" />
          </Form.Item>
        </Form.Item>
  
        <Form.Item
          name="Remark"
          label="Remark"
          rules={[{ required: false, message: 'Please enter the Remark' }]}
        >
          <Input
            placeholder="Enter Remark"
            style={{ width: '100%' }}
            value={remark} // Ensure state is set
            onChange={(e) => setRemark(e.target.value)} // Update your state
          />
        </Form.Item>
      </Form>
    );
  }
  
};

export default AddInsurancePolicy;

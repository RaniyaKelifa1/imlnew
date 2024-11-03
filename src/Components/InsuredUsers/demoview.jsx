import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Col, Row, Typography, message } from 'antd';
import Chart from 'react-apexcharts';
import { CarOutlined, FileDoneOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const DemoViewPage = () => {
  const [vehicleData, setVehicleData] = useState([]);
  const [policyData, setPolicyData] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [clientCounts, setClientCounts] = useState({ person: 0, organization: 0 });

  useEffect(() => {
    fetchVehicleData();
    fetchPolicyData();
    fetchClientData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/vehicles`);
      setVehicleData(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle data:', error);
    }
  };

  const fetchPolicyData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/policies`);
      setPolicyData(response.data);
    } catch (error) {
      console.error('Failed to fetch policy data:', error);
    }
  };

  const fetchClientData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/clients`);
      const clients = response.data;
  
      // Initialize counts for clients
      const counts = { person: 0, organization: 0 };
  
      // Count clients by type
      clients.forEach(client => {
        if (client.ClientType === 'Person') {
          counts.person++;
        } else if (client.ClientType === 'Organization') {
          counts.organization++;
        }
      });
  
      // Update state with fetched clients and their counts
      setClientData(clients);
      setClientCounts(counts);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      message.error('Could not load client data.'); // Optional: Show user notification
    }
  };
  

  // Line Chart Configuration for Premium Trends
  const lineChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: policyData.map((policy) => policy.PolicyNo), // Displaying Policy Numbers
    },
    tooltip: {
      enabled: true,
    },
  };

  // Series data for the line chart
  const lineChartSeries = [
    {
      name: 'Premium',
      data: policyData.map((policy) => Number(policy.Premium)), // Mapping Premium amounts
    },
  ];

  // Pie Chart Configuration for Client Distribution
  const pieChartOptions = {
    chart: {
      type: 'pie',
    },
    labels: ['Persons', 'Organizations'],
    legend: {
      position: 'bottom',
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3} style={{ fontSize: '36px', fontWeight: 'bold', marginRight: '10px' }}>Insurance Analytics Dashboard</Title>

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card
            title="Total Vehicles"
            bordered={false}
            style={{ backgroundColor: '#E6F7FF', color: '#1890FF' }}
          >
            <CarOutlined style={{ fontSize: '24px', color: '#1890FF', marginRight: '10px' }} />
            {vehicleData.length}
          </Card>
        </Col>

        <Col span={6}>
          <Card
            title="Total Policies"
            bordered={false}
            style={{ backgroundColor: '#FFF1F0', color: '#FF4D4F' }}
          >
            <FileDoneOutlined style={{ fontSize: '24px', color: '#FF4D4F', marginRight: '10px' }} />
            {policyData.length}
          </Card>
        </Col>

        <Col span={6}>
          <Card
            title="Total Clients"
            bordered={false}
            style={{ backgroundColor: '#F6FFED', color: '#52C41A' }}
          >
            <TeamOutlined style={{ fontSize: '24px', color: '#52C41A', marginRight: '10px' }} />
            {clientData.length}
          </Card>
        </Col>

        <Col span={6}>
          <Card
            title="Persons vs Organizations"
            bordered={false}
            style={{ backgroundColor: '#FFFBE6', color: '#FAAD14' }}
          >
            <UserSwitchOutlined style={{ fontSize: '24px', color: '#FAAD14', marginRight: '10px' }} />
            {clientCounts.person} / {clientCounts.organization}
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Line Chart */}
        <Col span={15}>
          <Card title="Premium Trends by Policy" className="shadow-default">
            <Chart
              options={lineChartOptions}
              series={lineChartSeries}
              type="line"
              height={300}
            />
          </Card>
        </Col>

        {/* Pie Chart */}
        <Col span={8}>
          <Card title="Client Distribution" className="shadow-default">
            <Chart
              options={pieChartOptions}
              series={[clientCounts.person, clientCounts.organization]}
              type="pie"
              height={300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DemoViewPage;

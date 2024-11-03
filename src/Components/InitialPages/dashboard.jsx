import { Layout, Menu, Typography, Dropdown,Modal,  Button, Input, notification} from 'antd';
import { auth } from './firebase'; // Adjust the import based on your file structure
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  PlusOutlined,
  EyeOutlined,
  HomeOutlined,
  UserOutlined,
  InsuranceOutlined,
  CarOutlined,
  FileTextOutlined,
  ReloadOutlined,
  LogoutOutlined,
  UsergroupAddOutlined 
} from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';



const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const Dashboard = ({ onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const logo = 'https://raw.githubusercontent.com/RaniyaKelifa1/ims-phase-two/master/BM-logo.png';
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAddAdmin = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      notification.success({
        message: 'Admin Added',
        description: `Admin account created successfully! Email: ${email}, Password: ${password}`,
      });
      // Copy email and password to clipboard
      await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
      console.log('Email and password copied to clipboard');
      // Reset fields and close modal
      setEmail('');
      setPassword('');
      onClose();
    } catch (error) {
      notification.error({
        message: 'Error Adding Admin',
        description: error.message,
      });
    }
  };
  useEffect(() => {
    // Any initialization logic can go here
  }, []);



  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect or update state after successful logout
      console.log('Logged out successfully');
      navigate('/')
      // Optionally, redirect to login page or show a success message
    } catch (error) {
      console.error('Error logging out: ', error);
      // Handle errors (e.g., show a notification)
    }
  };
  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleRefresh = () => {
    window.location.reload(); // Refresh the page
  };
const profileMenu = (handleLogout) => (
  <Menu>
    <Menu.Item key="admin" icon={<UserOutlined />} onClick={() => setVisible(true)}>
      Add Admin
    </Menu.Item>
    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
      Logout
    </Menu.Item>
  </Menu>
);
  return (
    
    <Layout style={{ minHeight: '100vh', width: '120vw' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={handleCollapse}>
        <div className="logo" style={{ display: 'flex', justifyContent: 'center', padding: '35px' }}></div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/dashboard/demoview">Home</Link>
          </Menu.Item>
          <Menu.Item key="12" icon={<UsergroupAddOutlined />}>
            <Link to="/dashboard/addsales">Add Sales Agent</Link>
          </Menu.Item>
          <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="Clients">
            <Menu.Item key="2" icon={<EyeOutlined />}>
              <Link to="/dashboard/clientview">View Data</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<PlusOutlined />}>
              <Link to="/dashboard/addperson">Add Individual</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<PlusOutlined />}>
              <Link to="/dashboard/addorganization">Add Organization</Link>
            </Menu.Item>
          </Menu.SubMenu>
     
          <Menu.SubMenu key="sub2" icon={<CarOutlined />} title="Objects">
            <Menu.Item key="6" icon={<EyeOutlined  />}>
              <Link to="/dashboard/Viewveh">View Vehicle</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<EyeOutlined  />}>
              <Link to="/dashboard/viewworkmen">View Workmen's Compensation</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="10" icon={<InsuranceOutlined />}>
            <Link to="/dashboard/viewInsurance">Policies</Link>
          </Menu.Item>
          <Menu.Item key="11" icon={<FileTextOutlined />}>
            <Link to="/dashboard/viewClaims">Claims</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>



 <Header
  className="header"
  style={{
    background: '#fff',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Roboto, sans-serif',
  }}
>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src={logo}
      alt="Company Logo"
      style={{
        width: '50px', // Adjust size for a minimalistic look
        height: 'auto',
        marginRight: '16px',
      }}
    />
    <Typography.Title
      level={4}
      style={{
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#0a3383',
      }}
    >
     Bizuhan & Mebratu Insurance Brokers
    </Typography.Title>
  </div>

  <div style={{ display: 'flex', alignItems: 'center' }}>
  <Button
    onClick={handleRefresh}
    style={{
      backgroundColor: '#fff',
      border: 'none',
      color: '#0a3383',
      borderRadius: '10%', // Circular button for a modern look
      width: '40px',
      height: '40px',
      marginRight: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
    }}
    icon={<ReloadOutlined style={{  fontSize: '20px', color: '#0a3383' }} />} // Icon inside the button
    size="large"
  />

  <Dropdown overlay={profileMenu(handleLogout)} trigger={['click']}>
    <Button
      style={{
        backgroundColor: '#fff',
        border: 'none',
        color: '#0a3383',
        borderRadius: '10%', // Circular button for a modern look
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
      }}
      size="large"
    >
      <UserOutlined style={{ fontSize: '20px', color: '#0a3383' }} /> {/* Profile icon */}
    </Button>
  </Dropdown>
</div>




</Header>


        <Content style={{ padding: '24px', margin: '0', minHeight: 'calc(100vh - 64px)' }}>
          <div className="site-layout-content" style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Outlet /> {/* Render nested routes here */}
          </div>
        </Content>
        
        <Footer style={{ textAlign: 'center', backgroundColor: '#f0f2f5', padding: '24px' }}>
          <Typography.Text>© {new Date().getFullYear()} Bizuhan & Mebratu Insurance Brokers. All Rights Reserved.</Typography.Text>
          <br />
          <Typography.Text>Insurance Management System</Typography.Text>
          <br />
          <Typography.Text>Developed by Gravity Technology</Typography.Text>
        </Footer>
      </Layout>
      <Modal
      title="Add Admin"
      visible={visible}
      onCancel={() => {
      setVisible(false)
      }}
      footer={[
        <Button key="submit" type="primary" onClick={handleAddAdmin}>
          Add Admin
        </Button>,
      ]}
    >
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <Input.Password
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
    </Modal>
    </Layout>
    
  );
};

export default Dashboard;

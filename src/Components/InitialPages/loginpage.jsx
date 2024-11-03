import { useNavigate } from 'react-router-dom';
import { Button, Typography, Layout } from 'antd';
import { useEffect, useState } from 'react';
import { auth } from './firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase login function
import './WelcomePage.css'; // Make sure to include your CSS file for custom styles

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const WelcomePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [animationData, setAnimationData] = useState(null);
  const logo = 'https://raw.githubusercontent.com/RaniyaKelifa1/ims-phase-two/master/BM-logo.png';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard/demoview'); // Redirect to dashboard after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/test');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    const fetchAnimation = async () => {
      try {
        const response = await fetch('https://lottie.host/7cb073a1-d328-4f16-b2a2-96640b9c5127/TEwu3TsPPY.json');
        if (!response.ok) throw new Error('Failed to load animation');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading animation:', error);
      }
    };

    fetchMessage();
    fetchAnimation();
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <Layout
    style={{
      minHeight: '100vh',
      width: '100vw',
      animation: 'backgroundAnimation 10s ease infinite',
    }}
    className="animated-background"
  >
      <Content style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        padding: '20px', 
        position: 'relative' 
      }}>
        <img 
          src="https://pagedone.io/asset/uploads/1702362010.png" 
          alt="gradient background" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            zIndex: -1 
          }} 
        />
        
        <div style={{ 
          maxWidth: '600px', 
          width: '100%', 
          background: 'white', 
          borderRadius: '20px', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
          padding: '40px', 
          textAlign: 'center' 
        }}>
          <img 
            src={logo} 
            alt="Company Logo" 
            style={{ 
              maxWidth: '30%', 
              height: 'auto', 
              marginBottom: '20px' 
            }} 
          />
          
          <Title level={2} style={{ textAlign: 'center', marginBottom: '0px' }}>
            Welcome Back, Admin
          </Title>
          <Paragraph style={{ color: '#116d9d', marginBottom: '30px', textAlign: 'center', fontSize: '17px' }}>
            Bizuhan & Mebratu Insurance Brokers GP.
          </Paragraph>
          {/* <Paragraph style={{ color: '#333', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
            As an administrator, you play a crucial role in ensuring our clients receive the best service possible. 
          </Paragraph> */}
      
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ 
                width: '50%', 
                height: '50px', // Increased height for a thicker input field
                marginTop: '20px', 
                marginBottom: '20px', 
                backgroundColor: '#116d9d', 
                borderColor: '#116d9d', 
                borderWidth: '2px', // Optional: increase border thickness
                borderRadius: '5px', // Ensure it's rectangular
                color: 'white', // Change text color for better contrast
                padding: '0 16px' // Add padding for better text positioning
              }}
            >
              Login
            </Button>
            <Paragraph style={{ color: '#777', textAlign: 'center', fontSize: '16px', fontStyle: 'italic' }}>
            "Serving you with utmost good faith!"
          </Paragraph>
          </form>
        </div>
      </Content>
    </Layout>
  );
};

export default WelcomePage;

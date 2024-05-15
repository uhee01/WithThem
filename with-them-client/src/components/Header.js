import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Toolbar, IconButton, Box, Typography, SvgIcon } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Header = () => {
  let navigate = useNavigate();

  const handleNavigateToHome = () => {
    navigate('/');
  };

  const handleNavigateToDiscover = () => {
    navigate('/discover');
  };

  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/user', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키를 포함시켜 요청
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류가 발생했습니다.", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Toolbar sx={{ borderBottom: '0.1px solid #e0e0e0', margin: 1 }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleNavigateToHome} sx={{ marginRight: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{
          position: 'relative',
          marginLeft: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center'
        }}
          onClick={handleNavigateToDiscover}>
          <SvgIcon sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)'
          }}>
            <AutoAwesomeIcon />
          </SvgIcon>
          <Typography variant="body1" sx={{ paddingLeft: '32px', fontWeight: 'bolder' }}>
            With Them
          </Typography>
        </Box>
      </Box>
      <IconButton color="inherit" component={Link} to="/settings">
        <AccountCircleIcon />
      </IconButton>
      {user && (
        <Typography variant="body1" sx={{ marginLeft: 1, marginRight: 3 }}>
          <span style={{ color: '#303f9f', fontWeight: 'bold' }}>{user.MBR_NICK}</span>
          <span>님</span>
        </Typography>
      )}
    </Toolbar>
  );
};

export default Header;

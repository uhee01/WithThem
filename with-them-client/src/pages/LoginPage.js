import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, IconButton, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function LoginPage() {
  let navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 기본 이벤트 방지
  
    // 입력 필드에서 id와 password 값을 가져옴
    const id = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;
  
    try {
      // 로그인 API에 POST 요청을 보냄
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
        credentials: 'include', // 쿠키를 포함시키기 위한 설정
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // 응답에서 받은 토큰을 localStorage에 저장
        navigate('/discover'); // 로그인 성공 시 페이지 이동
      } else {
        alert('Login failed'); // 로그인 실패 처리
      }
    } catch (error) {
      console.error('Login error:', error); // 에러 처리
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '20px', md: '60px' },
        '& .MuiTextField-root': { mb: 2, width: '100%' },
        '& .MuiButton-root': { width: '100%' },
      }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Welcome
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Enter your information to get started
      </Typography>
      <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
        <NavigationIconButton to="/login">Sign in</NavigationIconButton>
        <NavigationIconButton to="/join">Sign up</NavigationIconButton>
      </Stack>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          p: 5,
        }}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h5" sx={{ fontWeight: 'bolder', mb: 2, alignSelf: 'flex-start' }}>
          Login
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2, alignSelf: 'flex-start' }}>
          Enter your name and password to login to your account
        </Typography>
        <CustomTextField
          id="login-id" 
          label="ID"
          placeholder="Enter ID"
        />
        <CustomTextField
          id="login-password" 
          label="Password"
          placeholder="Enter password"
          type="password"
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleLogin}>
          Sign in
        </Button>
      </Box>
    </Box>
  );
}

function CustomTextField({ id, label, placeholder, type = 'text' }) {
  return (
    <TextField
      id={id}
      label={label}
      placeholder={placeholder}
      type={type}
      variant="outlined"
    />
  );
}

function NavigationIconButton({ to, children, sx }) {
  let navigate = useNavigate();
  return (
    <IconButton onClick={() => navigate(to)} sx={{ fontSize: '18px', ...sx }}>
      <ArrowForwardIcon fontSize="inherit" /> {children}
    </IconButton>
  );
}

export default LoginPage;

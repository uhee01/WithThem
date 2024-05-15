import React, { useState, useEffect } from 'react';

import { Grid, Paper, Box, Typography, Avatar, AppBar, Toolbar, IconButton, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import CustomButton from '../components/CustomButton.js';

function StartPage() {
  let navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 상태 확인
    fetch('http://localhost:8080/api/check-session', {
      credentials: 'include', // 쿠키 포함
    })
      .then(response => response.json())
      .then(data => setIsLoggedIn(data.isLoggedIn))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리
    fetch('http://localhost:8080/api/logout', {
      method: 'POST', 
      credentials: 'include', // 쿠키 포함
    })
      .then(() => {
        setIsLoggedIn(false);
        navigate('/');
      })
      .catch(error => console.error('Logout Error:', error));
  };
  return (
    <>
      <Navi isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <MainBody isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
    </>
  );
}

function Navi({ isLoggedIn, handleLogout }) {
  let navigate = useNavigate();
  

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', borderBottom: '0.5px solid rgb(200, 200, 200)' }}>
      <Container>
        <Toolbar disableGutters>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="logo"
            sx={{ mr: 2 }}
            onClick={() => { navigate('/'); }}
          >
            <img src="/logo512.png" alt="" width="30" height="30" />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', color: 'black', ml: 1 }}
            >
              With Them
            </Typography>
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex' }}>
            {!isLoggedIn ? (
              <>
                <CustomButton
                  onClick={() => { navigate('/login'); }}
                  text="Log In"
                  bgcolor="black"
                  color="white"
                  borderColor="rgba(0, 0, 0, 0.8)"
                />
                <CustomButton
                  onClick={() => { navigate('/join'); }}
                  text="Sign Up"
                />
              </>
            ) : (
              <CustomButton
                onClick={handleLogout}
                text="Log Out"
                bgcolor="black"
                color="white"
                borderColor="rgba(0, 0, 0, 0.8)"
              />
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}


function MainBody({ isLoggedIn, handleLogout }) {
  let navigate = useNavigate();
  const [showReview, setshowReview] = useState([]); 

  useEffect(() => {
    fetch('http://localhost:8080/api/showReview')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => { 
        setshowReview(data); 
        console.log('data:', data);
      })
      .catch(error => console.error('Error fetching data: ', error));
  }, []);

  
  return (
    <>
      <Box sx={{
        padding: { xs: '100px 25px', md: '150px 50px', }, backgroundColor: 'rgba(231, 231, 231, 0.2)'
      }}>
        <Container sx={{ px: { md: 5 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                Achieve Your Goals with People
              </Typography>
              <Typography variant="body1" sx={{ p: 3, fontSize: { xs: '0.75rem', md: '1rem' } }}>
                With Them is a powerful tool that helps you track your progress, stay motivated, and achieve your
                goals.<br></br>Sign up today to get started!
              </Typography>
            </Box>
            <Box>
            {!isLoggedIn ? (
              <>
                <CustomButton
                onClick={() => { navigate('/join'); }}
                text="Sign Up"
              />
                <CustomButton
                onClick={() => { navigate('/login'); }}
                text="Log In"
                bgcolor="black"
                color="white"
                borderColor="rgba(0, 0, 0, 0.8)"
              />
              </>
            ) : (
              <CustomButton
              onClick={() => { navigate('/discover'); }}
              text="Enter"
              />
            )}
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ backgroundColor: 'rgb(248, 247, 255)' }}>
        <Grid container spacing={2} sx={{ justifyContent: 'center', px: 4, mb: 5 }}>
          <Box sx={{ textAlign: 'center', color: '#5b5b5b', my: 5 }}>
            <Box sx={{ fontSize: '1.2em', fontWeight: 'bold', fontSize: { xs: '1em', sm: '1.2em' } }}>Success Stories</Box>
            <Typography variant="h4" sx={{ my: 3, color: '#000', fontSize: { xs: '1.5em', sm: '2em', md: 'h4.fontSize' } }}>
              See How Others Have Achieved Their Goals
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', fontSize: { xs: '0.8em', sm: '0.9em', md: '1em' } }}>
              Read about the experiences of our users and how Acme App helped them reach their goals.
            </Typography>
          </Box>
          <Grid item xs={12} md={6} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            {showReview.map((showReview, index) => (
              <ReviewDisplay key={index} {...showReview} />
            ))}        
            </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box component="img" alt="Success Stories" sx={{ width: '100%', height: 'auto' }} src="/img/main_review.jpg" />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

function ReviewDisplay({ RVW_CONT, MBR_ID, MBR_NICK, MBR_PFP  }) {
  return (
    <Paper sx={{ padding: 2, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Avatar sx={{ width: 50, height: 50, borderRadius: '50%', mr: 1.5 }}>
          <Box component="img" src={MBR_PFP} alt="Avatar" sx={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#fff' }} />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 'bold' }}>{MBR_NICK}</Typography>
          <Typography sx={{ color: '#777', fontSize: '0.85em' }}>{MBR_ID}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontStyle: 'italic' }}>
        "{RVW_CONT}"
      </Typography>
    </Paper>
  );
}

export default StartPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, IconButton, Stack } from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import checkNicknameAvailability from '../functions/checkNicknameAvailability.js';

function JoinPage() {
    let navigate = useNavigate();
    const [nicknameAvailable, setNicknameAvailable] = useState(false);
    const [passwordCheck, setPasswordCheck] = useState('');
    const [userInfo, setUserInfo] = useState({
        id: '',
        password: '',
        passwordCheck: '',
        nickname: '',
    });

    // 닉네임 중복 확인 요청 함수
    const handleCheckAvailabilityClick = async () => {
        try {
            const available = await checkNicknameAvailability(userInfo.nickname);
            setNicknameAvailable(available);
            alert(available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
        } catch (error) {
            alert('닉네임 중복 확인 중 오류가 발생했습니다.');
        }
    };

    // 회원가입 요청 함수
    const signup = async () => {
        if (userInfo.password !== passwordCheck) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!nicknameAvailable) {
            alert('먼저 닉네임 중복 확인을 해주세요.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/signup', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userInfo),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            if (result.success) {
                alert('회원가입에 성공했습니다.');
                navigate('/login');
            } else {
                alert(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "passwordCheck") {
            setPasswordCheck(value);
        } else {
            setUserInfo((prev) => ({
                ...prev,
                [name]: value,
            }));
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
                    padding: 5,
                }}
                noValidate
                autoComplete="off">
                <Typography variant="h5" sx={{ fontWeight: 'bolder', mb: 2, alignSelf: 'flex-start' }}>
                    Join
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, alignSelf: 'flex-start' }}>
                    Enter your name and password to login to your account
                </Typography>
                <CustomTextField
                    label="ID"
                    name="id"
                    placeholder="Enter ID"
                    value={userInfo.id}
                    onChange={handleChange}
                />
                <CustomTextField
                    label="Password"
                    placeholder="Enter password"
                    type="password"
                    name="password"
                    value={userInfo.password}
                    onChange={handleChange}
                />
                <CustomTextField
                    label="Password check"
                    name="passwordCheck"
                    placeholder="Enter password again"
                    type="password"
                    value={passwordCheck}
                    onChange={handleChange}
                />
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <CustomTextField
                        label="Nickname"
                        placeholder="Enter nickname"
                        sx={{ flexGrow: 1 }}
                        name="nickname"
                        value={userInfo.nickname}
                        onChange={handleChange}
                    />
                    <IconButton sx={{ width: '200px' }} onClick={handleCheckAvailabilityClick}>
                        <CheckCircleOutlineIcon />
                        <Typography sx={{ pl: 1 }}>Check Availability</Typography>
                    </IconButton>
                </Stack>
                <Button variant="contained" sx={{ mt: 2 }} disabled={!nicknameAvailable || !userInfo.id || !userInfo.password || !userInfo.nickname} onClick={signup}>Sign up</Button>
            </Box>
        </Box>
    );
};

function CustomTextField({ label, placeholder, type = 'text', name, value, onChange }) {
    return (
        <TextField
            label={label}
            placeholder={placeholder}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
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

export default JoinPage;

import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Avatar, TextField, useMediaQuery, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';



import Header from '../components/Header.js';
import Sidebar from '../components/Sidebar.js';
import checkNicknameAvailability from '../functions/checkNicknameAvailability.js';


const SettingsPage = () => {
    return (
        <>
            <Box sx={{ display: 'flex', height: '100vh' }}>
                <Sidebar />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Header />
                    <MainContent />
                </Box>
            </Box>
        </>
    );
};

const MainContent = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [nickname, setNickname] = React.useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState('/placeholder-user.jpg');
    const [nicknameAvailable, setNicknameAvailable] = useState(false);
    const [nicknameChanged, setNicknameChanged] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    // 닉네임 중복 확인 요청 함수
    const handleCheckAvailabilityClick = async () => {
        if (!nicknameChanged) {
            setNicknameAvailable(true);
            return;
        }

        try {
            const available = await checkNicknameAvailability(nickname);
            setNicknameAvailable(available);
            alert(available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
        } catch (error) {
            alert('닉네임 중복 확인 중 오류가 발생했습니다.');
        }
    };

    // 정보 변경 요청 함수
    const changeNickname = async () => {
        if (nicknameAvailable !== true) {
            alert('닉네임 중복 확인을 먼저 해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('nickname', nickname);
        if (selectedFile) {
            formData.append('avatar', selectedFile);
        }

        try {
            const response = await fetch('http://localhost:8080/api/nickname/change', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            if (result.success) {
                alert('정보가 성공적으로 변경되었습니다.');
                setImagePreviewUrl(result.avatarUrl || '/placeholder-user.jpg');
            } else {
                alert('정보 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('정보 변경 중 오류가 발생했습니다.');
        }
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
                    setNickname(data.user.MBR_NICK);
                    setImagePreviewUrl(data.user.MBR_PFP);
                }
            } catch (error) {
                console.error("사용자 정보를 가져오는 중 오류가 발생했습니다.", error);
            }
        };

        fetchUser();
    }, []);

    return (
        <Box maxWidth={isMobile ? 'sm' : 'md'} sx={{
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            margin: 'auto',
        }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', margin: 1, marginTop: 3, color: '#3f51b5' }}>Profile</Typography>
                <Typography variant="body2" color="text.secondary">Update your profile information.</Typography>
                <Box sx={{ padding: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}> 
                        <Avatar sx={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100 }} src={imagePreviewUrl}  />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {selectedFile && (
                                <Typography variant="body2">{selectedFile.name}</Typography>
                            )}
                            <label htmlFor="upload-photo">
                                <input
                                    style={{ display: 'none' }}
                                    id="upload-photo"
                                    name="upload-photo"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <Button variant="outlined" component="span" sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}>Change Photo</Button>
                            </label>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', marginTop: 5 }}>
                        <TextField
                            id="nickname"
                            label={user && user.MBR_NICK}
                            variant="outlined"
                            fullWidth
                            value={nickname}
                            onChange={(e) => { setNicknameChanged(true); setNickname(e.target.value) }}
                            placeholder="Enter your nickname"
                            sx={{ input: { color: '#3f51b5' } }}
                        />
                        <Button variant="outlined" sx={{ fontSize: isMobile ? '10px' : '12px', width: isMobile ? '100px' : '300px', p: isMobile ? 1 : 2, borderColor: '#3f51b5', color: '#3f51b5' }} onClick={() => handleCheckAvailabilityClick(nickname)}>Check Availability</Button>
                    </Box>
                </Box>
                <Box sx={{ justifyContent: 'center', display: 'flex', p: 2, marginTop: 5, gap: 3 }}>
                    <Button
                        onClick={() => navigate('/discover')}
                        sx={{
                            backgroundColor: '#9e9e9e',
                            color: 'white',
                            p: 1,
                            borderRadius: '5px',
                            '&:hover': {
                                backgroundColor: '#757575',
                            }
                        }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={changeNickname}
                        disabled={!selectedFile && !(nicknameChanged && nicknameAvailable)}
                        sx={{
                            backgroundColor: '#3f51b5',
                            color: 'white',
                            p: 1,
                            borderRadius: '5px',
                            '&:hover': {
                                backgroundColor: '#303f9f',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: '#bcbcbc',
                                color: '#e0e0e0',
                            }
                        }}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}


export default SettingsPage;

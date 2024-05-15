import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Grid, Container, TextField, MenuItem, FormGroup, useTheme, useMediaQuery
} from '@mui/material';
import Header from '../components/Header.js';
import Sidebar from '../components/Sidebar.js';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

const CreateGroupPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    // 그룹 정보 상태 관리
    const [groupName, setGroupName] = useState('');
    const [groupCategory, setGroupCategory] = useState('sports');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupRules, setGroupRules] = useState([]);

    // 규칙 추가 함수
    const handleAddRule = () => {
        setGroupRules([...groupRules, '']); // 현재 규칙 목록에 빈 문자열을 추가하여 새 규칙을 추가
    };

    // 규칙 제거 함수
    const handleRemoveRule = (index) => {
        const newRules = [...groupRules];
        newRules.splice(index, 1); // 특정 인덱스의 규칙을 제거
        setGroupRules(newRules);
    };

    // 그룹 생성 요청을 보내는 함수
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 기본 동작 막기
        try {
            const response = await fetch('/api/group', {
                method: 'POST',
                credentials: 'include', // 쿠키/세션 정보 포함
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName,
                    category: groupCategory,
                    description: groupDescription,
                    rules: groupRules.filter(rule => rule.trim() !== ''), // 빈 문자열 제외
                }),
            });
            const data = await response.json();
            console.log(data);
            alert('Group created successfully.');
        } catch (error) {
            console.error(error);
            alert('Failed to create the group.');
        }
    };

    return (
        <Container maxWidth="md" sx={{
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
        }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', margin: 1, marginTop: 3, color: '#3f51b5' }}>
                    Create a New Group
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Fill out the form to get started.
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <CustomTextField id="group-name" label="GroupName" placeholder="Enter group name" onChange={(e) => setGroupName(e.target.value)} />
                            <CustomTextField id="group-category" label="GroupCategory" select defaultValue="sports" onChange={(e) => setGroupCategory(e.target.value)}>
                            </CustomTextField>
                            <CustomTextField id="group-description" label="GroupDescription" placeholder="Enter group description" multiline rows={3} onChange={(e) => setGroupDescription(e.target.value)} />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box elevation={3} sx={{ p: !isMobile && 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'white', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                * Group Rules
                            </Typography>
                            {groupRules.map((rule, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <CustomTextField
                                        id={`group-rule${index}`}
                                        label={`Rule${index + 1}`}
                                        placeholder={`Enter rule ${index + 1}`}
                                        value={rule}
                                        onChange={(e) => {
                                            const newRules = [...groupRules];
                                            newRules[index] = e.target.value;
                                            setGroupRules(newRules);
                                        }}
                                    />
                                    <Button onClick={() => handleRemoveRule(index)}><CloseIcon/></Button>
                                </Box>
                            ))}
                            <Button onClick={handleAddRule}><AddCircleOutlineIcon/></Button>
                        </Box>
                    </Grid>
                </Grid>
                <Button variant="contained" type="submit" fullWidth sx={{
                    my: 3, py: 1.5, fontSize: '1.1rem',
                    bgcolor: '#3f51b5'
                }}>
                    Create Group
                </Button>
            </form>
        </Container>
    );
};

const CustomTextField = ({ id, label, placeholder, select, multiline, rows, defaultValue, onChange }) => {
    return (
        <TextField
            fullWidth
            id={id}
            label={label}
            placeholder={placeholder}
            required
            variant="outlined"
            select={select}
            multiline={multiline}
            minRows={rows}
            defaultValue={defaultValue}
            onChange={onChange}
            sx={{ bgcolor: 'white', borderRadius: 1 }}
        >
            {select ? [
                <MenuItem key="sports" value="sports">sports</MenuItem>,
                <MenuItem key="gaming" value="gaming">gaming</MenuItem>,
                <MenuItem key="photography" value="photography">photography</MenuItem>,
                <MenuItem key="music" value="music">music</MenuItem>,
                <MenuItem key="baking" value="baking">baking</MenuItem>,
            ] : null}
        </TextField>
    );
};


export default CreateGroupPage;

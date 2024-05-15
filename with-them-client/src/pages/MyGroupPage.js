import React, { useState, useEffect, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import Header from '../components/Header.js';
import Sidebar from '../components/Sidebar.js';
import ModalWindow from '../components/ModalWindow.js';

import {
    Box, Button, Card, CardContent, Typography, Grid, InputBase, useTheme, useMediaQuery
} from '@mui/material';

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CookieIcon from '@mui/icons-material/Cookie';
import BookIcon from '@mui/icons-material/Book';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SearchIcon from '@mui/icons-material/Search';


const MyGroupPage = () => {
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);
    const handleOpen = (grpSeq) => {
        setSelectedGroupSeq(grpSeq);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const [showGroups, setshowGroups] = useState([]);
    const [selectedGroupSeq, setSelectedGroupSeq] = useState(null);

    const modalProps = {
        title: 'Quit Group',
        content: 'Are you sure you want to quit?',
        buttonText: 'QUIT',
        handleClose: handleClose,
        onConfirm: async () => {
            await onQuit();
            navigate("/discover");
        },
    };

    const onQuit = async () => {
        try {
            const response = await fetch('/api/quitGroup', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedGroupSeq: selectedGroupSeq,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                alert('그룹에서 탈퇴했습니다.');
                handleClose();
                return true;
            }
        } catch (error) {
            console.error(error);
            alert('그룹 탈퇴에 실패했습니다.');
            return false;
        }
    };


    useEffect(() => {
        fetch('http://localhost:8080/api/showMyGroup', {
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json())
            .then(data => {
                // 각 그룹에 멤버 수 추가
                const groupsWithMemberCount = data.groups.map(group => {
                    const memberCount = data.members.filter(member => member.GRP_SEQ === group.GRP_SEQ).length;
                    return { ...group, memberCount };
                });
                setshowGroups(groupsWithMemberCount);
                console.log(data)
            })
            .catch(error => console.error("데이터를 가져오는데 실패했습니다.", error));
    }, []);

    return (
        <>
            <Box sx={{ display: 'flex', height: '100vh' }}>

                <Sidebar />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Header />
                    <MainContent handleOpen={handleOpen} showGroups={showGroups} />
                </Box>
                {
                    open == true ? <ModalWindow {...modalProps} selectedGroupSeq={selectedGroupSeq} /> : null
                }

            </Box>
        </>
    );
};


const MainContent = ({ handleOpen, showGroups }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = useMemo(() => {
        return showGroups.filter(group => 
            group.GRP_NM.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [showGroups, searchTerm]);

    return (
        <Box sx={{
            flexGrow: 1,
            p: 4,
            gap: 4,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0,
            }}>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bolder', textAlign: isMobile ? 'center' : 'inherit' }}>
                    My Groups
                </Typography>
                <Box sx={{
                    position: 'relative',
                    marginLeft: isMobile ? '0' : '16px',
                    width: isMobile ? '100%' : 'auto',
                }}>
                    <SearchIcon sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }} />
                    <InputBase
                        placeholder="Search groups..."
                        inputProps={{ 'aria-label': 'search' }}
                        onChange={e => setSearchTerm(e.target.value)}
                        sx={{ paddingLeft: '32px', width: '100%' }}
                    />
                </Box>
            </Box>
            <Grid container spacing={4}>
                {filteredGroups.map(group => (
                    <GroupCard
                        key={group.GRP_SEQ}
                        seq={group.GRP_SEQ}
                        type={group.CAT_TYPE}
                        title={group.GRP_NM}
                        description={group.GRP_CONT}
                        memberCount={group.memberCount.toString()}
                        handleOpen={handleOpen}
                    />
                ))}
            </Grid>
        </Box>
    )
}

const iconMapping = {
    sports: <FitnessCenterIcon />,
    baking: <CookieIcon />,
    music: <AudiotrackIcon />,
    photography: <BookIcon />,
};

const GroupCard = ({ seq, type, title, description, memberCount, handleOpen }) => {
    const navigate = useNavigate();

    return (
        <Grid item xs={12} sm={6} lg={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', border: '0.5px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 3 }}>
                    {iconMapping[type]}
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                        {description}
                    </Typography>
                </Box>
                <CardContent sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {memberCount} members
                        </Typography>
                    </Box>
                    <Button variant="outlined" size="small" color="error" onClick={() => { handleOpen(seq) }}>
                        Quit
                    </Button>
                    <Button variant="outlined" size="small" color="success" onClick={() => { navigate("/groupIn", { state: { selectedGroupSeq: seq } }); }}>
                        Enter
                    </Button>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default MyGroupPage;

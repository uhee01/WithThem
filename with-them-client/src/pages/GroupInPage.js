import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header.js';

import {
    Avatar, Button, Card, CardActions, CardContent, CardHeader, Grid, IconButton, Typography, Box, TextField,
} from '@mui/material';

import ModalWindow from '../components/ModalWindow.js';
import timeSince from '../functions/timeSince.js';


import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatIcon from '@mui/icons-material/Chat';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import { blueGrey } from '@mui/material/colors';



const GroupInPage = () => {
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'));
    const [modalProps, setModalProps] = React.useState({
        title: `${selectedDate}`,
        content: "Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.",
        buttonText: "확인",
        handleClose: () => setOpen(false),
        onConfirm: () => setOpen(false),
    });

    const handleOpen = (selectedDate) => {
        fetch(`http://localhost:8080/api/data?date=${selectedDate}&groupSeq=${selectedGroupSeq}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data && data.length > 0) {
                    setModalProps(prevProps => ({
                        ...prevProps,
                        title: `${selectedDate}`, 
                        content: (
                            <div>
                                {data.map((item) => (
                                    <div key={item.CAL_SEQ} style={{ marginBottom: '20px' }}>
                                        <p>회원 : {item.MBR_NICK}</p>
                                        <img src={item.CAL_POST_IMG} alt="게시물 이미지" style={{ maxWidth: '100%' }} />
                                    </div>
                                ))}
                            </div>
                        ),
                    }));
                } else {
                    setModalProps(prevProps => ({
                        ...prevProps,
                        title: `${selectedDate}`,
                        content: "해당 날짜에 대한 데이터가 없습니다.",
                    }));
                }
                setOpen(true);
            })
            .catch(error => {
                console.error('데이터를 가져오는 중 에러 발생: ', error);
                setModalProps(prevProps => ({
                    ...prevProps,
                    title: `${selectedDate}`, 
                    content: "데이터를 검색하지 못했습니다.",
                }));
                setOpen(true);
            });
    };


    const location = useLocation();
    const { selectedGroupSeq } = location.state || {};


    return (
        <>
            <Header />
            <Grid container spacing={2} sx={{ marginTop: 1, padding: 2, minHeight: '300px', background: '#eeeeee' }}>
                <Grid item xs={12} md={3.5} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <CommunityMembers selectedGroupSeq={selectedGroupSeq} />
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <CustomCalendar handleOpen={handleOpen} selectedGroupSeq={selectedGroupSeq} setSelectedDate={setSelectedDate} />
                </Grid>
                <Grid item xs={12} md={4.5} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <BulletinBoard selectedGroupSeq={selectedGroupSeq} />
                </Grid>
            </Grid>
            <Grid sx={{ padding: 2, background: '#eeeeee' }}>
                <WeeklyMissionsCard selectedGroupSeq={selectedGroupSeq} />
            </Grid>
            {
                open == true ? <ModalWindow {...modalProps} /> : null
            }
        </>
    );
};

const CommunityMembers = ({ selectedGroupSeq }) => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/members?groupSeq=${selectedGroupSeq}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMembers(data.members);
            } catch (error) {
                console.error("Fetching members failed:", error);
            }
        };
        fetchMembers();
    }, [selectedGroupSeq]);

    return (
        <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '500px', border: '0.5px solid #e0e0e0', overflow: 'auto' }}>
            <CardHeader
                avatar={<PeopleIcon fontSize="large" />}
                title="Members"
                subheader="View community members"
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ overflow: 'auto', flexGrow: 1 }}>
                <Grid container spacing={2}>
                    {members.map((member) => (
                        <Grid key={member.GRP_MBR_SEQ} item xs={12} display="flex" alignItems="center">
                            <Avatar alt={`@${member.MBR_ID}`} src={member.MBR_PFP} style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: blueGrey[500] }} />
                            <Box sx={{ ml: 2 }}>
                                <Typography variant="body1" component="div">
                                    {member.MBR_NICK}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    @{member.MBR_ID}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}

const CustomCalendar = ({ handleOpen, selectedGroupSeq, setSelectedDate }) => {
    const [value, setValue] = React.useState(dayjs());
    const [selectedFile, setSelectedFile] = React.useState(null); 

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('selectedGroupSeq', selectedGroupSeq);
        formData.append('date', dayjs().format('YYYY-MM-DD'));


        try {
            const response = await fetch('http://localhost:8080/api/upload/file', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                alert('파일 업로드 성공');
            } else {
                alert('파일 업로드 실패');
            }
        } catch (error) {
            alert('파일 업로드 중 오류가 발생했습니다.');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            handleFileUpload(file);
        }
    };
    return (
        <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '500px', border: '0.5px solid #e0e0e0', overflow: 'auto' }}>
            <CardHeader
                avatar={
                    <CalendarMonthIcon fontSize="large" />
                }
                title="Calendar"
                subheader="Click on the date and see the photos"
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
                action={
                    <IconButton
                        color="primary"
                        component="label"
                    >
                        <AddCircleOutlineIcon />
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </IconButton>
                }
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    openTo="day"
                    value={value}
                    onChange={(newValue) => {
                        setValue(newValue);
                        const formattedDate = newValue.format('YYYY-MM-DD');
                        setSelectedDate(formattedDate);
                        handleOpen(formattedDate);
                    }}
                />
            </LocalizationProvider>
        </Card>
    );
}


function BulletinBoard({ selectedGroupSeq }) {
    const [board, setboard] = useState([]);
    const [postContent, setPostContent] = useState('');

    const fetchBoard = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/board?groupSeq=${selectedGroupSeq}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setboard(data.board);
            console.log(data.board);
        } catch (error) {
            console.error("Fetching board failed:", error);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [selectedGroupSeq]);

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/board/post', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    groupSeq: selectedGroupSeq,
                    postContent: postContent,
                }),
            });
            console.log(postContent);
            if (!response.ok) throw new Error('Network response was not ok');
            alert('게시글이 성공적으로 등록되었습니다.');
            setPostContent('');
            fetchBoard();
        } catch (error) {
            console.error('Posting failed:', error);
        }
    };

    return (
        <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '500px', border: '0.5px solid #e0e0e0', overflow: 'auto' }}>
            <CardHeader
                avatar={
                    <ChatIcon fontSize="large" />
                }
                title="Board"
                subheader="Share your story with people"
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent sx={{ overflow: 'auto', flexGrow: 1 }}>
                {board.map((item) => (
                    <Box key={item.BOARD_SEQ} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar alt={`@${item.MBR_ID}`} src={item.MBR_PFP} sx={{ width: 40, height: 40, bgcolor: blueGrey[500] }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Posted by @{item.MBR_ID} · {timeSince(item.BOARD_DATE)}
                            </Typography>
                            <Typography variant="body1">
                                {item.BOARD_CONT}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </CardContent>
            <CardActions disableSpacing>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    variant="outlined"
                    placeholder="Share your latest discovery with the community..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                />
                <Button variant="contained" onClick={handleSubmit}>Post</Button>
            </CardActions>
        </Card>
    );
}


const WeeklyMissionsCard = ({ selectedGroupSeq }) => {
    const [missions, setMissions] = useState([]);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/missions?groupSeq=${selectedGroupSeq}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMissions(data.missions || []);
            } catch (error) {
                console.error("Fetching missions failed:", error);
            }
        };
        fetchMissions();
    }, [selectedGroupSeq]);

    return (
        <Card sx={{ p: 2, border: '0.5px solid #e0e0e0' }} >
            <CardHeader
                avatar={
                    <FormatListBulletedIcon fontSize="large" />
                }
                title="Weekly Missions"
                subheader="Check out the mission"
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
            />
            <CardContent>
                <Grid container spacing={2}>
                    {missions.map((mission) => (
                        <Grid item xs={12} container alignItems="center" spacing={2} key={mission.MSN_SEQ}>
                            <Grid item>
                                <CardGiftcardIcon />
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" component="p">
                                    {mission.MSN_TITLE}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {mission.MSN_CONT}
                                </Typography>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}


export default GroupInPage;

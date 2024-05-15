import React, { useState } from 'react'; 
import { Box, Button, Card, CardContent, Typography, TextField, useMediaQuery, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import Header from '../components/Header.js';
import Sidebar from '../components/Sidebar.js';

const ReviewPage = () => {
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

    const [review, setReview] = useState(''); 

     const handleInputChange = (event) => {
        setReview(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/submitReview', {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    review: review, 
                }),
            });
            const data = await response.json();
            console.log(data);
            alert('Review submitted successfully.');
        } catch (error) {
            console.error(error);
            alert('Failed to submit the review.');
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: isMobile ? '20px' : '60px', 
                }}
            >
                <Card sx={{ maxWidth: isMobile ? '100%' : '600px', width: '100%' }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 'bold', color: 'text.primary' }}>
                            Leave a Review
                        </Typography>
                        <Typography variant= {isMobile ? "subtitle2" : "subtitle1" } sx={{ mb: 3, color: 'text.secondary' }}>
                            Your post will be posted on the start page.
                        </Typography>
                        <form noValidate autoComplete="off" sx={{ '& .MuiTextField-root': { mb: 2 } }} onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                id="review"
                                value={review} 
                                onChange={handleInputChange}
                                label="Your Review"
                                multiline
                                rows={5}
                                placeholder="Share your thoughts..."
                                variant="outlined"
                                sx={{
                                    bgcolor: 'background.paper',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'grey.300',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'text.primary',
                                    },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    endIcon={<SendIcon />}
                                    sx={{
                                        mt: 5,
                                        mb: 3,
                                        py: 2,
                                        width: isMobile ? '80%' : '40%', 
                                        bgcolor: '#311b92',
                                        ':hover': {
                                            bgcolor: '#221266',
                                        },
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                    }}>
                                    Submit Review
                                </Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
};

export default ReviewPage;

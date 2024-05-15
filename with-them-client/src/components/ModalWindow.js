import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ModalWindow = ({ handleClose, title, content, title2, rules, buttonText, onConfirm, selectedGroupSeq }) => {
    const [showModal, setShowModal] = useState([]);

    useEffect(() => {
        if (buttonText == 'Join') {
            fetch(`http://localhost:8080/api/showModalWindow/${selectedGroupSeq}`)
                .then(response => response.json())
                .then(data => {
                    setShowModal(data);
                })
                .catch(error => console.error("데이터를 가져오는데 실패했습니다.", error));
        }
    }, [selectedGroupSeq]);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                maxHeight: '90vh', // 모달창의 최대 높이 설정
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
                overflow: 'auto', // 내용이 많아지면 스크롤 생성
            }}
        >
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: 'text.primary',
                }}>
                <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bolder' }}>
                {title}
            </Typography>
            <Typography component="div" sx={{ mt: 1, fontSize: '14px' }}>
                {!content ? (
                    showModal.groups && showModal.groups.map((group, index) => (
                        <div key={index}> {group.GRP_CONT}</div>
                    ))
                ) : (
                    <div>{content}</div>
                )}
            </Typography>
            {
                title2 && (
                    <Typography variant="h6" component="div" sx={{ mt: 4, mb: 2, fontWeight: 'bolder' }}>{title2}</Typography>
                )
            }
            <Typography component="div" sx={{ mt: 1, fontSize: '14px' }}>
                {!rules ? (
                    showModal.rules && showModal.rules.map((rule, index) => (
                        <div key={index}>{index + 1}. {rule.GRP_RULE_CONT}</div>
                    ))
                ) : (
                    <div>{rules}</div>
                )}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Button variant="contained" size="small" color="error" onClick={onConfirm ? onConfirm : handleClose}>
                    {buttonText}
                </Button>
            </Box>
        </Box>

    );
};

export default ModalWindow;
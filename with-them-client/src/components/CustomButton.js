import React from 'react';
import { Button } from '@mui/material';

const CustomButton = ({ onClick, text, variant, color, bgcolor, borderColor }) => {
  return (
    <Button
      onClick={onClick}
      variant={variant || "outlined"}
      sx={{
        borderRadius: '6px',
        m: '8px',
        p: '6px 12px',
        fontSize: '13px',
        fontWeight: '400',
        border: borderColor ? `0.5px solid ${borderColor}` : '0.5px solid rgb(200, 200, 200)',
        color: color || 'black',
        bgcolor: bgcolor || 'transparent',
        ':hover': {
          bgcolor: bgcolor ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.02)', 
          borderColor: 'gray',
          transform: 'scale(1.05)', 
        },
        ':active': {
          transform: 'scale(0.95)', 
        }
      }}
    >
      {text}
    </Button>
  );
};

export default CustomButton;

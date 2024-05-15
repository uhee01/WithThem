import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Box, List, ListItem, ListItemIcon, Divider, Typography, useMediaQuery, useTheme
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import SettingsIcon from '@mui/icons-material/Settings';
import Diversity1Icon from '@mui/icons-material/Diversity1';
import BorderColorIcon from '@mui/icons-material/BorderColor';

const Sidebar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ width: isMobile ? 150 : 250, bgcolor: '#eee', minHeight: '100vh' }}>
            <Box sx={{
                padding: isMobile ? 2 : 3, display: 'flex', bgcolor: '#009688', borderBottom: '0.3px solid #e0e0e0',
                gap: 3, alignItems: 'center', color: 'white'
            }}>
                <GroupsIcon />
                <Typography sx={{ fontSize: isMobile ? "12px" : "18px"}}>Groups</Typography>
            </Box>
            <Divider />
            <List>
                <SidebarMenuItem to="/discover" icon={<HomeIcon />} label="Discover" isMobile={isMobile} />
                <SidebarMenuItem to="/createGroup" icon={<GroupAddIcon />} label="Create Group" isMobile={isMobile} />
                <SidebarMenuItem to="/myGroup" icon={<Diversity1Icon />} label="My Group" isMobile={isMobile} />
                <SidebarMenuItem to="/review" icon={<BorderColorIcon />} label="Review" isMobile={isMobile} />
                <SidebarMenuItem to="/settings" icon={<SettingsIcon />} label="Settings" isMobile={isMobile} />
            </List>
        </Box>
    );
};

const SidebarMenuItem = ({ to, icon, label, isMobile }) => {
    return (
        <ListItem button component={NavLink} to={to} sx={{
            padding: isMobile ? 1 : 2,
            paddingLeft: isMobile ? 1 : 3,
            color: '#9e9e9e',
            '&.active': {
                color: 'black',
                backgroundColor: '#f5f5f5',
                boxShadow: 'inset 5px 0px 0px 0px #ff1744'
            },
        }}>
            <ListItemIcon>{icon}</ListItemIcon>
            <Typography sx={{ fontSize : isMobile ? "10px" : "15px"}}>{label}</Typography>
        </ListItem>
    );
};

export default Sidebar;

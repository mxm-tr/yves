'use client'
import Link from 'next/link';
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CalendarIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import MoodIcon from '@mui/icons-material/Mood';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import { Typography, Divider, IconButton } from '@mui/material';
import UserCard from './userCard';
import { useSession } from 'next-auth/react';

export default function Sidebar() {

    const session = useSession();

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setDrawerOpen(open);
    };

    const drawerContent = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <ListItem disablePadding>
                <UserCard session={session} />
            </ListItem>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/">
                        <ListItemIcon><HomeIcon /></ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/planning">
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Planning" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/book">
                        <ListItemIcon><MoodIcon /></ListItemIcon>
                        <ListItemText primary="Book" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/meetings-with-me">
                        <ListItemIcon><EditIcon /></ListItemIcon>
                        <ListItemText primary="Manage my slots" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<MenuIcon />}
                    onClick={toggleDrawer(true)}
                    sx={{ display: { xs: 'flex' } }}
                >
                    Menu
                </Button>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: 250,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>
        </React.Fragment>
    );
}

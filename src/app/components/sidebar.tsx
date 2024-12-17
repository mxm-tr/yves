'use client'
import Link from 'next/link';
import { useState, useEffect, Fragment, KeyboardEvent, MouseEvent } from 'react';
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
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Dialog, DialogContent, Divider, Modal } from '@mui/material';
import UserCard from './userCard';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import QRCode from './qrCodeGenerator';

export default function Sidebar() {

    const session = useSession();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const toggleDrawer = (open: boolean) => (event: KeyboardEvent | MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as KeyboardEvent).key === 'Tab' ||
                (event as KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setDrawerOpen(open);
    };

    const handleOpenQrModal = () => setQrModalOpen(true);
    const handleCloseQrModal = () => setQrModalOpen(false);

    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(
                    '/api/v1/me'
                );
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
                {(user ?
                <ListItem disablePadding>
                    {/* New Button to Open QR Code Modal */}
                    <ListItemButton onClick={handleOpenQrModal}>
                        <ListItemIcon><QrCodeIcon /></ListItemIcon>
                        <ListItemText primary="My QR code" />
                    </ListItemButton>
                </ListItem>
                :<div/>)}
            </List>
        </Box>
    );

    return (
        <Fragment>
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
                {/* Modal for QR Code Generator */}
                {(user ?
                    <Dialog
                        open={qrModalOpen}
                        onClose={handleCloseQrModal}
                        aria-labelledby="qr-modal-title"
                        aria-describedby="qr-modal-description"
                    >
                        <DialogContent>
                            <QRCode userID={user.id} />
                        </DialogContent>
                    </Dialog>
                    : <div/>)}
            </Box>
        </Fragment>
    );
}

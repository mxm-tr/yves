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
import HomeIcon from '@mui/icons-material/Home';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function Sidebar() {
    const [drawerOpen, setdrawerOpen] = React.useState(false);

    const toggleDrawer =
        () =>
            (event: React.KeyboardEvent | React.MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Tab' ||
                        (event as React.KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setdrawerOpen(!drawerOpen);
            };

    const list =
        <Box
            role="presentation"
            onClick={toggleDrawer()}
            onKeyDown={toggleDrawer()}
        >
            <List>
                <ListItem key="home" disablePadding>
                    <ListItemIcon><HomeIcon /></ListItemIcon>
                    <Link href="/">
                        <ListItemButton>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </Link>
                </ListItem>
                <ListItem key="schedule" disablePadding>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>

                    <Link href="/schedule">
                        <ListItemButton>
                            <ListItemText primary="Schedule" />
                        </ListItemButton>
                    </Link>
                </ListItem>
            </List>
        </Box>

    return (
        <div>

            <React.Fragment>
                <Button onClick={toggleDrawer()}>Menu</Button>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer()}
                >
                    {list}
                </Drawer>
            </React.Fragment>

        </div>
    );
}

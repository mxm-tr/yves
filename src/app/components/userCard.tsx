'use client'
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Container, Card, CardContent, Typography, IconButton, Popover, List, ListItem, ListItemText, Link, Button } from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import { User } from '@prisma/client';
import { SignOutButton } from './signIn';
import { PingWithSender } from '../lib/models';

// CSS for bell shake and blink animation
const bellAnimation = `
@keyframes shake {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-15deg); }
    50% { transform: rotate(15deg); }
    75% { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
}
@keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
.bell-animation {
    animation: shake 0.5s ease-in-out infinite, blink 1s ease-in-out infinite;
}
`;

export default function UserCard(session: any): React.JSX.Element {
    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);
    const [latestPings, setLatestPings] = useState<Array<PingWithSender>>([]); // Store the latest pings
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For the popover

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/v1/me');
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
        fetchLatestPing();
    }, []);

    // Fetch the latest ping
    const fetchLatestPing = async () => {
        try {
            const response = await fetch('/api/v1/ping');
            if (response.ok) {
                const pings = await response.json();
                setLatestPings(pings); // Set the latest pings
            } else {
                console.error('Failed to fetch pings');
            }
        } catch (error) {
            console.error('Error fetching pings:', error);
        }
    };

    // Handle bell button click
    const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // Close the popover
    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    // Handle acknowledge button click
    const handleAckClick = async (pingId: string) => {
        try {
            const response = await fetch(`/api/v1/ping/ack/${pingId}`, {
                method: 'POST',
            });
            if (response.ok) {
                // Refetch pings after acknowledging
                await fetchLatestPing();
            } else {
                console.error('Failed to acknowledge ping');
            }
        } catch (error) {
            console.error('Error acknowledging ping:', error);
        }
    };

    const open = Boolean(anchorEl);

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm">
            {/* Add CSS for bell animation */}
            <style>{bellAnimation}</style>

            {/* Display user card if user data is available */}
            {!isLoading && user && (
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" component="h2">
                                {user.name}
                            </Typography>
                            {/* Bell button to show latest ping */}
                            <IconButton onClick={handleBellClick}>
                                {latestPings.length > 0 ? (
                                    <NotificationsIcon className="bell-animation" />
                                ) : (
                                    <NotificationsNoneIcon />
                                )}
                            </IconButton>
                        </Box>
                        <Typography color="textSecondary">
                            💰 {user.coins} coins 🪙
                        </Typography>
                        <SignOutButton />
                    </CardContent>
                </Card>
            )}

            {/* Popover to display the latest ping */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <List>
                    {latestPings.length > 0 ? (
                        latestPings.map((ping) => (
                            <ListItem key={ping.id}>
                                <ListItemText
                                    primary={`${ping.sender.name} wants to book with you!`}
                                    secondary={`Sent on: ${new Date(ping.createdAt).toLocaleDateString()}`}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={() => handleAckClick(ping.id)}
                                >
                                    <CheckIcon />
                                </IconButton>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No new pings" />
                        </ListItem>
                    )}
                    <ListItem>
                        <Typography>
                            <Link href="/meetings-with-me">Open new schedules</Link>
                        </Typography>
                    </ListItem>
                </List>
            </Popover>
        </Container>
    );
}
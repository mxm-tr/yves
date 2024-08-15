'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Container, Card, CardContent, Typography } from '@mui/material';

import { User } from '@prisma/client';
import { SignOutButton } from './signIn';
import { SessionContextValue } from "next-auth/react"

export default function UserCard(session: any): React.JSX.Element {
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

    if (isLoading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm">
            {/* Display user card if user data is available */}
            {!isLoading && (
                (
                    user && (
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2">
                                    {user.name}
                                </Typography>
                                <Typography color="textSecondary">
                                    💰 {user.coins} coins 🪙
                                </Typography>
                                <SignOutButton />
                            </CardContent>
                        </Card>
                    )
                )
                ||
                (isLoading && user && (
                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                Loading...
                            </Typography>
                            <Typography color="textSecondary">
                                💰 -- coins 🪙
                            </Typography>
                        </CardContent>

                    </Card>
                )))
                /* Display nothing if user data is not available */
            }
        </Container>
    );
}
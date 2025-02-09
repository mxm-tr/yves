'use client'

import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContentText, DialogContent,
    DialogTitle, Typography, List, ListItem, Divider,
    TextField,
    Grid
} from '@mui/material';

import { useParams } from 'next/navigation'

import Sidebar from '../../components/sidebar';

import { Meeting, User } from 'prisma/prisma-client'
import { useSession } from "next-auth/react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {

    const params = useParams<{ userId: string; }>()

    const router = useRouter();

    const emptyMeetings: Map<string, Meeting[]> = new Map();
    const [availableMeetings, setAvailableMeetings] = useState(emptyMeetings)

    const [relatedUsers, setRelatedUsers] = useState<User[]>()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [scheduleOwner, setMeetingOwner] = useState<User>();

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch user details
                const userResponse = await fetch(`/api/v1/users/${params.userId}`);
                if (!userResponse.ok) {
                    if (userResponse.status === 404) {
                        setError('User not found.');
                    } else {
                        setError('Error fetching user data. Please try again later.');
                    }
                    return; // Exit on failure
                }

                const user = await userResponse.json();
                setMeetingOwner(user);

                // Fetch schedule details
                const scheduleResponse = await fetch(`/api/v1/schedules/${params.userId}`);
                if (!scheduleResponse.ok) {
                    setError('Error fetching schedule data. Please try again later.');
                    return; // Exit on failure
                }

                const scheduleData = await scheduleResponse.json();
                setAvailableMeetings(new Map(Object.entries(scheduleData)));
            } catch (error) {
                setError('An unexpected error occurred. Please try again later.');
            } finally {
                setIsLoading(false); // Ensure loading state is cleared
            }
        };

        fetchData();
    }, [params.userId]);

    // State to track selected day and time
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedMeetingId, setSelectedMeetingId] = useState(""); // State to store the selected scheduleId

    const handleSelectUser = (user: User) => {
        setMeetingOwner(user);
    };

    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        setSelectedTime(""); // Reset selected time when a new day is selected
    };

    const handleTimeSelect = (time: string, scheduleId: string) => {
        setSelectedTime(time);
        setSelectedMeetingId(scheduleId);
    };

    // State for the success modal
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    const handleSuccessModalClose = () => {
        // Close the success modal
        setSuccessModalOpen(false);
        // Redirect to the home page
        router.push('/planning');
    };


    const handleMeetingMeeting = async () => {
        try {
            // Show loading state
            setIsLoading(true);

            // Send a POST request to the backend API
            const response = await fetch(`/api/v1/meetings/schedule/${selectedMeetingId}`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isDeleted to true to hide the card
                setIsLoading(true);

                // Show success alert
                setSuccessModalOpen(true);

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error scheduling meeting. Status:', response.status);
                setError('Error scheduling meeting: ' + await response.text());
            }
        } catch (error) {
            console.error('Error scheduling meeting', error);
            setError('Error scheduling meeting. Please try again later.');
        } finally {
            // Hide loading state
            setIsLoading(false);
        }
    }

    const session = useSession()

    // State to hold the search query
    const [searchQuery, setSearchQuery] = useState("");

    // Function to filter users based on search query
    const filteredUsers = () => {
        return relatedUsers && relatedUsers.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
    }

    // Function to handle search query change
    const handleSearchChange = (event: any) => {
        console.log(event.target.value);
        setSearchQuery(event.target.value);
    };

    return (
        <Box>
            <Grid
                container
                direction="row"
            >
                <Grid item xs>
                    <Sidebar />
                </Grid>

            </Grid>

            <Grid container
                justifyContent="center"
                alignItems="flex"
                rowSpacing={3}
                columnSpacing={2}
                xs={12}>

                <Grid item xs={12} textAlign="center">
                    {/* Loading Spinner */}
                    {isLoading && <CircularProgress />}
                </Grid>

                {/* List of acquaintances */}
                <Grid item xs={12} textAlign="center">
                    {!scheduleOwner &&
                        <Box>
                            {!isLoading && relatedUsers && relatedUsers.length > 0 ?
                                <Box>
                                    <Typography variant="h2">Who do you want to meet?</Typography>
                                    {filteredUsers() && filteredUsers().length > 0 ? (
                                        <List>
                                            {filteredUsers().map((relatedUser) => (
                                                <ListItem key={relatedUser.id}>
                                                    <Button onClick={() => handleSelectUser(relatedUser)}>
                                                        {relatedUser.name}
                                                    </Button>
                                                    <Divider />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="h6">No user found, fix your search filter!</Typography>
                                    )}
                                    <Box>
                                        <Box marginBottom={2}>
                                            <TextField
                                                label="Search for people"
                                                variant="outlined"
                                                fullWidth
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                : (
                                    session.status === 'authenticated' ?
                                        <Typography variant="h6">Oh no you don&apos;t know anyone yet!</Typography>
                                        :
                                        <Typography variant="h6">Sign in to book a meeting!</Typography>
                                )
                            }
                        </Box>
                    }


                    {/* Available Meetings */}
                    {scheduleOwner ?
                        <Grid container xs={12} textAlign="center" rowSpacing={2}>
                            <Grid item xs={12} textAlign="center">
                                <Typography variant="h3">When do you want to meet&nbsp;&nbsp;
                                    <b><Chip label={scheduleOwner.name} onDelete={() => router.push("/book")} /></b>
                                    &nbsp;&nbsp;?
                                </Typography>
                            </Grid>
                            {!isLoading && Array.from(availableMeetings).length > 0 ?
                                <Grid container item xs={12}
                                    textAlign="center"
                                    justifyContent="center"
                                    alignItems="center"
                                    rowSpacing={3}
                                    columnSpacing={2}
                                >
                                    {Array.from(availableMeetings).map(([day, dates]) => (
                                        <Grid item xs={6} sm={4} key={day}>
                                            <Button
                                                onClick={() => handleDaySelect(day)}
                                                variant={selectedDay === day ? "contained" : "outlined"}
                                            >
                                                {new Date(day).toLocaleDateString(defaultLocale)}
                                            </Button>
                                            <Grid item xs={10} key={day}>
                                                <List>
                                                    {dates.map(date => (
                                                        <ListItem key={date.id}>
                                                            <Button
                                                                onClick={() => handleTimeSelect(date.date.toString(), date.id)}
                                                                disabled={selectedDay !== day} // Disable times for other days
                                                                variant={selectedTime === date.date.toString() ? "contained" : "outlined"}
                                                            >
                                                                {new Date(date.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                                                            </Button>
                                                            <Chip
                                                                label={`Cost: ${date.cost}`}
                                                                color="primary"
                                                                size="small"
                                                                style={{ marginLeft: '0.5rem' }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                                : <Typography variant="h6">No more schedule available for {scheduleOwner.name}</Typography>}
                        </Grid>
                        : ""}

                    {/* Button to Meeting Meeting */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleMeetingMeeting}
                        disabled={!selectedDay || !selectedTime}
                        aria-disabled={isLoading}
                    >
                        Schedule Meeting
                    </Button>
                </Grid>

                <Dialog open={successModalOpen} onClose={handleSuccessModalClose}>
                    <DialogTitle>Meeting scheduled successfully!</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Your meeting with {scheduleOwner?.name} has been scheduled successfully.
                            <br />
                            Now wait for the confirmation!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSuccessModalClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Error Modal */}
                <Dialog open={error.length > 0} onClose={() => setError("")}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {error}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setError("")} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
            {/* Error Modal */}
            {error && (
                <Dialog open={Boolean(error)} onClose={() => { setError(""); router.push('/book'); }}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <Typography color="error">{error}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setError(""); router.push('/book'); }} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}

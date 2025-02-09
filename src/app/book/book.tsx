'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from '../components/sidebar';

import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContentText, DialogContent,
    DialogTitle, Typography, List, ListItem, Divider,
    TextField,
    Grid
} from '@mui/material';

import { Meeting, User } from 'prisma/prisma-client'
import { useSession } from "next-auth/react"

export default function MeetingForm() {
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
        setIsLoading(true);
        if (!scheduleOwner) {
            fetch('/api/v1/users')
                .then((res) => res.json())
                .then((data) => {
                    setRelatedUsers(data);
                })
        } else {
            fetch(`/api/v1/schedules/${scheduleOwner.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailableMeetings(new Map(Object.entries(data)));
                })
        }
        setIsLoading(false);

    }, [scheduleOwner])

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
        // Redirect to the planning page
        router.push('/planning');
    };

    // State for the success modal
    const [pingSuccessModalOpen, setPingSuccessModalOpen] = useState(false);

    const handlePingSuccessModalClose = () => {
        // Close the success modal
        setPingSuccessModalOpen(false);
        // Deselect the user
        setMeetingOwner(undefined)
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

    const handleSendPing = async () => {
        try {
            // Show loading state
            setIsLoading(true);

            // Send a POST request to the backend API
            const response = await fetch(`/api/v1/ping/${scheduleOwner?.id}`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isDeleted to true to hide the card
                setIsLoading(true);

                // Show success alert
                setPingSuccessModalOpen(true);

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Cannot send ping:', response.status);
                setError('Cannot send ping: ' + (await response.json()).message);
                // Deselect the user
                setMeetingOwner(undefined)
            }
        } catch (error) {
            console.error('Cannot send ping', error);
            setError('Cannot send ping.');
            // Deselect the user
            setMeetingOwner(undefined)
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
                                    <b><Chip label={scheduleOwner.name} onDelete={() => setMeetingOwner(undefined)} /></b>
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
                                            {/* Button to book a Meeting */}
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
                                    ))}
                                </Grid>
                                : (
                                    <Grid item xs={12}
                                        textAlign="center"
                                        justifyContent="center"
                                        alignItems="center">
                                        <Typography variant="h6">No more schedule available for {scheduleOwner.name}, let them know they are missing out!</Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSendPing}
                                            aria-disabled={isLoading}
                                        >
                                            Send a ping
                                        </Button>
                                    </Grid>
                                )
                            }
                        </Grid>
                        : ""}
                </Grid>
                <Dialog open={pingSuccessModalOpen} onClose={handlePingSuccessModalClose}>
                    <DialogTitle>Ping sent</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Your have let {scheduleOwner?.name} know that you were looking out to meet them.
                            <br />
                            You will be notified if they post new schedules!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePingSuccessModalClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
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
        </Box>
    );
}

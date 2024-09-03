'use client'

import React, { useState } from 'react';
import {
    Button, Card, CardContent, Fade, Grid, Typography, Dialog, DialogTitle, DialogContent,
    List, ListItem,
    DialogActions, CircularProgress
} from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { MeetingsWithMeetingConfirmationsAndGuests } from '../lib/models';

const MeetingOwnerCard: React.FC<{ meeting: MeetingsWithMeetingConfirmationsAndGuests, triggerReload: Function }> = ({ meeting, triggerReload }) => {

    const [confirmationConfirmationOpen, setConfirmConfirmationOpen] = useState(false);
    const [confirmationCancellationOpen, setConfirmCancellationOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const handleParentReload = () => {
        // Invoke the callback to trigger the reload in the parent
        triggerReload();
    };

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    async function handleConfirmMeeting(meetingConfirmationId: string) {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmConfirmationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/meetings/${meetingConfirmationId}/confirm`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isConfirmed to true to hide the card
                setIsConfirmed(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Trigger the reload of the parent component
                handleParentReload()

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error confirming meeting. Status:', response.status);
                setError('Error confirming meeting. Please try again later.');
            }
        } catch (error) {
            console.error('Error confirming meeting', error);
            setError('Error confirming meeting. Please try again later.');
        } finally {
            // Hide loading state
            setIsLoading(false);
        }
    };

    async function handleCancelMeeting(meetingConfirmationId: string) {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmCancellationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/meetings/${meetingConfirmationId}/cancel`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isConfirmed to true to hide the card
                setIsConfirmed(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Trigger the reload of the parent component
                handleParentReload()

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error cancelling meeting. Status:', response.status);
                setError('Error cancelling meeting. Please try again later.');
            }
        } catch (error) {
            console.error('Error cancelling meeting', error);
            setError('Error cancelling meeting. Please try again later.');
        } finally {
            // Hide loading state
            setIsLoading(false);
        }
    };

    const handleOpenConfirmConfirmation = () => {
        // Open the delete confirmation modal
        setConfirmConfirmationOpen(true);
    };

    const handleCloseConfirmConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmConfirmationOpen(false);
        // Clear any previous error
        setError('');
    };


    const handleOpenCancellationConfirmation = () => {
        // Open the delete confirmation modal
        setConfirmCancellationOpen(true);
    };

    const handleCloseCancellationConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmCancellationOpen(false);
        // Clear any previous error
        setError('');
    };

    return (
        <>
            <Card key={meeting.id} style={{ marginBottom: 16 }}>
                <CardContent>
                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item>
                            <Typography variant="h6">
                                📅 Date: {new Date(meeting.date).toLocaleDateString(defaultLocale)}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                ⌚ Time: {new Date(meeting.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                💰 Cost: {meeting.cost} 🪙
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                🐸 Attendees: {meeting.meetingConfirmations.length} / {meeting.numberOfGuests}
                            </Typography>
                        </Grid>
                        <Grid item>

                            {
                                meeting.meetingConfirmations.length < 1 ?
                                    <Grid item>
                                        <Typography variant="h6">No one booked yet :(</Typography>

                                    </Grid>
                                    : meeting.meetingConfirmations.map((confirmation) => (
                                        <Grid item key={confirmation.id}>
                                            <Grid item>
                                                <Typography variant="h6">{confirmation.isConfirmed ? "✅ Confirmed" : "Pending confirmation ⌛"}</Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="h6">
                                                    🐸 {confirmation.user.name}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                {confirmation && confirmation.isConfirmed ?
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={handleOpenCancellationConfirmation}
                                                    >
                                                        ❌ Cancel
                                                    </Button>
                                                    :
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={handleOpenConfirmConfirmation}
                                                    >
                                                        ✅ Confirm
                                                    </Button>
                                                }
                                            </Grid>
                                            {/* Confirm Confirmation Modal */}
                                            <Dialog open={confirmationConfirmationOpen} onClose={handleCloseConfirmConfirmation}>
                                                <DialogTitle>Confirm meeting</DialogTitle>
                                                <DialogContent>
                                                    <Typography>
                                                        Are you sure you want to confirm this meeting?
                                                    </Typography>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleCloseConfirmConfirmation} color="primary">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => handleConfirmMeeting(confirmation.id)} color="primary" disabled={isLoading}>
                                                        Confirm meeting
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                            {/* Confirm Cancellation Modal */}
                                            <Dialog open={confirmationCancellationOpen} onClose={handleCloseCancellationConfirmation}>
                                                <DialogTitle>Confirm cancellation</DialogTitle>
                                                <DialogContent>
                                                    <Typography>
                                                        Are you sure you want to cancel this meeting?
                                                    </Typography>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleCloseCancellationConfirmation} color="primary">
                                                        Go back
                                                    </Button>
                                                    <Button onClick={() => handleCancelMeeting(confirmation.id)} color="primary" disabled={isLoading}>
                                                        Cancel meeting
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Grid>
                                    ))}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Loading Spinner */}
            {isLoading && <CircularProgress />}

            {/* Cancellation or confirmation Alert */}
            <Fade
                in={showSuccessAlert} //Write the needed condition here to make it appear
                timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                addEndListener={() => {
                    setTimeout(() => {
                        setShowSuccessAlert(false)
                    }, 2000);
                }}
            >
                <Alert
                    severity="success"
                    icon={<CheckIcon fontSize="inherit" />}
                    onClose={() => setShowSuccessAlert(false)}
                >
                    Done!
                </Alert>
            </Fade>


            {/* Error Modal */}
            {error && (
                <Dialog open={Boolean(error)} onClose={() => setError("")}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <Typography color="error">{error}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setError("")} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default MeetingOwnerCard;

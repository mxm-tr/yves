'use client'
import React, { useState } from 'react';
import { Button, Card, CardContent, Fade, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { Meeting, User, MeetingConfirmation } from '@prisma/client';
import { MeetingConfirmationsWithMeetingAndOwnerAndGuests } from '../lib/models';

const MeetingConfirmationCard: React.FC<{ meetingConfirmation: MeetingConfirmationsWithMeetingAndOwnerAndGuests, onCancel: () => void }> = ({ meetingConfirmation, onCancel }) => {

    const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
    const [isCanceld, setIsCanceld] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    const handleCancelMeeting = async () => {
        try {
            // Show loading state
            setIsDeleting(true);

            // Close the cancel confirmation modal
            setCancelConfirmationOpen(false);

            // Send a POST request to the backend API
            const response = await fetch(`/api/v1/meetings/cancel/${meetingConfirmation.id}`, { method: 'POST' });

            if (response.ok) {
                // If the response status is 200 OK, set isCanceld to true to hide the card
                setIsCanceld(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Notify parent component to reload
                onCancel();

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error deleting meeting. Status:', response.status);
                setError('Error deleting meeting. Please try again later.');
            }
        } catch (error) {
            console.error('Error deleting meeting', error);
            setError('Error deleting meeting. Please try again later.');
        } finally {
            // Hide loading state
            setIsDeleting(false);
        }
    };

    const handleOpenCancelConfirmation = () => {
        // Open the cancel confirmation modal
        setCancelConfirmationOpen(true);
    };

    const handleCloseCancelConfirmation = () => {
        // Close the cancel confirmation modal
        setCancelConfirmationOpen(false);
        // Clear any previous error
        setError('');
    };

    return (
        <>
            {!isCanceld && (
                <Card key={meetingConfirmation.id} style={{ marginBottom: 16 }}>
                    <CardContent>
                        <Grid container direction="column" alignItems="center" spacing={2}>
                            <Grid item>
                                <Typography variant="h6">
                                    {meetingConfirmation.isConfirmed ? "✅ Confirmed" : "Pending confirmation ⌛"}
                                    &nbsp;(🪙&nbsp;{meetingConfirmation.meeting.cost})
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6">
                                    ⏰ {new Date(meetingConfirmation.meeting.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                                    &nbsp;({meetingConfirmation.meeting.durationMinutes} mn)
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography textAlign={'center'}>
                                    ✨ {meetingConfirmation.meeting.owner.name} ✨
                                    <br />&<br />
                                    ✨ {meetingConfirmation.user.name} ✨
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleOpenCancelConfirmation}
                                >
                                    🗑️ Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>

                    {/* Cancel Confirmation Modal */}
                    <Dialog open={cancelConfirmationOpen} onClose={handleCloseCancelConfirmation}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to cancel this meeting?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseCancelConfirmation} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleCancelMeeting} color="primary" disabled={isDeleting}>
                                Confirm Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Card>
            )}

            {/* Loading Spinner */}
            {isDeleting && <CircularProgress />}

            {/* Success Alert */}
            <Fade
                in={showSuccessAlert}
                timeout={{ enter: 1000, exit: 1000 }}
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
                    Deletion successful!
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

export default MeetingConfirmationCard;

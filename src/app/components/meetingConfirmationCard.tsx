'use client'
import React, { useState } from 'react';
import { Button, Card, CardContent, Box, Chip, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Fade, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
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
                <Card style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                    <CardContent>
                        <Grid container direction="column" alignItems="center" spacing={2}>
                            <Grid item>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Chip
                                        label={meetingConfirmation.isConfirmed ? "Confirmed" : "Pending Confirmation"}
                                        color={meetingConfirmation.isConfirmed ? "success" : "warning"}
                                        icon={meetingConfirmation.isConfirmed ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
                                    />
                                    <Typography variant="body2" color="text.secondary">&emsp;🪙 {meetingConfirmation.meeting.cost}</Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <AccessTimeIcon color="action" style={{ marginRight: 8 }} />
                                    <Typography variant="h6">
                                        {new Date(meetingConfirmation.meeting.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                                        &nbsp;({meetingConfirmation.meeting.durationMinutes} mn)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box textAlign="center" mb={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">✨ {meetingConfirmation.meeting.owner.name} ✨</Typography>
                                    <Typography variant="body1" color="text.secondary" mb={1}>&amp;</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">✨ {meetingConfirmation.user.name} ✨</Typography>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box display="flex" justifyContent="center">
                                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleOpenCancelConfirmation}
                                    > Cancel
                                    </Button>
                                </Box>
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

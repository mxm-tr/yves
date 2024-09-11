'use client'

import React, { useState } from 'react';
import {
    Accordion, AccordionActions, AccordionSummary, Button, Card, CardContent, Fade, Grid, Typography, Dialog, DialogTitle, DialogContent,
    DialogActions, CircularProgress, Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { MeetingsWithMeetingConfirmationsAndGuests } from '../lib/models';
import EditMeetingForm from '../meetings-with-me/EditMeetingForm';

const MeetingOwnerCard: React.FC<{ meeting: MeetingsWithMeetingConfirmationsAndGuests, triggerReload: Function }> = ({ meeting, triggerReload }) => {

    // Confirmation windows
    const [confirmationConfirmationOpen, setConfirmConfirmationOpen] = useState(false);
    const [confirmationCancellationOpen, setConfirmCancellationOpen] = useState(false);
    const [confirmationDeletionOpen, setConfirmDeletionOpen] = useState(false);

    // Meeting editor modal
    const [editMeetingOpen, setEditMeetingOpen] = useState(false);

    const [selectedConfirmationId, setSelectedConfirmationId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    const handleParentReload = () => {
        // Invoke the callback to trigger the reload in the parent
        triggerReload();
    };

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    async function handleDeleteMeeting(meetingId: string) {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmDeletionOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/meetings/${meetingId}`, { method: 'DELETE' });

            if (response.ok) {

                // Show success alert
                setShowSuccessAlert(true);

                // Trigger the reload of the parent component
                handleParentReload()

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
            setIsLoading(false);
        }
    };

    const handleOpenDeletionConfirmation = () => {
        // Open the delete confirmation modal
        setConfirmDeletionOpen(true);
    };

    const handleCloseDeletionConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmDeletionOpen(false);
        // Clear any previous error
        setError('');
    };

    async function handleConfirmMeeting(meetingConfirmationId: string) {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmConfirmationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/meetings/confirm/${meetingConfirmationId}`, { method: 'POST' });

            if (response.ok) {

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

    function handleOpenConfirmConfirmation(confirmationId: string) {
        // Set the selected confirmation id
        setSelectedConfirmationId(confirmationId);
        // Open the delete confirmation modal
        setConfirmConfirmationOpen(true);
    };

    const handleCloseConfirmConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmConfirmationOpen(false);
        // Clear any previous error
        setError('');
    };

    async function handleCancelMeeting(meetingConfirmationId: string) {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmCancellationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/meetings/cancel/${meetingConfirmationId}`, { method: 'POST' });

            if (response.ok) {

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

    function handleOpenCancellationConfirmation(confirmationId: string) {
        // Set the selected confirmation id
        setSelectedConfirmationId(confirmationId);
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
        <Paper elevation={2}>
            <Grid container direction="column" alignItems="center" spacing={2} xs={12}>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        📅&nbsp;{new Date(meeting.date).toLocaleDateString(defaultLocale)}
                    </Typography>
                    <Typography variant="h6">
                        ⌚&nbsp;{new Date(meeting.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                        &nbsp;({meeting.durationMinutes} mn)
                    </Typography>
                    <Typography variant="h6">
                        🪙&nbsp;{meeting.cost}
                    </Typography>
                    <Accordion defaultExpanded={meeting.meetingConfirmations.length > 0 ? true : false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            👥 Guests {meeting.meetingConfirmations.length} / {meeting.numberOfGuests}
                        </AccordionSummary>
                        {
                            meeting.meetingConfirmations.length < 1 ?
                                <Typography>No one booked yet 😢</Typography>
                                : meeting.meetingConfirmations.map(
                                    (confirmation) => (
                                        <Grid item key={confirmation.id}>
                                            <AccordionActions>
                                                <Typography>{confirmation.isConfirmed ? "✅" : "Pending ⌛"}
                                                    &nbsp;{confirmation.user.name}
                                                    &nbsp;&nbsp;&nbsp;
                                                    {confirmation.isConfirmed ?
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size='small'
                                                            onClick={() => handleOpenCancellationConfirmation(confirmation.id)}
                                                        >
                                                            ❌ Cancel
                                                        </Button>
                                                        :
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            size='small'
                                                            onClick={() => handleOpenConfirmConfirmation(confirmation.id)}
                                                        >
                                                            ✅ Confirm
                                                        </Button>
                                                    }
                                                </Typography>
                                            </AccordionActions>
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
                                                    <Button onClick={() => handleCloseCancellationConfirmation()} color="primary">
                                                        Go back
                                                    </Button>
                                                    <Button onClick={() => handleCancelMeeting(confirmation.id)} color="primary" disabled={isLoading}>
                                                        Cancel meeting
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Grid>
                                    )
                                )
                        }
                    </Accordion>

                    <Grid item xs={12}>
                        {/* Edit meeting Button */}
                        <Button onClick={() => setEditMeetingOpen(true)} color="warning" disabled={isLoading} fullWidth>
                            Edit
                        </Button>
                        {/* Delete meeting Button */}
                        <Button onClick={() => handleOpenDeletionConfirmation()} color="error" disabled={isLoading} fullWidth>
                            Delete
                        </Button>
                    </Grid>

                    {/* Delete meeting Modal */}
                    <Dialog open={confirmationDeletionOpen} onClose={handleCloseDeletionConfirmation}>
                        <DialogTitle>Confirm deletion</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this meeting?
                                {meeting.meetingConfirmations.length > 1 ? "All confirmed guests will be reimbursed!" : ""}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeletionConfirmation} color="primary">
                                Go back
                            </Button>
                            <Button onClick={() => handleDeleteMeeting(meeting.id)} color="primary" disabled={isLoading}>
                                Delete meeting
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>

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

            {/* Edit meeting Modal */}
            <Dialog open={editMeetingOpen}>
                <DialogContent>
                    <EditMeetingForm meetingId={meeting.id} oldCost={meeting.cost}
                        oldDateAndTimeIso={meeting.date} oldDuration={meeting.durationMinutes}
                        oldNumberOfGuests={meeting.numberOfGuests} onEditMeeting={() => handleParentReload()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditMeetingOpen(false)} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Paper>
    );
};

export default MeetingOwnerCard;

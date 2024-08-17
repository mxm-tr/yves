'use client'
import React, { useState } from 'react';
import { Button, Card, CardContent, Fade, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { AppointmentWithSchedule } from '../lib/models';

const AppointmentCard: React.FC<{ appointment: AppointmentWithSchedule, onDelete: () => void }> = ({ appointment, onDelete }) => {

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    const handleDeleteAppointment = async () => {
        try {
            // Show loading state
            setIsDeleting(true);

            // Close the delete confirmation modal
            setDeleteConfirmationOpen(false);

            // Send a DELETE request to the backend API
            const response = await fetch(`/api/v1/appointments/${appointment.id}`, { method: 'DELETE' });

            if (response.ok) {
                // If the response status is 200 OK, set isDeleted to true to hide the card
                setIsDeleted(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Notify parent component to reload
                onDelete();

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error deleting appointment. Status:', response.status);
                setError('Error deleting appointment. Please try again later.');
            }
        } catch (error) {
            console.error('Error deleting appointment', error);
            setError('Error deleting appointment. Please try again later.');
        } finally {
            // Hide loading state
            setIsDeleting(false);
        }
    };

    const handleOpenDeleteConfirmation = () => {
        // Open the delete confirmation modal
        setDeleteConfirmationOpen(true);
    };

    const handleCloseDeleteConfirmation = () => {
        // Close the delete confirmation modal
        setDeleteConfirmationOpen(false);
        // Clear any previous error
        setError('');
    };

    return (
        <>
            {!isDeleted && (
                <Card key={appointment.id} style={{ marginBottom: 16 }}>
                    <CardContent>
                        <Grid container direction="column" alignItems="center" spacing={2}>
                            <Grid item>
                                <Typography variant="h6">
                                    {appointment.confirmed ? "✅ Confirmed" : "Pending confirmation ⌛"}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6">
                                    🐸 With: {appointment.schedule.owner.name}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6">
                                    📅 Date: {new Date(appointment.schedule.date).toLocaleDateString(defaultLocale)}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6">
                                    ⌚ Time: {new Date(appointment.schedule.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleOpenDeleteConfirmation}
                                >
                                    🗑️ Cancel
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteConfirmationOpen} onClose={handleCloseDeleteConfirmation}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete this appointment?
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteConfirmation} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteAppointment} color="primary" disabled={isDeleting}>
                                Confirm Delete
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

export default AppointmentCard;

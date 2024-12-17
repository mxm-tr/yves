import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Box, Typography, Button, Snackbar, Stack, Theme, useMediaQuery } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkIcon from '@mui/icons-material/Link';

const QRCode = ({ userID }: { userID: string }) => {
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const shareText = encodeURIComponent("Check out my invite link:");

    const [inviteUrl, setInviteUrl] = useState<string>('');
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar state for showing notification

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);  // Close the Snackbar
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteUrl);
        setOpenSnackbar(true);  // Show the Snackbar after copying
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hostname = new URL(window.location.href).hostname
            setInviteUrl(`https://${hostname}/book/${userID}`);
        }
    }, [userID]);

    return (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Invite people
            </Typography>
            <Typography variant="body1" paragraph>
                Share this link to let people easily book with you!
            </Typography>
            {inviteUrl && (
                <Box sx={{ marginBottom: 4 }}>
                    <QRCodeCanvas value={inviteUrl} size={200} />
                </Box>
            )}
            <Typography variant="body1" paragraph>
                Use the buttons below to share your invite link:
            </Typography>
            <Stack
                direction={isSmallScreen ? 'column' : 'row'}
                spacing={2}
                justifyContent="center"
                sx={{ marginTop: 2 }}
            >
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FacebookIcon />}
                    href={`https://www.facebook.com/sharer/sharer.php?u=${inviteUrl}`}
                    target="_blank"
                >
                    Facebook
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<TwitterIcon />}
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${inviteUrl}`}
                    target="_blank"
                >
                    Twitter
                </Button>
                <Button
                    variant="outlined"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    href={`https://api.whatsapp.com/send?text=${shareText} ${inviteUrl}`}
                    target="_blank"
                >
                    WhatsApp
                </Button>
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<LinkIcon />}
                    onClick={handleCopyLink}
                >
                    Copy Link
                </Button>
                {/* Snackbar for showing success message when link is copied */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}  // Auto close after 3 seconds
                    onClose={handleCloseSnackbar}
                    message="Link copied to clipboard!"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position of the Snackbar
                />
            </Stack>
        </Box>
    );
};

export default QRCode;

// components/SignInButton.js

import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react"
import { signOut } from "next-auth/react"

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = () => {
        signOut()
    };

    return (
        <Button
            variant="contained"
            color="error"
            onClick={handleSignOut}
            sx={{ padding: '10px 20px', fontSize: '16px' }}
        >
            Sign Out
        </Button>
    );
}

export default function SignInButton() {
    const router = useRouter();

    const handleSignIn = () => {
        // router.push('/signin');
        signIn();
    };

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            sx={{ padding: '10px 20px', fontSize: '16px' }}
        >
            Sign In
        </Button>
    );
}
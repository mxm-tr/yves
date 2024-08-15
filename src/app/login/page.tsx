import { redirect } from "next/navigation";
import { signIn, auth, providerMap } from "@/app/auth";
import { AuthError } from "next-auth";
import { Grid, Button, Typography, Box, Alert } from "@mui/material";

export default async function SignInPage({ searchParams }: any) {
    const error = searchParams?.error;

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}
        >
            <Grid item>
                <Typography variant="h4" gutterBottom>
                    Sign in to Your Account
                </Typography>
            </Grid>

            {error && (
                <Grid item sx={{ marginBottom: 2 }}>
                    <Alert severity="error">
                        {error === "OAuthAccountNotLinked"
                            ? "Another account already exists with the same e-mail address."
                            : "An error occurred. Please try again."}
                    </Alert>
                </Grid>
            )}

            <Grid item>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {Object.values(providerMap).map((provider) => (
                        <form
                            key={provider.id}
                            action={async () => {
                                "use server";
                                try {
                                    await signIn(provider.id, { redirectTo: "/" });
                                } catch (error) {
                                    if (error instanceof AuthError) {
                                        return redirect(`/signin-error?error=${error.type}`);
                                    }
                                    throw error;
                                }
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                type="submit"
                                sx={{ textTransform: "none" }}
                            >
                                Sign in with {provider.name}
                            </Button>
                        </form>
                    ))}
                </Box>
            </Grid>
        </Grid>
    );
}

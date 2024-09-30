import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Fade, FormHelperText, FormControl } from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar from notistack
import { loginApi } from '../api/auth_service'; // Import the login function
import { useAuth } from '../providers/AuthContext';


// Auth component
const Auth: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
	// State to toggle between login and register
	const [showLoginPage, setShowLoginPage] = useState(true);


	// Function to toggle between login and register forms
	const togglePage = () => {
		setShowLoginPage(!showLoginPage);
	};

	return (
		<Card sx={{ maxWidth: 400, width: '100%', margin: 0, padding: 0 }}>
			<CardContent>
				<Fade in={showLoginPage} timeout={300}>
					<div>
						{showLoginPage ? (
							<div style={{ display: showLoginPage ? 'block' : 'none' }}>
								<LoginPage onRegisterPressed={() => { }} onLoginSuccess={onLoginSuccess} />
							</div>
						) : (
							<div style={{ display: !showLoginPage ? 'block' : 'none' }}>
								<RegisterPage onLoginPressed={togglePage} />
							</div>
						)}
					</div>
				</Fade>

			</CardContent>
		</Card>
	);
};

// Login Page Component
const LoginPage: React.FC<{ onRegisterPressed: () => void, onLoginSuccess: () => void }> = ({ onRegisterPressed, onLoginSuccess }) => {
	const { login } = useAuth();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { enqueueSnackbar } = useSnackbar(); // useSnackbar for toast notifications

	const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault(); // Prevent the default form submission
		setIsLoading(true);
		try {
			const resp = await loginApi(username, password);
			login(resp.token, resp.user);

			enqueueSnackbar('Login successful!', { variant: 'success' }); // Show success notification
			onLoginSuccess();
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleLogin}>
			<Typography variant="h5" gutterBottom>Login</Typography>

			{/* Username Field */}
			<FormControl fullWidth margin="normal">
				<TextField
					label="Username or Email"
					variant="outlined"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<FormHelperText>Enter your username or email.</FormHelperText>
			</FormControl>

			{/* Password Field */}
			<FormControl fullWidth margin="normal">
				<TextField
					label="Password"
					variant="outlined"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<FormHelperText>Password must be at least 8 characters.</FormHelperText>
			</FormControl>

			{/* Submit Button */}
			<Button
				variant="contained"
				color="primary"
				fullWidth
				type="submit" // Button of type submit to trigger form submit
				disabled={isLoading}
				sx={{ mt: 2 }}
				size="large"
			>
				{isLoading ? 'Logging in...' : 'Login'}
			</Button>

			{/* Register Link */}
			<Button
				onClick={onRegisterPressed}
				sx={{
					mt: 2,
					alignSelf: 'flex-end',
					textAlign: 'right',
					justifyContent: 'flex-end',
					width: '100%',
				}}
			>
				Don't have an account? Register
			</Button>
		</form>
	);
};

// Register Page Component
const RegisterPage: React.FC<{ onLoginPressed: () => void }> = ({ onLoginPressed }) => {
	// State to manage the input values
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleRegister = () => {
		// Simulate API call
		setTimeout(() => {
			alert(`Registered with Username: ${username} and Email: ${email}`);
		}, 1000);
	};

	return (
		<div>
			<Typography variant="h5" gutterBottom>Register</Typography>
			<TextField
				label="Username"
				variant="outlined"
				fullWidth
				margin="normal"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<TextField
				label="Email"
				variant="outlined"
				fullWidth
				margin="normal"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<TextField
				label="Password"
				variant="outlined"
				fullWidth
				margin="normal"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<Button
				variant="contained"
				color="primary"
				fullWidth
				onClick={handleRegister}
				sx={{ mt: 2 }}
			>
				Register
			</Button>
			<Button onClick={onLoginPressed} sx={{ mt: 2 }}>
				Already have an account? Login
			</Button>
		</div>
	);
};

export default Auth;

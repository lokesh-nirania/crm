import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItemButton, ListItemText, Card, CardContent, Avatar, Box, ListItemIcon, Divider, Dialog, DialogContent, CardActionArea } from '@mui/material';
import { AccountCircle, Dashboard, Home, Inventory, Receipt, Shop, Shop2 } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom'; // For rendering child routes
import Auth from './components/Auth';
import { isLoggedIn } from './api/auth_service';
import User from './model/user'
import { useAuth } from './providers/AuthContext'; // Import the useAuth hook
;

const drawerWidth = 240;

const Layout: React.FC = () => {
	const { user } = useAuth();

	const [openAuthDialog, setOpenAuthDialog] = useState(false);
	const navigate = useNavigate();

	// Function to open the Auth dialog
	const handleOpenAuthDialog = () => {
		if (user == null) {
			setOpenAuthDialog(true);
		} else {
			navigate("/profile")
		}
	};

	// Function to close the Auth dialog
	const handleCloseAuthDialog = () => {
		setOpenAuthDialog(false);
	};


	return (
		<div style={{ display: 'flex' }}>
			<AppBar position="fixed" sx={{ zIndex: 1201 }}>
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						STYLOX
					</Typography>
					<IconButton color="inherit" onClick={handleOpenAuthDialog}>
						<AccountCircle />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Drawer
				variant="permanent"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					[`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
				}}
			>
				<Toolbar />
				<div>
					<SideBarMenuItems />

				</div>
				<ProfileCard userInfo={user} />
			</Drawer>

			<div style={{ flexGrow: 1, padding: '80px 24px' }}>
				<Outlet />
			</div>

			<Dialog open={openAuthDialog} onClose={handleCloseAuthDialog} maxWidth="xs" fullWidth>
				<DialogContent>
					<Auth onLoginSuccess={handleCloseAuthDialog} /> {/* Pass the close function to Auth */}
				</DialogContent>
			</Dialog>
		</div>
	);
};

interface ProfileCardProps {
	userInfo: User | null; // userInfo can be of type User or null
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userInfo }) => {
	const navigate = useNavigate();

	const handleCardClick = () => {
		if (userInfo != null) {
			navigate("/profile")
		}
		console.log('Card clicked!');
	};

	return (
		<div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
			<Card>
				<CardActionArea onClick={handleCardClick}>
					<CardContent>
						{userInfo ? (
							<Box display="flex" alignItems="center">
								{/* Avatar */}
								<Avatar src="https://via.placeholder.com/150" alt="User Image" />

								{/* Name and Email stacked vertically */}
								<Box sx={{ marginLeft: 2 }}>
									{/* Name */}
									<Typography variant="body1">
										{userInfo?.Username}
									</Typography>

									{/* Email */}
									<Typography variant="body2" color="textSecondary">
										{userInfo?.Email}
									</Typography>
								</Box>
							</Box>
						) : (
							<Box display="flex" justifyContent="center" alignItems="center" height="100%">
								<Typography variant="h6" color="textSecondary">
									Not logged in
								</Typography>
							</Box>
						)}
					</CardContent>
				</CardActionArea>
			</Card>
		</div>
	);
};


function SideBarMenuItems() {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const { user } = useAuth();

	const navigate = useNavigate();
	const location = useLocation(); // Get the current location

	let menuItems = [
		{ text: 'Home', path: '/', icon: <Home /> },
		{ text: 'Shop', path: '/shop', icon: <Shop2 /> },
		{ text: 'Cart', path: '/cart', icon: <Shop /> },
	];

	if (user !== null) {
		menuItems = [
			{ text: 'Home', path: '/', icon: <Home /> },
			{ text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
			{ text: 'Products', path: '/products', icon: <Inventory /> },
			{ text: 'GRN', path: '/grn', icon: <Receipt /> },
			{ text: 'Orders', path: '/orders', icon: <Shop /> },
			{ text: 'Shop', path: '/shop', icon: <Shop2 /> },
			{ text: 'Cart', path: '/cart', icon: <Shop /> },
		];
	}

	useEffect(() => {
		const currentPath = location.pathname;
		const currentIndex = menuItems.findIndex(item => item.path === currentPath);
		if (currentIndex !== -1) {
			setSelectedIndex(currentIndex); // Set the proper selected index
		}
	}, [location.pathname]);


	const handleListItemClick = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
		index: number,
		path: string,
	) => {
		setSelectedIndex(index);
		navigate(path);
	};

	return (
		<Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
			<List component="nav" aria-label="main mailbox folders">
				{menuItems.map((item, index) => (
					<ListItemButton
						key={item.text}
						selected={selectedIndex === index}
						onClick={(event) => handleListItemClick(event, index, item.path)}
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.text} />
					</ListItemButton>
				))}
			</List>
			<Divider />
		</Box>
	);
}

export default Layout;

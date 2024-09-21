import { Button } from '@mui/material';
import React from 'react';
import { logoutApi } from '../api/auth_service';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';

const Profile: React.FC = () => {
    const { logout } = useAuth();

    const { enqueueSnackbar } = useSnackbar(); // useSnackbar for toast notifications
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const success = await logoutApi();
            if (success) {
                logout();
                enqueueSnackbar('LogOut successful!', { variant: 'success' }); // Show success notification
                navigate("/")
            } else {
                enqueueSnackbar('LogOut error!', { variant: 'error' });
            }

        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
        }
    }
    return <div>
        <Button onClick={handleLogout}>
            Logout
        </Button>
    </div>;
};

export default Profile;
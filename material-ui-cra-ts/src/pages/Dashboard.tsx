import React, { useEffect } from 'react';
import { isLoggedIn } from '../api/auth_service';

const Dashboard: React.FC = () => {
    const checkLoginStatus = async () => {
        await isLoggedIn();
    }
    useEffect(() => {
        checkLoginStatus(); // Call the function inside useEffect
    }, []);

    return <div>Dashboard Content</div>;
};

export default Dashboard;

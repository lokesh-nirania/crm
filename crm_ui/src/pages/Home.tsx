import React, { useEffect } from 'react';
import { isLoggedIn } from '../api/auth_service';

const Home: React.FC = () => {
    const checkLoginStatus = async () => {
        await isLoggedIn();
    }
    useEffect(() => {
        checkLoginStatus(); // Call the function inside useEffect
    }, []);

    return <div>Welcome to Stylox</div>;
};

export default Home;

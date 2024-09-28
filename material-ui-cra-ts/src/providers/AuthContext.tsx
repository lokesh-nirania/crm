import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import User from '../model/user';
import { isLoggedIn } from '../api/auth_service'; // Import the login function


// Define your props explicitly
interface AuthProviderProps {
    children: ReactNode; // Explicitly type children as ReactNode
}

// Define the context type
interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));

        setUser(user);
    };

    const checkAndUseExistingToken = async () => {
        const isLogged = await isLoggedIn();
        if (isLogged) {
            const userJson = localStorage.getItem('authUser');
            if (userJson == null) {
                return false
            }
            setUser(JSON.parse(userJson))
        }
    }

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    useEffect(() => { checkAndUseExistingToken(); }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

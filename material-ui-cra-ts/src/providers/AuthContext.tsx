import React, { createContext, useState, useContext, ReactNode } from 'react';
import User from '../model/user';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const login = (token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));

        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

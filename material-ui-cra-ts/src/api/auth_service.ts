import axios from 'axios';
import LoginResponse from '../model/auth';
import PingResponse from '../model/auth';
import api_constants from './api_constants';
import User from '../model/user';

const constants = new api_constants();

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
    const url = constants.baseUrl + constants.loginEndpoint;
    try {
        const response = await axios.post<LoginResponse>(url, { username, password });
        const resp = response.data;

        // Store token in localStorage
        localStorage.setItem('authToken', resp.token);
        localStorage.setItem('authUser', JSON.stringify(resp.user));
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Login failed: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
};

export const logoutApi = async (): Promise<boolean> => {
    const url = constants.baseUrl + constants.logoutEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            return false;
        }


        await axios.post<PingResponse>(url, null, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            }
        });

        localStorage.clear();
        return true;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Login failed: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
};

export const isLoggedIn = async (): Promise<boolean> => {
    const url = constants.baseUrl + constants.pingEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            return false;
        }

        const userJson = localStorage.getItem('authUser');
        if (userJson == null) {
            return false
        }


        await axios.get<PingResponse>(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            }
        });

        return true;
    } catch (error) {
        localStorage.clear();
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Login failed: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
};

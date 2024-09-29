import axios from 'axios';
import api_constants from './api_constants';
import { PropertyFilter, ProductFilter, ListFilter, FilteredProductsResponse } from '../model/product';
import { FilteredGRNsResponse, GetGRNSourcesResponse, GetGRNVendorResponse, AddGRNWarehouseRequest, GetGRNWarehouseResponse, AddGRNWarehouseResponse, AddGRNVendorRequest, AddGRNVendorResponse, AddGRNFormDataRequest, AddGRNResponse, ConfirmGRNRequest } from '../model/grns';
import { AddOrderResponse, GetOrdersResponse, PlaceOrderAdminRequest, PlaceOrderRequest } from '../model/order';
import { UserResponse } from '../model/user';

const constants = new api_constants();

export const postPlaceOrder = async (req: PlaceOrderRequest): Promise<AddOrderResponse> => {
    const url = constants.baseUrl + constants.placeOrderEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        console.log("request is ", req)

        const response = await axios.post<AddOrderResponse>(url, req, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Add GRN Failed: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}

export const confirmOrder = async (order_id: number): Promise<AddOrderResponse> => {
    const url = constants.baseUrl + constants.confirmOrderAdminEndpoint + "/" + order_id;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddOrderResponse>(url, null, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Confirm Order Failed: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}

export const cancelOrder = async (order_id: number): Promise<AddOrderResponse> => {
    const url = constants.baseUrl + constants.cancelOrderAdminEndpoint + "/" + order_id;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddOrderResponse>(url, null, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Confirm Order Failed: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}

export const postPlaceAdminOrder = async (req: PlaceOrderAdminRequest): Promise<AddGRNResponse> => {
    const url = constants.baseUrl + constants.placeOrderAdminEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        console.log("request is ", JSON.stringify(req))

        const response = await axios.post<AddGRNResponse>(url, req, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Add Order via Admin Failed: ${error.response.data.error || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}

export const getOrders = async (filters: [], pageNo: number, pageSize: number): Promise<GetOrdersResponse> => {
    const url = constants.baseUrl + constants.getOrderEndpoint;
    try {
        console.log("try begin")
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);

        }

        console.log("try begin 2")




        const response = await axios.get<GetOrdersResponse>(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },

        });

        return response.data;
    } catch (error) {
        console.log(`error is got ${error}`)
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Get ORders Failed: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}

export const getUsers = async (name: string): Promise<UserResponse> => {
    let url = constants.baseUrl + constants.getUsersEndpoint + "?name=" + name;
    try {
        console.log("try begin")
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);

        }

        const response = await axios.get<UserResponse>(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },

        });

        return response.data;
    } catch (error) {
        console.log(`error is got ${error}`)
        if (axios.isAxiosError(error)) {
            // Handle different Axios-specific errors
            if (error.response) {
                // Server responded with a status other than 2xx
                throw new Error(`Get Users Failed: ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Login request failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
        }
    }
}


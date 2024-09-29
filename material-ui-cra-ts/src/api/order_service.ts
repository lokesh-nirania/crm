import axios from 'axios';
import api_constants from './api_constants';
import { PropertyFilter, ProductFilter, ListFilter } from '../model/product';
import { FilteredGRNsResponse, GetGRNSourcesResponse, GetGRNVendorResponse, AddGRNWarehouseRequest, GetGRNWarehouseResponse, AddGRNWarehouseResponse, AddGRNVendorRequest, AddGRNVendorResponse, AddGRNFormDataRequest, AddGRNResponse, ConfirmGRNRequest } from '../model/grns';
import { PlaceOrderRequest } from '../model/order';

const constants = new api_constants();

export const postPlaceOrder = async (req: PlaceOrderRequest): Promise<AddGRNResponse> => {
    const url = constants.baseUrl + constants.placeOrderEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        console.log("request is ", req)

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


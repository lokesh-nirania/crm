import axios from 'axios';
import api_constants from './api_constants';
import { PropertyFilter, ProductFilter, ListFilter } from '../model/product';
import { FilteredGRNsResponse, GetGRNSourcesResponse, GetGRNVendorResponse, AddGRNWarehouseRequest, GetGRNWarehouseResponse, AddGRNWarehouseResponse, AddGRNVendorRequest, AddGRNVendorResponse, AddGRNFormDataRequest, AddGRNResponse, ConfirmGRNRequest } from '../model/grns';

const constants = new api_constants();

export const getAllFilteredGRNs = async (filters: Array<ProductFilter>, pageNo: number, pageSize: number): Promise<FilteredGRNsResponse> => {
    const url = constants.baseUrl + constants.filteredGRNsEndpoint;
    try {
        console.log("try begin")
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);

        }

        console.log("try begin 2")

        // Create an instance of URLSearchParams
        const params = new URLSearchParams({
            page: pageNo.toString(),
            pageSize: pageSize.toString(),
        });



        // Loop through the filters and add them to the params
        filters.forEach(f => {
            if (f instanceof PropertyFilter) {
                // console.log(JSON.stringify(f))
                const selectedValues = f.values
                    .filter(obj => obj.isChecked)
                    .map(obj => obj.ID)
                    .join(',');

                if (selectedValues !== "") {
                    params.append(f.name, selectedValues);
                }
            }
            else if (f instanceof ListFilter) {
                console.log(JSON.stringify(f))
                const selectedValues = f.values
                    .filter(obj => obj.isChecked)
                    .map(obj => obj.name)
                    .join(',');

                if (selectedValues !== "") {
                    params.append(f.name, selectedValues);
                }
            }
        });

        const queryString = params.toString();
        const fullUrl = `${url}?${queryString}`;



        const response = await axios.get<FilteredGRNsResponse>(fullUrl, {
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
            throw new Error(`${error}`);
        }
    }

}

export const postGRNData = async (productForm: AddGRNFormDataRequest): Promise<AddGRNResponse> => {
    const url = constants.baseUrl + constants.addGRNsEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddGRNResponse>(url, productForm, {
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

export const confirmGRNData = async (productForm: ConfirmGRNRequest): Promise<AddGRNResponse> => {
    const url = constants.baseUrl + constants.confirmGRNsEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddGRNResponse>(url, productForm, {
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
                throw new Error(`Confirm GRN Failed: ${error.response.data.error || 'Unknown error'}`);
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

// GRN Properties 
export const getGRNWarehouses = async (): Promise<GetGRNWarehouseResponse> => {
    const url = constants.baseUrl + constants.grnWarehousesEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<GetGRNWarehouseResponse>(url, {
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
            throw new Error(`${error}`);
        }
    }
}

export const getGRNVendors = async (): Promise<GetGRNVendorResponse> => {
    const url = constants.baseUrl + constants.grnVendorsEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<GetGRNVendorResponse>(url, {
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
            throw new Error(`${error}`);
        }
    }
}

export const getGRNSources = async (): Promise<GetGRNSourcesResponse> => {
    const url = constants.baseUrl + constants.grnSourcesEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<GetGRNSourcesResponse>(url, {
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
            throw new Error(`${error}`);
        }
    }
}

export const postWarehouseData = async (productForm: AddGRNWarehouseRequest): Promise<AddGRNWarehouseResponse> => {
    const url = constants.baseUrl + constants.grnAddWarehouseEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddGRNWarehouseResponse>(url, productForm, {
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
                throw new Error(`Add Product Failed: ${error.response.data.error || 'Unknown error'}`);
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

export const postVendorData = async (productForm: AddGRNVendorRequest): Promise<AddGRNVendorResponse> => {
    const url = constants.baseUrl + constants.grnAddVendorsEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.post<AddGRNVendorResponse>(url, productForm, {
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
                throw new Error(`Add Product Failed: ${error.response.data.error || 'Unknown error'}`);
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


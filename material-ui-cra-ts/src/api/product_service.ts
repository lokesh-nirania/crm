import axios from 'axios';
import LoginResponse from '../model/auth';
import PingResponse from '../model/auth';
import api_constants from './api_constants';
import User from '../model/user';
import Product, { FilteredProductsResponse, FiltersResponse, LikeFilter, ListFilter, ProductFilter, ProductFormDataRequest, ProductFormDataResponse, ProductPropertiesResponse, ProductProperty, ProductPropertyAddResponse, RangeFilter } from '../model/product';
import ProductFilterResponse from '../model/product';

const constants = new api_constants();

export const getAllFilteredProducts = async (filters: Array<ProductFilter>, pageNo: number, pageSize: number): Promise<FilteredProductsResponse> => {
    const url = constants.baseUrl + constants.filteredProductsEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        // Create an instance of URLSearchParams
        const params = new URLSearchParams({
            page: pageNo.toString(),
            pageSize: pageSize.toString(),
        });



        // Loop through the filters and add them to the params
        filters.forEach(f => {
            if (f instanceof ListFilter) {
                // console.log(JSON.stringify(f))
                const selectedValues = f.values
                    .filter(obj => obj.isChecked)
                    .map(obj => obj.ID)
                    .join(',');

                if (selectedValues !== "") {
                    params.append(f.name, selectedValues);
                }
            }
        });

        const queryString = params.toString();
        const fullUrl = `${url}?${queryString}`;



        const response = await axios.get<FilteredProductsResponse>(fullUrl, {
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
            throw new Error('An unexpected error occurred. Please try again.',);
        }
    }

}

export const getAllFilters = async (): Promise<Array<ProductFilter>> => {
    const url = constants.baseUrl + constants.productFiltersEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<FiltersResponse>(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },

        });

        const filters: Array<ProductFilter> = [];

        response.data.filters.forEach((f) => {
            if (f.type == "list") {
                let productProperties: Array<ProductProperty> = [];
                f.metadata.forEach((m: { [x: string]: any; }) => {
                    if (typeof (m) === "object") {
                        const productProperty = new ProductProperty(m['ID'], m['name'], false)
                        productProperties.push(productProperty);
                    }
                });
                let listfilter = new ListFilter(f.name, "list", false, productProperties);
                filters.push(listfilter)
            }
            else if (f.type == "range") {
                let rangefilter = new RangeFilter(f.name, "list");
                filters.push(rangefilter)
            }
            if (f.type == "like") {
                let likefilter = new LikeFilter(f.name, "list", false, "");
                filters.push(likefilter)
            }
        });

        return filters;
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

}

export const getProductProperties = async (property: string): Promise<ProductPropertiesResponse> => {
    const url = constants.baseUrl + constants.productPropertiesEndpoint + "?property=" + (property === "" ? "all" : property);
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<ProductPropertiesResponse>(url, {
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
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
}

export const postProductForm = async (productForm: ProductFormDataRequest): Promise<ProductFormDataRequest> => {
    const url = constants.baseUrl + constants.addProductEndpoint;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        console.log("------>", JSON.stringify(productForm))

        const response = await axios.post<ProductFormDataResponse>(url, productForm, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Use template literal for token interpolation
            },
        });

        return response.data.product;
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
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }
}

export const postProductProperty = async (propertyName: string, property: ProductProperty): Promise<ProductPropertyAddResponse> => {
    const url = constants.baseUrl + constants.addProductEndpoint + "/" + propertyName;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        console.log("------>", JSON.stringify(propertyName), JSON.stringify(propertyName))

        const response = await axios.post<ProductPropertyAddResponse>(url, property, {
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
                throw new Error(`Add Product Property Failed: ${error.response.data.error || 'Unknown error'}`);
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
}

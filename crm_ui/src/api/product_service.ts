import axios from 'axios';
import LoginResponse from '../model/auth';
import PingResponse from '../model/auth';
import api_constants from './api_constants';
import User from '../model/user';
import Product, { FilteredProductsResponse, FiltersResponse, LikeFilter, PropertyFilter, ProductFilter, ProductFormDataRequest, ProductFormDataResponse, ProductAttributesResponse, ProductAttributeProperty, ProductPropertyAddResponse, RangeFilter, ListFilter, ProductAttributeList, SizeVariantListResponse, ProductWithInventoryResponse } from '../model/product';
import ProductFilterResponse from '../model/product';
import { CartItem } from '../model/order';

const constants = new api_constants();

export const getAllFilteredProducts = async (filters: Array<ProductFilter>, pageNo: number, pageSize: number): Promise<FilteredProductsResponse> => {
    const url = constants.baseUrl + constants.filteredProductsEndpoint;
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
            else if (f instanceof LikeFilter) {
                console.log(JSON.stringify(f))
                if (f.content !== "") {
                    params.append(f.name, f.content);
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

export const getProductWithInventory = async (product_id: number): Promise<ProductWithInventoryResponse> => {
    const url = constants.baseUrl + constants.getProductEndpoint + product_id;
    try {
        console.log("try begin")
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);

        }

        console.log("try begin 2")




        const response = await axios.get<ProductWithInventoryResponse>(url, {
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
                throw new Error(`Product Fetch failed: ${error.response.data.message || 'Unknown error'}`);
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
            if (f.type == "property") {
                let pas: Array<ProductAttributeProperty> = [];
                f.metadata.forEach((m: { [x: string]: any; }) => {
                    if (typeof (m) === "object") {
                        const p = new ProductAttributeProperty(m['ID'], m['name'], false)
                        pas.push(p);
                    }
                });
                let propertyfilter = new PropertyFilter(f.name, "property", false, pas);
                filters.push(propertyfilter)
            }
            else if (f.type == "range") {
                let rangefilter = new RangeFilter(f.name);
                filters.push(rangefilter)
            }
            else if (f.type == "like") {
                let likefilter = new LikeFilter(f.name);
                filters.push(likefilter)
            }
            else if (f.type == "list") {
                let pas: Array<ProductAttributeList> = [];
                f.metadata.forEach((m: string) => {
                    const p = new ProductAttributeList(m, false)
                    pas.push(p);

                });
                let propertyfilter = new ListFilter(f.name, "list", false, pas);
                filters.push(propertyfilter)
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
            throw new Error(`${error}`);
        }
    }

}

export const getProductAttributes = async (attribute: string): Promise<ProductAttributesResponse> => {
    const url = constants.baseUrl + constants.productAttributesEndpoint + "?attribute=" + (attribute === "" ? "all" : attribute);
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<ProductAttributesResponse>(url, {
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

export const getSizeVariants = async (variant: string): Promise<SizeVariantListResponse> => {
    const url = constants.baseUrl + constants.productSizeVariantsEndpoint + "/" + variant;
    try {
        const token = localStorage.getItem('authToken');
        if (token === null) {
            throw new Error(`User is logged out`);
        }

        const response = await axios.get<SizeVariantListResponse>(url, {
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
                throw new Error(`Size Variant Fetch Failed : ${error.response.data.message || 'Unknown error'}`);
            } else if (error.request) {
                // No response received from the server
                throw new Error('No response from the server. Please try again later.');
            } else {
                // Error during request setup
                throw new Error('Size Variant Fetch Failed. Please try again.');
            }
        } else {
            // Non-Axios error
            throw new Error(`${error}`);
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
            throw new Error(`${error}`);
        }
    }
}

export const postProductProperty = async (propertyName: string, property: ProductAttributeProperty): Promise<ProductPropertyAddResponse> => {
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
            throw new Error(`${error}`);
        }
    }
}


export const addToCart = (cartItem: CartItem): boolean => {
    const cartFromStorage = localStorage.getItem('cart');
    if (cartFromStorage !== null) {
        console.log("cart present in local storage, adding items ")
        let myCartItem: CartItem[] = JSON.parse(cartFromStorage);
        const existingItemIndex = myCartItem.findIndex(item => item.product_id === cartItem.product_id);

        if (existingItemIndex === -1) {
            myCartItem.push(cartItem);
            localStorage.setItem('cart', JSON.stringify(myCartItem));
            return true;
        }

        return false;

    } else {
        console.log("cart not present in local storage, initialisting and adding items ")
        let myCartItem: CartItem[] = [cartItem]
        localStorage.setItem('cart', JSON.stringify(myCartItem));
    }
    return true
}

export const getCart = (): CartItem[] => {
    const cartFromStorage = localStorage.getItem('cart');
    console.log(cartFromStorage)
    if (cartFromStorage !== null) {
        let myCartItem: CartItem[] = JSON.parse(cartFromStorage);
        return myCartItem;
    }
    return []
}

export const clearCart = () => {
    localStorage.removeItem('cart');
}
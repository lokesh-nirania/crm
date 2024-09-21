export default class api_constants {
    baseUrl = 'http://localhost:8080';

    loginEndpoint = '/api/crm/v1/auth/login';
    registerEndpoint = '/api/crm/v1/auth/register';

    pingEndpoint = '/api/crm/v1/span/ping';
    logoutEndpoint = '/api/crm/v1/span/logout';

    userProfileEndpoint = '/api/crm/v1/profile';

    allProductsEndpoint = '/api/crm/v1/products';
    filteredProductsEndpoint = '/api/crm/v1/products/v2';
    productPropertiesEndpoint = '/api/crm/v1/products/properties';
    productFiltersEndpoint = '/api/crm/v1/products/filters';

    addProductEndpoint = '/api/crm/v1/products/add';
}

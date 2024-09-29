export default class api_constants {
    baseUrl = 'http://localhost:8080';

    loginEndpoint = '/api/crm/v1/auth/login';
    registerEndpoint = '/api/crm/v1/auth/register';

    pingEndpoint = '/api/crm/v1/span/ping';
    logoutEndpoint = '/api/crm/v1/span/logout';

    userProfileEndpoint = '/api/crm/v1/profile';

    allProductsEndpoint = '/api/crm/v1/products';
    filteredProductsEndpoint = '/api/crm/v1/products/v2';
    productAttributesEndpoint = '/api/crm/v1/products/attributes';
    productFiltersEndpoint = '/api/crm/v1/products/filters';
    productSizeVariantsEndpoint = '/api/crm/v1/products/size_variants';

    addProductEndpoint = '/api/crm/v1/products/add';
    getProductEndpoint = '/api/crm/v1/products/';

    filteredGRNsEndpoint = '/api/crm/v1/grn';
    addGRNsEndpoint = '/api/crm/v1/grn/add';
    confirmGRNsEndpoint = '/api/crm/v1/grn/confirm';

    grnWarehousesEndpoint = '/api/crm/v1/grn/warehouse';
    grnAddWarehouseEndpoint = '/api/crm/v1/grn/warehouse/add';

    grnVendorsEndpoint = '/api/crm/v1/grn/vendor'
    grnAddVendorsEndpoint = '/api/crm/v1/grn/vendor/add';

    grnSourcesEndpoint = '/api/crm/v1/grn/sources';

    placeOrderEndpoint = "/api/crm/v1/orders/place";
}

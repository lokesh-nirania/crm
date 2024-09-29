package errors

type CustomError struct {
	Err string
}

func (c *CustomError) Error() string {
	return c.Err
}

var ERR_INVALID_USER_OR_PASSWORD *CustomError = &CustomError{Err: "ERR_INVALID_USER_OR_PASSWORD"}
var ERR_USER_NOT_LOGGED_IN *CustomError = &CustomError{Err: "ERR_USER_NOT_LOGGED_IN"}

var ERR_TOKEN_GENERATION_FAILED *CustomError = &CustomError{Err: "ERR_TOKEN_GENERATION_FAILED"}
var ERR_USER_INACTIVE *CustomError = &CustomError{Err: "ERR_USER_INACTIVE"}

var ERR_INAVLID_PRODUCT_PROPERTY *CustomError = &CustomError{Err: "ERR_INAVLID_PRODUCT_PROPERTY"}
var ERR_STOCK_NOT_AVAILABLE *CustomError = &CustomError{Err: "ERR_STOCK_NOT_AVAILABLE"}

var ERR_INAVLID_GRN_WAREHOUSE *CustomError = &CustomError{Err: "ERR_INAVLID_GRN_WAREHOUSE"}
var ERR_INAVLID_GRN_VENDOR *CustomError = &CustomError{Err: "ERR_INAVLID_GRN_VENDOR"}
var ERR_INVALID_GRN *CustomError = &CustomError{Err: "ERR_INVALID_GRN"}
var ERR_GRN_NO_PRODUCTS *CustomError = &CustomError{Err: "ERR_GRN_NO_PRODUCTS"}
var ERR_GRN_ALREADY_CONFIRMED *CustomError = &CustomError{Err: "ERR_GRN_ALREADY_CONFIRMED"}

var ERR_INVALID_ORDER *CustomError = &CustomError{Err: "ERR_INVALID_ORDER"}
var ERR_ORDER_ALREADY_CONFIRMED *CustomError = &CustomError{Err: "ERR_ORDER_ALREADY_CONFIRMED"}
var ERR_ORDER_ALREADY_CANCELLED *CustomError = &CustomError{Err: "ERR_ORDER_ALREADY_CANCELLED"}

var ERR_GRN_NOT_ENOUGH_INVENTORY *CustomError = &CustomError{Err: "ERR_GRN_NOT_ENOUGH_INVENTORY"}

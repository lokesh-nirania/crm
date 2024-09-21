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

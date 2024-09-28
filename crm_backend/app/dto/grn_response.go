package dto

import "crm-backend/app/model"

type GRNsPaginatedResponse struct {
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	TotalItems int64         `json:"total_items"`
	TotalPages int           `json:"total_pages"`
	GRNs       []GRNResponse `json:"grns"`
}

type SingleGRN struct {
	Status  string  `json:"status"`
	Source  string  `json:"source"`
	PO      bool    `json:"po"`
	Remarks float64 `json:"remakrs"`
}

type GRNFilter struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Metadata interface{} `json:"metadata"`
}

type GRNResponse struct {
	ID            int                  `json:"id"`
	Status        string               `json:"status"`
	Source        string               `json:"source"`
	PO            string               `json:"po"`
	Remarks       string               `json:"remarks"`
	Warehouse     GRNWarehouseResponse `json:"warehouse"`
	Vendor        GRNVendorResponse    `json:"vendor"`
	CreatedDate   string               `json:"created_at"`
	ExpectedDate  string               `json:"expected_date"`
	ConfirmedDate string               `json:"confirmed_date"`
	CreatedBy     model.User           `json:"created_by"`
	ConfirmedBy   *model.User          `json:"confirmed_by"`
}

type GRNWarehouseResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

type GRNVendorResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

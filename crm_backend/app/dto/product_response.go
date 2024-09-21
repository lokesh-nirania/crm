package dto

import "crm-backend/app/model"

type ProductsPaginatedResponse struct {
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalItems int64           `json:"total_items"`
	TotalPages int             `json:"total_pages"`
	Products   []model.Product `json:"products"`
}

type SingleProduct struct {
	SKU           string  `json:"sku"`
	Name          string  `json:"name"`
	Status        bool    `json:"status"`
	MRP           float64 `json:"mrp"`
	CostPrice     float64 `json:"cost_price"`
	SellPrice     float64 `json:"sell_price"`
	CategoryID    uint    `json:"category_id"`
	FitID         uint    `json:"fit_id"`
	VariantID     uint    `json:"variant_id"`
	ColorID       uint    `json:"color_id"`
	FabricID      uint    `json:"fabric_id"`
	SleeveID      uint    `json:"sleeve_id"`
	GenderID      uint    `json:"gender_id"`
	SizeVariantID uint    `json:"size_variant_id"`
	SourceID      uint    `json:"source_id"`
}

type Filter struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Metadata interface{} `json:"metadata"`
}

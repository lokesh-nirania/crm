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
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Status      bool    `json:"status"`
	MRP         float64 `json:"mrp"`
	CostPrice   float64 `json:"cost_price"`
	SellPrice   float64 `json:"sell_price"`
	CategoryID  uint    `json:"category_id"`
	FitID       uint    `json:"fit_id"`
	VariantID   uint    `json:"variant_id"`
	ColorID     uint    `json:"color_id"`
	FabricID    uint    `json:"fabric_id"`
	SleeveID    uint    `json:"sleeve_id"`
	GenderID    uint    `json:"gender_id"`
	SourceID    uint    `json:"source_id"`
	SizeVariant string  `json:"size_variant"`
}

type SingleProductWithSizeVariants struct {
	model.Product
	AvailableSizes []SpefificSizeVariant `json:"available_sizes"`
	AvailableSets  [][]int               `json:"available_sets"`
}

type ProductFilter struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Metadata interface{} `json:"metadata"`
}

type ProductSizeVariantsResponse struct {
	Status       string        `json:"status"`
	SizeVariants []SizeVariant `json:"size_variants"`
}

type SizeVariant struct {
	ID        int        `json:"id"`
	Variant   string     `json:"variant"`
	Name      string     `json:"name"`
	CreatedBy model.User `json:"created_by"`
}

type SpefificSizeVariant struct {
	ID        int        `json:"id"`
	Variant   string     `json:"variant"`
	Name      string     `json:"name"`
	Quantity  int        `json:"quantity"`
	CreatedBy model.User `json:"created_by"`
}

package dto

type AddProductRequest struct {
	SKU           string  `json:"sku" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Status        bool    `json:"status"`
	MRP           float64 `json:"mrp" binding:"required"`
	CostPrice     float64 `json:"cost_price" binding:"required"`
	SellPrice     float64 `json:"sell_price" binding:"required"`
	CategoryID    uint    `json:"category_id" binding:"required"`
	FitID         uint    `json:"fit_id" binding:"required"`
	VariantID     uint    `json:"variant_id" binding:"required"`
	ColorID       uint    `json:"color_id" binding:"required"`
	FabricID      uint    `json:"fabric_id" binding:"required"`
	SleeveID      uint    `json:"sleeve_id" binding:"required"`
	GenderID      uint    `json:"gender_id" binding:"required"`
	SizeVariantID uint    `json:"size_variant_id" binding:"required"`
	SourceID      uint    `json:"source_id" binding:"required"`
}

type AddProductPropertyRequest struct {
	Name string `json:"name" binding:"required"`
}

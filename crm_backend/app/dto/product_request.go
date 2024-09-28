package dto

import (
	"crm-backend/app/model"

	"github.com/go-playground/validator/v10"
)

type AddProductRequest struct {
	SKU         string                `json:"sku" binding:"required"`
	Name        string                `json:"name" binding:"required"`
	Status      bool                  `json:"status"`
	Desc        string                `json:"description"`
	MRP         float64               `json:"mrp" binding:"required"`
	CostPrice   float64               `json:"cost_price" binding:"required"`
	SellPrice   float64               `json:"sell_price" binding:"required"`
	CategoryID  uint                  `json:"category_id" binding:"required"`
	FitID       uint                  `json:"fit_id" binding:"required"`
	VariantID   uint                  `json:"variant_id" binding:"required"`
	ColorID     uint                  `json:"color_id" binding:"required"`
	FabricID    uint                  `json:"fabric_id" binding:"required"`
	SleeveID    uint                  `json:"sleeve_id" binding:"required"`
	GenderID    uint                  `json:"gender_id" binding:"required"`
	SourceID    uint                  `json:"source_id" binding:"required"`
	SizeVariant model.SizeVariantType `json:"size_variant" binding:"required,sizevariant"` // Custom validation tag
	ImageFileId string                `json:"image_file_id"`
}

type AddProductPropertyRequest struct {
	Name string `json:"name" binding:"required"`
}

func SizeVariantValidator(fl validator.FieldLevel) bool {
	sizeVariant := model.SizeVariantType(fl.Field().String())
	return sizeVariant == model.Alpha || sizeVariant == model.Numeric || sizeVariant == model.Free
}

package dto

import (
	"crm-backend/app/model"

	"github.com/go-playground/validator/v10"
)

type AddGRNRequest struct {
	ExpectedDate string           `json:"expected_date" binding:"required"`
	Status       model.StatusType `json:"status" binding:"required,grn_status"`
	Source       model.SourceType `json:"source" binding:"required,grn_source"`
	PO           string           `json:"po"`
	Remarks      string           `json:"remarks"`
	VendorID     int              `json:"vendor_id" binding:"required"`
	WarehouseID  int              `json:"warehouse_id" binding:"required"`
	Products     []AddGRNPRoduct  `json:"products" binding:"required"`
}

type AddGRNPRoduct struct {
	ID           int                        `json:"product_id" binding:"required"`
	SizeVariants []AddGRNProductSizeVariant `json:"size_variants" binding:"required"`
}

type AddGRNProductSizeVariant struct {
	ID       int `json:"id" binding:"required"`
	Quantity int `json:"quantity" binding:"required"`
}

type ConfirmGRNRequest struct {
	GRNID int `json:"grn_id" binding:"required"`
}

type AddWarehouseRequest struct {
	Name string `json:"name" binding:"required"`
	Code string `json:"code" binding:"required"`
}

type AddVendorRequest struct {
	Name string `json:"name" binding:"required"`
	Code string `json:"code" binding:"required"`
}

func GRNStatusValidator(fl validator.FieldLevel) bool {
	status := model.StatusType(fl.Field().String())
	return status == model.Pending || status == model.Confirmed
}

func GRNSourceValidator(fl validator.FieldLevel) bool {
	source := model.SourceType(fl.Field().String())
	return source == model.Internal || source == model.External
}

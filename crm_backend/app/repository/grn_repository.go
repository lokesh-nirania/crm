package repository

import (
	"crm-backend/app/errors"
	"crm-backend/app/model"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GRNRepository interface {
	GetFilteredGRNs(
		page, pageSize int,
		sortBy, sortOrder, status, source string,
		vendorIDs, warehouseIDs, creatorIDs, confirmerIDs []int,
	) (*[]model.GRN, int64, error)
	AddGRNWithProducts(ctx *gin.Context, grn *model.GRN, grnProducts *[]model.GRNProduct) (*model.GRN, error)
	ConfirmGRN(ctx *gin.Context, grnID uint, userID uint) (*model.GRN, error)

	GetGRNWarehouses(code string) (*[]model.Warehouse, error)
	AddGRNWarehouse(ctx *gin.Context, warehouse *model.Warehouse) (*model.Warehouse, error)

	GetGRNVendors(code string) (*[]model.Vendor, error)
	AddGRNVendor(ctx *gin.Context, warehouse *model.Vendor) (*model.Vendor, error)
}

type grnRepository struct {
	db *gorm.DB
}

func NewGRNRepository(db *gorm.DB) GRNRepository {
	return &grnRepository{db: db}
}

func (a *grnRepository) GetFilteredGRNs(
	page, pageSize int,
	sortBy, sortOrder, status, source string,
	vendorIDs, warehouseIDs, creatorIDs, confirmerIDs []int,
) (*[]model.GRN, int64, error) {
	var grn []model.GRN
	var totalItems int64

	if err := a.db.Preload("Vendor").
		Preload("Warehouse").
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		Find(&grn).Error; err != nil {
		return nil, 0, err
	}

	totalItems = int64(len(grn))
	return &grn, totalItems, nil
}

func (a *grnRepository) AddGRNWithProducts(ctx *gin.Context, grn *model.GRN, grnProducts *[]model.GRNProduct) (*model.GRN, error) {
	// Start a new transaction
	tx := a.db.Begin()

	// Create the GRN in the database
	if err := tx.Create(grn).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Set the GRNID for each GRNProduct
	for i := range *grnProducts {
		(*grnProducts)[i].GRNID = grn.ID
	}

	// Create the GRNProducts in the database
	if err := tx.Create(grnProducts).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit the transaction if everything is successful
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return grn, nil
}

func (a *grnRepository) ConfirmGRN(ctx *gin.Context, grnID uint, userID uint) (*model.GRN, error) {
	var grn model.GRN
	if err := a.db.Preload("Vendor").
		Preload("Warehouse").
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		First(&grn, grnID).Error; err != nil {
		return nil, errors.ERR_INVALID_GRN
	}

	// Check if ConfirmedBy and ConfirmedDate are null
	if grn.ConfirmedByID == nil && grn.ConfirmedDate == nil && grn.Status == string(model.Pending) {
		// Update ConfirmedDate to today and ConfirmedByID to given userID
		now := time.Now()
		grn.ConfirmedDate = &now
		grn.ConfirmedByID = &userID
		grn.Status = string(model.Confirmed)

		// Save the updates to the database
		if err := a.db.Save(&grn).Error; err != nil {
			return nil, err
		}
	} else {
		// Return null or error if ConfirmedBy or ConfirmedDate is already set
		return nil, errors.ERR_GRN_ALREADY_CONFIRMED
	}

	// Return the updated GRN model
	return &grn, nil
}

func (a *grnRepository) GetGRNWarehouses(code string) (*[]model.Warehouse, error) {
	var warehouses []model.Warehouse

	if code == "" {
		if err := a.db.
			Find(&warehouses).Error; err != nil {
			return nil, err
		}
	} else {
		if err := a.db.Where("code = ?", code).Find(&warehouses).Error; err != nil {
			return nil, err
		}
	}

	return &warehouses, nil
}

func (p *grnRepository) AddGRNWarehouse(ctx *gin.Context, warehouse *model.Warehouse) (*model.Warehouse, error) {
	// Start a new transaction
	tx := p.db.Begin()

	// Create the Product in the database
	if err := tx.Create(warehouse).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit the transaction if everything is successful
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return warehouse, nil
}

func (a *grnRepository) GetGRNVendors(code string) (*[]model.Vendor, error) {
	var vendors []model.Vendor

	if code == "" {
		if err := a.db.Find(&vendors).Error; err != nil {
			return nil, err
		}
	} else {
		if err := a.db.Where("code = ?", code).Find(&vendors).Error; err != nil {
			return nil, err
		}
	}

	return &vendors, nil
}

func (p *grnRepository) AddGRNVendor(ctx *gin.Context, vendor *model.Vendor) (*model.Vendor, error) {
	// Start a new transaction
	tx := p.db.Begin()

	// Create the Product in the database
	if err := tx.Create(vendor).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit the transaction if everything is successful
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return vendor, nil
}

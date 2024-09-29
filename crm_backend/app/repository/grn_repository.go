package repository

import (
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"errors"
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

	query := a.db.Model(&model.GRN{})

	query.Count(&totalItems)

	query = query.Order(sortBy + " " + sortOrder)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).
		Preload("Vendor").
		Preload("Warehouse").
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		Find(&grn).Error; err != nil {
		return nil, 0, err
	}

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
		Preload("GRNProducts").
		First(&grn, grnID).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_GRN
	}

	// Check if ConfirmedBy and ConfirmedDate are null
	if grn.ConfirmedByID != nil || grn.ConfirmedDate != nil || grn.Status != string(model.Pending) {
		return nil, crmErrors.ERR_GRN_ALREADY_CONFIRMED
	}

	// Start a transaction
	err := a.db.Transaction(func(tx *gorm.DB) error {
		// Step 1: Update GRN to confirmed status
		now := time.Now()
		grn.ConfirmedDate = &now
		grn.ConfirmedByID = &userID
		grn.Status = string(model.Confirmed)

		// Save the updates to the GRN
		if err := tx.Save(&grn).Error; err != nil {
			return err
		}

		// Step 2: Loop through GRNProducts and update the inventory
		for _, grnProduct := range grn.GRNProducts {
			var inventory model.Inventory

			// Check if an inventory record exists for this product and size variant
			if err := tx.Where("product_id = ? AND size_variant_id = ?", grnProduct.ProductID, grnProduct.SizeVariantID).First(&inventory).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					// Inventory record does not exist, create a new one
					inventory = model.Inventory{
						ProductID:     grnProduct.ProductID,
						SizeVariantID: grnProduct.SizeVariantID,
						Quantity:      grnProduct.Quantity, // Set initial quantity
					}
					if err := tx.Create(&inventory).Error; err != nil {
						return err
					}
				} else {
					// An unexpected error occurred
					return err
				}
			} else {
				// Inventory record exists, increase the quantity
				inventory.Quantity += grnProduct.Quantity
				if err := tx.Save(&inventory).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})

	// If the transaction fails, return the error
	if err != nil {
		return nil, err
	}

	if err := a.db.Preload("Vendor").
		Preload("Warehouse").
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		Preload("GRNProducts").
		First(&grn, grnID).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_GRN
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

// app/models/inventory.go
package model

import (
	"gorm.io/gorm"
)

type Inventory struct {
	gorm.Model
	ProductID uint    `gorm:"not null;uniqueIndex:idx_product_size"` // Foreign key to the Product table
	Product   Product `gorm:"foreignKey:ProductID"`                  // Reference to Product table

	SizeVariantID uint        `gorm:"not null;uniqueIndex:idx_product_size"` // Foreign key to the SizeVariant table
	SizeVariant   SizeVariant `gorm:"foreignKey:SizeVariantID"`              // Reference to SizeVariant table

	Quantity int `gorm:"not null"` // Total quantity in stock

	LastUpdated *gorm.DeletedAt // Timestamp when the inventory was last updated
}

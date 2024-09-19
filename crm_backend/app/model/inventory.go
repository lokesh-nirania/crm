// app/models/inventory.go
package model

import (
	"gorm.io/gorm"
)

type Inventory struct {
	gorm.Model
	ProductID   uint            `gorm:"not null"`
	Product     Product         `gorm:"foreignKey:ProductID"` // Foreign key to the Product table
	Quantity    int             `gorm:"not null"`             // Total quantity in stock
	LastUpdated *gorm.DeletedAt // Timestamp when the inventory was last updated
}

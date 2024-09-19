package model

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model          // Adds ID, CreatedAt, UpdatedAt, DeletedAt
	SKU         string  `gorm:"size:100;not null;unique"` // SKU column, must be unique
	Name        string  `gorm:"size:255;not null"`        // Product name
	Description string  `gorm:"type:text"`                // Product description
	Price       float64 `gorm:"not null"`                 // Product price
}

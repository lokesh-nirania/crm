// app/models/grn.go
package model

import (
	"time"

	"gorm.io/gorm"
)

type GRN struct {
	gorm.Model
	ProductID     uint       `gorm:"not null"` // Foreign key to the Product table
	Product       Product    `gorm:"foreignKey:ProductID"`
	ExpectedDate  time.Time  `gorm:"not null"` // Expected date of product arrival
	Quantity      int        `gorm:"not null"` // Expected quantity
	ConfirmedDate *time.Time // Date when the GRN is confirmed (can be null)
	Status        string     `gorm:"type:enum('pending', 'confirmed');default:'pending'"` // Status of the GRN
	CreatedBy     uint       `gorm:"not null"`                                            // User ID who created the GRN (foreign key to User)
	ConfirmedBy   *uint      // User ID who confirmed the GRN (can be null)
}

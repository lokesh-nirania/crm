package model

import (
	"time"

	"gorm.io/gorm"
)

type StatusType string

const (
	Pending   StatusType = "Pending"
	Confirmed StatusType = "Confirmed"
)

type SourceType string

const (
	Internal SourceType = "Internal"
	External SourceType = "External"
)

type GRN struct {
	gorm.Model
	ExpectedDate  time.Time  `gorm:"not null"` // Expected date of product arrival
	ConfirmedDate *time.Time // Date when the GRN is confirmed (can be null)
	Status        string     `gorm:"type:enum('Pending', 'Confirmed');default:'Pending'"`  // Status of the GRN
	Source        string     `gorm:"type:enum('Internal', 'External');default:'Internal'"` // Source of the GRN
	PO            string     `gorm:"size:100;not null" json:"po_no"`
	Remarks       string     `gorm:"size:255;not null" json:"remarks"`

	VendorID uint   `gorm:"not null"`
	Vendor   Vendor `gorm:"foreignKey:VendorID" json:"vendor"`

	WarehouseID uint      `gorm:"not null"`
	Warehouse   Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse"`

	CreatedByID uint `gorm:"not null"` // User ID who created the GRN (foreign key to User)
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"created_by"`

	ConfirmedByID *uint `gorm:"not null"` // User ID who confirmed the GRN (can be null)
	ConfirmedBy   *User `gorm:"foreignKey:ConfirmedByID" json:"confirmed_by"`

	GRNProducts []GRNProduct `gorm:"foreignKey:GRNID"` // Explicit relationship to GRNProduct table
}

type GRNProduct struct {
	gorm.Model
	GRNID uint `gorm:"not null"` // Foreign key to the GRN
	GRN   GRN  `gorm:"foreignKey:GRNID"`

	ProductID uint    `gorm:"not null"` // Foreign key to the Product
	Product   Product `gorm:"foreignKey:ProductID"`

	SizeVariantID uint        `gorm:"not null"`
	SizeVariant   SizeVariant `gorm:"foreignKey:SizeVariantID" json:"-"`

	Quantity int `gorm:"not null"` // Quantity of this specific product in this GRN
}

// SizeVariant model
type SizeVariant struct {
	gorm.Model
	Variant         SizeVariantType `gorm:"type:enum('Alpha', 'Numeric', 'Free'); not null" json:"variant"` // Enum for size variant type
	ProductProperty                 // Size label, e.g., XS, S, M, 38, etc.
}

type Vendor struct {
	gorm.Model
	Name string `gorm:"size:100;not null;unique" json:"name"`
	Code string `gorm:"size:100;not null;unique" json:"code"`

	CreatedByID uint `gorm:"not null"` // User ID who created the GRN (foreign key to User)
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"-"`
}

type Warehouse struct {
	gorm.Model
	Name string `gorm:"size:100;not null;unique" json:"name"`
	Code string `gorm:"size:100;not null;unique" json:"code"`

	CreatedByID uint `gorm:"not null"` // User ID who created the GRN (foreign key to User)
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"-"`
}

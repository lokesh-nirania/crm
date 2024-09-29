// app/models/inventory.go
package model

import (
	"time"

	"gorm.io/gorm"
)

type OrderStatusType string

const (
	OrderStatusPending   StatusType = "Pending"
	OrderStatusConfirmed StatusType = "Confirmed"
	OrderStatusCancelled StatusType = "Cancelled"
)

type Order struct {
	gorm.Model
	Status        string     `gorm:"type:enum('Pending', 'Confirmed', 'Cancelled');default:'Pending'"`
	Price         int        `gorm:"not null"`
	ConfirmedDate *time.Time // Date when the GRN is confirmed (can be null)
	CancelledDate *time.Time // Date when the GRN is confirmed (can be null)

	CreatedByID uint `json:"-"`
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"created_by"`

	CreatedForID uint `json:"-"`
	CreatedFor   User `gorm:"foreignKey:CreatedForID" json:"created_for"`

	ConfirmedByID *uint // User ID who confirmed the GRN (can be null)
	ConfirmedBy   *User `gorm:"foreignKey:ConfirmedByID" json:"confirmed_by"`

	CancelledByID *uint //
	CancelledBy   *User `gorm:"foreignKey:CancelledByID" json:"cancelled_by"`

	OrderProducts []OrderProduct `gorm:"foreignKey:OrderID"`
}

type OrderProduct struct {
	gorm.Model
	OrderID uint  `gorm:"not null;uniqueIndex:idx_order_product_size"` // Foreign key to the GRN
	Order   Order `gorm:"foreignKey:OrderID"`

	ProductID uint    `gorm:"not null;uniqueIndex:idx_order_product_size"` // Foreign key to the Product
	Product   Product `gorm:"foreignKey:ProductID"`

	SizeVariant1ID uint        `gorm:"not null;uniqueIndex:idx_order_product_size"`
	SizeVariant1   SizeVariant `gorm:"foreignKey:SizeVariant1ID" json:"size_variant_1"`

	SizeVariant2ID *uint
	SizeVariant2   *SizeVariant `gorm:"foreignKey:SizeVariant2ID" json:"size_variant_2"`

	SizeVariant3ID *uint
	SizeVariant3   *SizeVariant `gorm:"foreignKey:SizeVariant3ID" json:"size_variant_3"`

	Quantity int `gorm:"not null"` // Quantity of this specific product in this GRN
	Price    int `gorm:"not null"`
}

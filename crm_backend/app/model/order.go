// app/models/inventory.go
package model

import (
	"gorm.io/gorm"
)

type OrderStatusType string

const (
	OrderStatusPending   StatusType = "Pending"
	OrderStatusConfirmed StatusType = "Confirmed"
)

type Order struct {
	gorm.Model
	Status string `gorm:"type:enum('Pending', 'Confirmed');default:'Pending'"`
	Price  int    `gorm:"not null"`

	CreatedByID uint `json:"-"`
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"created_by"`

	CreatedForID uint `json:"-"`
	CreatedFor   User `gorm:"foreignKey:CreatedForID" json:"created_for"`

	OrderProducts []OrderProduct `gorm:"foreignKey:OrderID"`
}

type OrderProduct struct {
	gorm.Model
	OrderID uint  `gorm:"not null;uniqueIndex:idx_order_product_size"` // Foreign key to the GRN
	Order   Order `gorm:"foreignKey:OrderID"`

	ProductID uint    `gorm:"not null;uniqueIndex:idx_order_product_size"` // Foreign key to the Product
	Product   Product `gorm:"foreignKey:ProductID"`

	SizeVariant1ID uint        `gorm:"not null;uniqueIndex:idx_order_product_size"`
	SizeVariant1   SizeVariant `gorm:"foreignKey:SizeVariant1ID" json:"-"`

	SizeVariant2ID uint        `gorm:"not null;uniqueIndex:idx_order_product_size"`
	SizeVariant2   SizeVariant `gorm:"foreignKey:SizeVariant2ID" json:"-"`

	SizeVariant3ID uint        `gorm:"not null;uniqueIndex:idx_order_product_size"`
	SizeVariant3   SizeVariant `gorm:"foreignKey:SizeVariant3ID" json:"-"`

	Quantity int `gorm:"not null"` // Quantity of this specific product in this GRN
	Price    int `gorm:"not null"`
}

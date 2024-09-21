package model

import (
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	SKU       string  `gorm:"size:100;not null;unique" json:"sku"`
	Name      string  `gorm:"size:255;not null" json:"name"`
	Status    bool    `gorm:"default:true" json:"status"` // Active/inactive product status
	MRP       float64 `gorm:"not null" json:"mrp"`        // Maximum Retail Price
	CostPrice float64 `gorm:"not null" json:"cost_price"` // Custom field name in JSON response
	SellPrice float64 `gorm:"not null" json:"sell_price"`

	// Foreign keys to the new tables
	CategoryID uint            `json:"-"` // Foreign key to the Category table
	Category   ProductCategory `gorm:"foreignKey:CategoryID" json:"category"`

	FitID uint       `json:"-"` // Foreign key to the Fit table
	Fit   ProductFit `gorm:"foreignKey:FitID" json:"fit"`

	VariantID uint           `json:"-"` // Foreign key to the Variant table
	Variant   ProductVariant `gorm:"foreignKey:VariantID" json:"variant"`

	ColorID uint         `json:"-"` // Foreign key to the Color table
	Color   ProductColor `gorm:"foreignKey:ColorID" json:"color"`

	FabricID uint          `json:"-"` // Foreign key to the Fabric table
	Fabric   ProductFabric `gorm:"foreignKey:FabricID" json:"fabric"`

	SleeveID uint          `json:"-"` // Foreign key to the Sleeve table
	Sleeve   ProductSleeve `gorm:"foreignKey:SleeveID" json:"sleeve"`

	GenderID uint          `json:"-"` // Foreign key to the Gender table
	Gender   ProductGender `gorm:"foreignKey:GenderID" json:"gender"`

	SizeVariantID uint               `json:"-"` // Foreign key to the SizeVariant table
	SizeVariant   ProductSizeVariant `gorm:"foreignKey:SizeVariantID" json:"size_variant"`

	SourceID uint          `json:"-"` // Foreign key to the Source table
	Source   ProductSource `gorm:"foreignKey:SourceID" json:"source"`

	CreatedByID uint `json:"-"`                               // Foreign key for the user who created the product
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"-"` // Reference to User table

	LastModifiedByID uint `json:"-"`                                    // Foreign key for the user who last modified the product
	LastModifiedBy   User `gorm:"foreignKey:LastModifiedByID" json:"-"` // Reference to User table
}

type ProductProperty struct {
	Name        string `gorm:"size:100;not null;unique" json:"name"`
	CreatedByID uint   `json:"-"` // Foreign key to the user who created this property
	CreatedBy   User   `gorm:"foreignKey:CreatedByID" json:"-"`
}

// ProductCategory model
type ProductCategory struct {
	gorm.Model
	ProductProperty
}

// ProductFit model
type ProductFit struct {
	gorm.Model
	ProductProperty
}

// ProductVariant model
type ProductVariant struct {
	gorm.Model
	ProductProperty
}

// ProductColor model
type ProductColor struct {
	gorm.Model
	ProductProperty
}

// ProductFabric model
type ProductFabric struct {
	gorm.Model
	ProductProperty
}

// ProductSleeve model
type ProductSleeve struct {
	gorm.Model
	ProductProperty
}

// ProductGender model
type ProductGender struct {
	gorm.Model
	ProductProperty
}

// ProductSizeVariant model
type ProductSizeVariant struct {
	gorm.Model
	ProductProperty
}

// ProductSource model
type ProductSource struct {
	gorm.Model
	ProductProperty
}

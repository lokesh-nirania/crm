package model

import (
	"gorm.io/gorm"
)

// Enum for Size Variant Types
type SizeVariantType string

const (
	Alpha   SizeVariantType = "Alpha"
	Numeric SizeVariantType = "Numeric"
	Free    SizeVariantType = "Free"
)

type Product struct {
	gorm.Model
	SKU       string  `gorm:"size:100;not null;unique" json:"sku"`
	Name      string  `gorm:"size:255;not null" json:"name"`
	Status    bool    `gorm:"default:true" json:"status"` // Active/inactive product status
	Desc      string  `gorm:"size:255;not null;" json:"description"`
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

	SizeVariant SizeVariantType `gorm:"type:enum('Alpha', 'Numeric', 'Free'); not null" json:"size_variant"` // Enum for size variant type

	SourceID uint          `json:"-"` // Foreign key to the Source table
	Source   ProductSource `gorm:"foreignKey:SourceID" json:"source"`

	GRNProducts []GRNProduct   `gorm:"foreignKey:ProductID"` // Explicit relationship to GRNProduct table
	Images      []ProductImage `gorm:"foreignKey:ProductID" json:"images"`
	ImageFileID string         `gorm:"size:100" json:"image_file_id"`

	CreatedByID uint `json:"-"`                               // Foreign key for the user who created the product
	CreatedBy   User `gorm:"foreignKey:CreatedByID" json:"-"` // Reference to User table

	LastModifiedByID uint `json:"-"`                                    // Foreign key for the user who last modified the product
	LastModifiedBy   User `gorm:"foreignKey:LastModifiedByID" json:"-"` // Reference to User table
}

type ProductImage struct {
	gorm.Model
	ProductID uint    `json:"product_id"` // Foreign key to the Product table
	Product   Product `gorm:"foreignKey:ProductID" json:"-"`
	FileID    string  `gorm:"size:255;not null" json:"file_id"` // SeaweedFS file ID
	URL       string  `json:"url"`
	Position  int     `json:"position"` // Ordering of images for the product
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

// ProductSource model
type ProductSource struct {
	gorm.Model
	ProductProperty
}

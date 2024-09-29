package repository

import (
	"crm-backend/app/dto"
	"crm-backend/app/errors"
	"crm-backend/app/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProductRepo interface {
	GetAllProducts() (*[]model.Product, error)
	GetFilteredProducts(
		page, pageSize int,
		sortBy, sortOrder, name, status string,
		mrpMin, mrpMax float64,
		categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sourceID []int,
		sizeVariant string,
	) (*[]model.Product, int64, error)

	GetProductProperties(property string) (map[string]interface{}, error)
	GetProductFilters(filters []dto.ProductFilter) ([]dto.ProductFilter, error)
	GetProductSizeVariants(varaintName string) (*[]model.SizeVariant, error)

	AddProduct(c *gin.Context, product *model.Product) (*model.Product, error)
	AddProductProperty(c *gin.Context, property interface{}) (interface{}, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepo {
	return &productRepository{db: db}
}

func (p *productRepository) GetAllProducts() (*[]model.Product, error) {
	var products []model.Product
	if err := p.db.
		Preload("Category").
		Preload("Fit").
		Preload("Variant").
		Preload("Color").
		Preload("Fabric").
		Preload("Sleeve").
		Preload("Gender").
		Preload("Source").
		Find(&products).Error; err != nil {
		return nil, err
	}

	return &products, nil
}

func (p *productRepository) GetFilteredProducts(
	page, pageSize int,
	sortBy, sortOrder, name, status string,
	mrpMin, mrpMax float64,
	categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sourceID []int,
	sizeVariant string,
) (*[]model.Product, int64, error) {

	var products []model.Product
	var totalItems int64

	query := p.db.Model(&model.Product{})

	// Apply filters
	if name != "" {
		query = query.Where("name LIKE ? OR sku LIKE ?", "%"+name+"%", "%"+name+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if mrpMax > 0 {
		query = query.Where("mrp BETWEEN ? AND ?", mrpMin, mrpMax)
	}
	if len(categoryID) > 0 {
		query = query.Where("category_id IN ?", categoryID)
	}
	if len(fitID) > 0 {
		query = query.Where("fit_id IN ?", fitID)
	}
	if len(variantID) > 0 {
		query = query.Where("variant_id IN ?", variantID)
	}
	if len(colorID) > 0 {
		query = query.Where("color_id IN ?", colorID)
	}
	if len(fabricID) > 0 {
		query = query.Where("fabric_id IN ?", fabricID)
	}
	if len(sleeveID) > 0 {
		query = query.Where("sleeve_id IN ?", sleeveID)
	}
	if len(genderID) > 0 {
		query = query.Where("gender_id IN ?", genderID)
	}
	if len(sourceID) > 0 {
		query = query.Where("source_id IN ?", sourceID)
	}
	if sizeVariant != "" {
		query = query.Where("size_variant = ?", sizeVariant)
	}

	query.Count(&totalItems)

	// Sorting
	query = query.Order(sortBy + " " + sortOrder)

	// Pagination
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).
		Preload("Category").
		Preload("Fit").
		Preload("Variant").
		Preload("Color").
		Preload("Fabric").
		Preload("Sleeve").
		Preload("Gender").
		Preload("Source").
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return &products, totalItems, nil
}

func (p *productRepository) GetProductSizeVariants(variantName string) (*[]model.SizeVariant, error) {
	var sizeVariants []model.SizeVariant

	// Pass a pointer to the slice
	if err := p.db.
		Model(&model.SizeVariant{}).
		Where("variant = ?", variantName).
		Find(&sizeVariants).Error; err != nil {
		return nil, err
	}

	return &sizeVariants, nil
}

func (p *productRepository) GetProductProperties(property string) (map[string]interface{}, error) {
	// Initialize a map to store the properties dynamically
	propertyMap := map[string]interface{}{
		"categories": &[]model.ProductCategory{},
		"fits":       &[]model.ProductFit{},
		"variants":   &[]model.ProductVariant{},
		"colors":     &[]model.ProductColor{},
		"fabrics":    &[]model.ProductFabric{},
		"sleeves":    &[]model.ProductSleeve{},
		"genders":    &[]model.ProductGender{},
		"sources":    &[]model.ProductSource{},
	}

	// If "all" is requested, fetch all the properties
	if property == "all" {
		// Iterate over all properties and fetch data
		for _, prop := range propertyMap {
			if err := p.db.Find(prop).Error; err != nil {
				return nil, err
			}
		}

		for _, prop := range propertyMap {
			if err := p.db.Find(prop).Error; err != nil {
				return nil, err
			}
		}
		// Return the entire map of properties
		return propertyMap, nil
	}

	// Handle individual property requests
	properties, exists := propertyMap[property]
	if !exists {
		return nil, errors.ERR_INAVLID_PRODUCT_PROPERTY
	}

	// Fetch the specific property data
	if err := p.db.Find(properties).Error; err != nil {
		return nil, err
	}

	// Return the result as a map
	return map[string]interface{}{
		property: properties,
	}, nil
}

func (p *productRepository) GetProductFilters(filters []dto.ProductFilter) ([]dto.ProductFilter, error) {
	for _, prop := range filters {
		if prop.Type == "property" {
			if err := p.db.Find(prop.Metadata).Error; err != nil {
				return nil, err
			}
		}

	}

	return filters, nil
}

func (p *productRepository) AddProduct(c *gin.Context, product *model.Product) (*model.Product, error) {
	// Start a new transaction
	tx := p.db.Begin()

	// Create the Product in the database
	if err := tx.Create(product).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	var sizeVariants []model.SizeVariant
	if err := tx.Where("variant = ?", product.SizeVariant).Find(&sizeVariants).Error; err != nil {
		return nil, err
	}

	for _, sizeVariant := range sizeVariants {
		inventory := model.Inventory{
			ProductID:     product.ID,
			SizeVariantID: sizeVariant.ID,
		}

		if err := tx.Create(&inventory).Error; err != nil {
			return nil, err
		}
	}

	// Commit the transaction if everything is successful
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return product, nil
}

func (p *productRepository) AddProductProperty(c *gin.Context, property interface{}) (interface{}, error) {
	if err := p.db.Create(property).Error; err != nil {
		return nil, err
	}
	return property, nil
}

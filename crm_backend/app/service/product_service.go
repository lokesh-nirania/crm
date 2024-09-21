package service

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"crm-backend/app/repository"

	"github.com/gin-gonic/gin"
)

type ProductService interface {
	GetAllProducts() (*[]model.Product, error)
	GetFilteredProducts(
		page, pageSize int,
		sortBy, sortOrder, name, status string,
		mrpMin, mrpMax float64,
		categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sizeVariantID, sourceID []int,
	) (*dto.ProductsPaginatedResponse, error)
	GetProductProperties(property string) (interface{}, error)
	GetProductFilters() ([]dto.Filter, error)
	AddProduct(c *gin.Context, product dto.AddProductRequest) (*model.Product, error)
	AddProductProperty(c *gin.Context, name string, value dto.AddProductPropertyRequest) (interface{}, error)
}

type productService struct {
	productRepo repository.ProductRepo
}

func NewProductService(productRepo repository.ProductRepo) ProductService {
	return &productService{productRepo: productRepo}
}

func (p *productService) GetAllProducts() (*[]model.Product, error) {
	products, err := p.productRepo.GetAllProducts()
	if err != nil {
		return nil, err
	}

	return products, nil
}

func (p *productService) GetFilteredProducts(
	page, pageSize int,
	sortBy, sortOrder, name, status string,
	mrpMin, mrpMax float64,
	categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sizeVariantID, sourceID []int,
) (*dto.ProductsPaginatedResponse, error) {
	products, totalItems, err := p.productRepo.GetFilteredProducts(
		page, pageSize,
		sortBy, sortOrder, name, status,
		mrpMin, mrpMax,
		categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sizeVariantID, sourceID,
	)
	if err != nil {
		return nil, err
	}

	resp := &dto.ProductsPaginatedResponse{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: int((totalItems + int64(pageSize) - 1) / int64(pageSize)),
		Products:   *products,
	}

	return resp, nil
}

func (p *productService) GetProductProperties(property string) (interface{}, error) {
	properties, err := p.productRepo.GetProductProperties(property)
	if err != nil {
		return nil, err
	}

	return properties, nil
}

func (p *productService) GetProductFilters() ([]dto.Filter, error) {
	filters := []dto.Filter{
		{
			Name:     "category",
			Type:     "list",
			Metadata: &[]model.ProductCategory{},
		},
		{
			Name:     "fit",
			Type:     "list",
			Metadata: &[]model.ProductFit{},
		},
		{
			Name:     "variant",
			Type:     "list",
			Metadata: &[]model.ProductVariant{},
		},
		{
			Name:     "color",
			Type:     "list",
			Metadata: &[]model.ProductColor{},
		},
		{
			Name:     "fabric",
			Type:     "list",
			Metadata: &[]model.ProductFabric{},
		},
		{
			Name:     "sleeve",
			Type:     "list",
			Metadata: &[]model.ProductSleeve{},
		},
		{
			Name:     "gender",
			Type:     "list",
			Metadata: &[]model.ProductGender{},
		},
		{
			Name:     "size_variant",
			Type:     "list",
			Metadata: &[]model.ProductSizeVariant{},
		},
		{
			Name:     "source",
			Type:     "list",
			Metadata: &[]model.ProductSource{},
		},
		{
			Name: "name",
			Type: "like",
		},
		{
			Name: "mrp",
			Type: "range",
		},
		{
			Name: "cost_price",
			Type: "range",
		},
		{
			Name: "sell_price",
			Type: "range",
		},
		{
			Name: "sell_price",
			Type: "range",
		},
	}

	return p.productRepo.GetProductFilters(filters)
}

func (p *productService) AddProduct(c *gin.Context, product dto.AddProductRequest) (*model.Product, error) {
	userId, exists := c.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	productModel := &model.Product{
		SKU:              product.SKU,
		Name:             product.Name,
		Status:           product.Status,
		MRP:              product.MRP,
		CostPrice:        product.CostPrice,
		SellPrice:        product.SellPrice,
		CategoryID:       product.CategoryID,
		FitID:            product.FitID,
		VariantID:        product.VariantID,
		ColorID:          product.ColorID,
		FabricID:         product.FabricID,
		SleeveID:         product.SleeveID,
		GenderID:         product.GenderID,
		SizeVariantID:    product.SizeVariantID,
		SourceID:         product.SourceID,
		CreatedByID:      userId.(uint),
		LastModifiedByID: userId.(uint),
	}

	savedProduct, err := p.productRepo.AddProduct(c, productModel)
	if err != nil {
		return nil, err
	}
	return savedProduct, nil
}

func (p *productService) AddProductProperty(c *gin.Context, name string, value dto.AddProductPropertyRequest) (interface{}, error) {
	userId, exists := c.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	productProperty := model.ProductProperty{
		Name:        value.Name,
		CreatedByID: userId.(uint),
	}

	var productPropertyDBModel interface{}

	switch name {
	case "category":
		productPropertyDBModel = &model.ProductCategory{ProductProperty: productProperty}
	case "color":
		productPropertyDBModel = &model.ProductColor{ProductProperty: productProperty}
	case "fabric":
		productPropertyDBModel = &model.ProductFabric{ProductProperty: productProperty}
	case "fit":
		productPropertyDBModel = &model.ProductFit{ProductProperty: productProperty}
	case "gender":
		productPropertyDBModel = &model.ProductGender{ProductProperty: productProperty}
	case "size_variant":
		productPropertyDBModel = &model.ProductSizeVariant{ProductProperty: productProperty}
	case "source":
		productPropertyDBModel = &model.ProductSource{ProductProperty: productProperty}
	case "sleeve":
		productPropertyDBModel = &model.ProductSleeve{ProductProperty: productProperty}
	case "variant":
		productPropertyDBModel = &model.ProductVariant{ProductProperty: productProperty}
	default:
		productPropertyDBModel = nil
	}

	if productPropertyDBModel == nil {
		return nil, crmErrors.ERR_INAVLID_PRODUCT_PROPERTY
	}

	savedProperty, err := p.productRepo.AddProductProperty(c, productPropertyDBModel)
	if err != nil {
		return nil, err
	}
	return savedProperty, nil
}

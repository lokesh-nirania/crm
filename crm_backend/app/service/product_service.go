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
		categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sourceID []int,
		sizeVariant string,
	) (*dto.ProductsPaginatedResponse, error)
	GetProductAttributes(attribute string) (interface{}, interface{}, error)
	GetProductFilters() ([]dto.ProductFilter, error)
	GetProductSizeVariants(varaintName string) (*dto.ProductSizeVariantsResponse, error)
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
	categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sourceID []int,
	sizeVariant string,
) (*dto.ProductsPaginatedResponse, error) {
	products, totalItems, err := p.productRepo.GetFilteredProducts(
		page, pageSize,
		sortBy, sortOrder, name, status,
		mrpMin, mrpMax,
		categoryID, fitID, variantID, colorID, fabricID, sleeveID, genderID, sourceID,
		sizeVariant,
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

func (p *productService) GetProductSizeVariants(varaintName string) (*dto.ProductSizeVariantsResponse, error) {
	size_variants, err := p.productRepo.GetProductSizeVariants(varaintName)
	if err != nil {
		return nil, err
	}

	sizeVariantResp := &dto.ProductSizeVariantsResponse{}
	for _, sv := range *size_variants {
		sizeVariantResp.SizeVariants = append(sizeVariantResp.SizeVariants, dto.SizeVariant{
			ID:        int(sv.ID),
			Variant:   string(sv.Variant),
			Name:      sv.Name,
			CreatedBy: sv.CreatedBy,
		})
	}
	return sizeVariantResp, nil
}

func (p *productService) GetProductAttributes(attribute string) (interface{}, interface{}, error) {
	properties, err := p.productRepo.GetProductProperties(attribute)

	if err != nil && err != crmErrors.ERR_INAVLID_PRODUCT_PROPERTY {
		return nil, nil, err
	}

	listMap := map[string]interface{}{
		"size_variants": &[]model.SizeVariantType{model.Alpha, model.Numeric, model.Free},
	}

	lists, exists := listMap[attribute]
	if exists && (attribute != "all") {
		return nil, map[string]interface{}{
			attribute: lists,
		}, nil
	}

	return properties, listMap, nil
}

func (p *productService) GetProductFilters() ([]dto.ProductFilter, error) {
	filters := []dto.ProductFilter{
		{
			Name:     "category",
			Type:     "property",
			Metadata: &[]model.ProductCategory{},
		},
		{
			Name:     "fit",
			Type:     "property",
			Metadata: &[]model.ProductFit{},
		},
		{
			Name:     "variant",
			Type:     "property",
			Metadata: &[]model.ProductVariant{},
		},
		{
			Name:     "color",
			Type:     "property",
			Metadata: &[]model.ProductColor{},
		},
		{
			Name:     "fabric",
			Type:     "property",
			Metadata: &[]model.ProductFabric{},
		},
		{
			Name:     "sleeve",
			Type:     "property",
			Metadata: &[]model.ProductSleeve{},
		},
		{
			Name:     "gender",
			Type:     "property",
			Metadata: &[]model.ProductGender{},
		},
		{
			Name:     "source",
			Type:     "property",
			Metadata: &[]model.ProductSource{},
		},
		{
			Name: "size_variant",
			Type: "list",
			Metadata: &[]model.SizeVariantType{
				model.Alpha, model.Numeric, model.Free,
			},
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
		Desc:             product.Desc,
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
		SourceID:         product.SourceID,
		SizeVariant:      product.SizeVariant,
		CreatedByID:      userId.(uint),
		LastModifiedByID: userId.(uint),
		ImageFileID:      product.ImageFileId,
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

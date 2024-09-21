package controller

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"strconv"
	"strings"

	"crm-backend/app/service"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ProductCtrl struct {
	productService service.ProductService
}

func NewProductCtrl(productService service.ProductService) *ProductCtrl {
	return &ProductCtrl{productService: productService}
}

func (ctrl *ProductCtrl) GetAllProducts(c *gin.Context) {

	products, err := ctrl.productService.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}

func (ctrl *ProductCtrl) GetAllProductsV2(c *gin.Context) {
	// Pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	// Sorting params
	sortBy := c.DefaultQuery("sortBy", "created_at") // Default sort by name
	sortOrder := c.DefaultQuery("sortOrder", "desc") // Default ascending order

	// Filters
	name := c.Query("name")     // For LIKE operator
	status := c.Query("status") // Boolean filter
	mrpMin, _ := strconv.ParseFloat(c.DefaultQuery("mrpMin", "0"), 64)
	mrpMax, _ := strconv.ParseFloat(c.Query("mrpMax"), 64)

	categoryParam := c.Query("category") // Comma-separated category IDs
	var categoryIDs []int
	if categoryParam != "" {
		categoryStrs := strings.Split(categoryParam, ",")
		for _, catStr := range categoryStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				categoryIDs = append(categoryIDs, catID)
			}
		}
	}

	fitParam := c.Query("fit") // Comma-separated fit IDs
	var fitIDs []int
	if fitParam != "" {
		fitStrs := strings.Split(fitParam, ",")
		for _, catStr := range fitStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				fitIDs = append(fitIDs, catID)
			}
		}
	}

	variantParam := c.Query("variant") // Comma-separated variant IDs
	var variantIDs []int
	if variantParam != "" {
		variantStrs := strings.Split(variantParam, ",")
		for _, catStr := range variantStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				variantIDs = append(variantIDs, catID)
			}
		}
	}

	colorParam := c.Query("color") // Comma-separated color IDs
	var colorIDs []int
	if colorParam != "" {
		colorStrs := strings.Split(colorParam, ",")
		for _, catStr := range colorStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				colorIDs = append(colorIDs, catID)
			}
		}
	}

	fabricParam := c.Query("fabric") // Comma-separated fabric IDs
	var fabricIDs []int
	if fabricParam != "" {
		fabricStrs := strings.Split(fabricParam, ",")
		for _, catStr := range fabricStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				fabricIDs = append(fabricIDs, catID)
			}
		}
	}

	sleeveParam := c.Query("sleeve") // Comma-separated sleeve IDs
	var sleeveIDs []int
	if sleeveParam != "" {
		sleeveStrs := strings.Split(sleeveParam, ",")
		for _, catStr := range sleeveStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				sleeveIDs = append(sleeveIDs, catID)
			}
		}
	}

	genderParam := c.Query("gender") // Comma-separated gender IDs
	var genderIDs []int
	if genderParam != "" {
		genderStrs := strings.Split(genderParam, ",")
		for _, catStr := range genderStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				genderIDs = append(genderIDs, catID)
			}
		}
	}

	sizeVariantParam := c.Query("sizeVariant") // Comma-separated sizeVariant IDs
	var sizeVariantIDs []int
	if sizeVariantParam != "" {
		sizeVariantStrs := strings.Split(sizeVariantParam, ",")
		for _, catStr := range sizeVariantStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				sizeVariantIDs = append(sizeVariantIDs, catID)
			}
		}
	}

	sourceParam := c.Query("source") // Comma-separated source IDs
	var sourceIDs []int
	if sourceParam != "" {
		sourceStrs := strings.Split(sourceParam, ",")
		for _, catStr := range sourceStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				sourceIDs = append(sourceIDs, catID)
			}
		}
	}

	products, err := ctrl.productService.GetFilteredProducts(
		page, pageSize,
		sortBy, sortOrder, name, status,
		mrpMin, mrpMax,
		categoryIDs, fitIDs, variantIDs, colorIDs, fabricIDs, sleeveIDs, genderIDs, sizeVariantIDs, sourceIDs,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

func (ctrl *ProductCtrl) GetProductProperties(c *gin.Context) {
	property := c.Query("property")

	products, err := ctrl.productService.GetProductProperties(property)
	if err != nil {
		if errors.Is(err, crmErrors.ERR_INAVLID_PRODUCT_PROPERTY) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No such Property"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"properties": products})
}

func (ctrl *ProductCtrl) GetProductFilters(c *gin.Context) {
	filters, err := ctrl.productService.GetProductFilters()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"filters": filters})
}

func (ctrl *ProductCtrl) AddProduct(c *gin.Context) {
	product := &dto.AddProductRequest{}

	// Bind the incoming JSON to the product struct
	if err := c.BindJSON(product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	savedProduct, err := ctrl.productService.AddProduct(c, *product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "product": savedProduct})
}

func (ctrl *ProductCtrl) AddProductProperty(c *gin.Context) {
	propertyName := c.Param("propertyName")

	propertyRequest := &dto.AddProductPropertyRequest{}

	// Bind the incoming JSON to the product struct
	if err := c.BindJSON(propertyRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	savedProperty, err := ctrl.productService.AddProductProperty(c, propertyName, *propertyRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "property": savedProperty, "property_name": propertyName})
}

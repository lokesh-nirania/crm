package controller

import (
	"errors"
	"strconv"
	"strings"

	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type GRNCtrl struct {
	grnService service.GRNService
}

func NewGRNCtrl(grnService service.GRNService) *GRNCtrl {
	return &GRNCtrl{grnService: grnService}
}

func (ctrl *GRNCtrl) GetAllGRN(c *gin.Context) {
	// Pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	// Sorting params
	sortBy := c.DefaultQuery("sortBy", "created_at") // Default sort by name
	sortOrder := c.DefaultQuery("sortOrder", "desc") // Default ascending order

	// Filters
	status := c.Query("status")
	source := c.Query("source")

	vendorParam := c.Query("vendor") // Comma-separated vendor IDs
	var vendorIDs []int
	if vendorParam != "" {
		vendorStrs := strings.Split(vendorParam, ",")
		for _, catStr := range vendorStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				vendorIDs = append(vendorIDs, catID)
			}
		}
	}

	warehouseParam := c.Query("warehouse") // Comma-separated warehouse IDs
	var warehouseIDs []int
	if warehouseParam != "" {
		warehouseStrs := strings.Split(warehouseParam, ",")
		for _, catStr := range warehouseStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				warehouseIDs = append(warehouseIDs, catID)
			}
		}
	}

	creatorParam := c.Query("creator") // Comma-separated creator IDs
	var creatorIDs []int
	if creatorParam != "" {
		creatorStrs := strings.Split(creatorParam, ",")
		for _, catStr := range creatorStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				creatorIDs = append(creatorIDs, catID)
			}
		}
	}

	confirmerParam := c.Query("confirmer") // Comma-separated confirmer IDs
	var confirmerIDs []int
	if confirmerParam != "" {
		confirmerStrs := strings.Split(confirmerParam, ",")
		for _, catStr := range confirmerStrs {
			catID, err := strconv.Atoi(catStr)
			if err == nil {
				confirmerIDs = append(confirmerIDs, catID)
			}
		}
	}

	grns, err := ctrl.grnService.GetFilteredGRNs(
		page, pageSize,
		sortBy, sortOrder, status, source,
		vendorIDs, warehouseIDs, creatorIDs, confirmerIDs,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, grns)
}

func (ctrl *GRNCtrl) AddGRN(c *gin.Context) {
	grn := &dto.AddGRNRequest{}
	if err := c.BindJSON(grn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(grn.Products) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alteast one product is required"})
		return
	}

	savedGrn, err := ctrl.grnService.AddGRN(c, grn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "grn": savedGrn})
}

func (ctrl *GRNCtrl) ConfirmGRN(c *gin.Context) {
	grn := &dto.ConfirmGRNRequest{}
	if err := c.BindJSON(grn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	savedGrn, err := ctrl.grnService.ConfirmGRN(c, grn.GRNID)
	if err != nil {
		if err == crmErrors.ERR_GRN_ALREADY_CONFIRMED {
			c.JSON(http.StatusBadRequest, gin.H{"error": "GRN is already confirmed"})
			return
		}

		if err == crmErrors.ERR_INVALID_GRN {
			c.JSON(http.StatusBadRequest, gin.H{"error": "GRN is invalid"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "grn": savedGrn})
}

func (ctrl *GRNCtrl) GetGRNWarehouses(c *gin.Context) {
	code := c.Query("code")

	warehouses, err := ctrl.grnService.GetGRNWarehouses(code)
	if err != nil {
		if errors.Is(err, crmErrors.ERR_INAVLID_GRN_WAREHOUSE) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No such Warehouse"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"warehouses": warehouses})
}

func (ctrl *GRNCtrl) AddWarehouse(c *gin.Context) {
	warehouse := &dto.AddWarehouseRequest{}

	if err := c.BindJSON(warehouse); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	savedWarehouse, err := ctrl.grnService.AddGRNWarehouse(c, warehouse)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "warehouse": savedWarehouse})
}

func (ctrl *GRNCtrl) GetGRNVendors(c *gin.Context) {
	code := c.Query("code")

	vendors, err := ctrl.grnService.GetGRNVendors(code)
	if err != nil {
		if errors.Is(err, crmErrors.ERR_INAVLID_GRN_WAREHOUSE) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No such Vendor"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"vendors": vendors})
}

func (ctrl *GRNCtrl) AddVendor(c *gin.Context) {
	vendor := &dto.AddVendorRequest{}

	if err := c.BindJSON(vendor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	savedVendor, err := ctrl.grnService.AddGRNVendor(c, vendor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "vendor": savedVendor})
}

func (ctrl *GRNCtrl) GetGRNSources(c *gin.Context) {
	sources, err := ctrl.grnService.GetGRNSources()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sources": sources})
}

package controller

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderCtrl struct {
	orderService service.OrderService
}

func NewOrderCtrl(orderService service.OrderService) *OrderCtrl {
	return &OrderCtrl{orderService: orderService}
}

func (ctrl *OrderCtrl) PlaceOrder(c *gin.Context) {
	orderReq := &dto.OrderRequest{}
	if err := c.BindJSON(orderReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(orderReq.Order) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alteast one product is required"})
		return
	}

	savedGrn, err := ctrl.orderService.PlaceOrder(c, orderReq)
	if err != nil {
		if err == crmErrors.ERR_GRN_NO_PRODUCTS {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Alteast one size quantity must be non zero"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "grn": savedGrn})
}

func (ctrl *OrderCtrl) GetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	// Sorting params
	sortBy := c.DefaultQuery("sortBy", "created_at") // Default sort by name
	sortOrder := c.DefaultQuery("sortOrder", "desc") // Default ascending order

	orders, err := ctrl.orderService.GetFilteredOrders(c, page, pageSize, sortBy, sortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

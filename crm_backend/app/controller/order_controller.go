package controller

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/service"
	"net/http"

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

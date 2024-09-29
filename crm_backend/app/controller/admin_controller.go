package controller

import (
	"crm-backend/app/dto"
	"crm-backend/app/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	adminService service.AdminService
}

func NewAdminController(adminService service.AdminService) *AdminController {
	return &AdminController{adminService: adminService}
}

func (ctrl *AdminController) GetUsers(c *gin.Context) {
	name := c.Query("name")

	users, err := ctrl.adminService.GetUsers(name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "users": users})
}

func (ctrl *AdminController) PlaceOrder(c *gin.Context) {
	adminOrderRequest := &dto.AdminOrderRequest{}

	if err := c.ShouldBindJSON(adminOrderRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := ctrl.adminService.PlaceOrder(c, adminOrderRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order successful", "order": order})
}

func (ctrl *AdminController) ConfirmOrder(c *gin.Context) {
	orderId, _ := strconv.Atoi(c.Param("order_id"))

	order, err := ctrl.adminService.ConfirmOrder(c, orderId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order confirmed", "order": order})
}

func (ctrl *AdminController) CancelOrder(c *gin.Context) {
	orderId, _ := strconv.Atoi(c.Param("order_id"))

	order, err := ctrl.adminService.CancelOrder(c, orderId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order Canceled", "order": order})
}

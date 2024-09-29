package service

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"crm-backend/app/repository"

	"github.com/gin-gonic/gin"
)

type OrderService interface {
	PlaceOrder(ctx *gin.Context, orderReq *dto.OrderRequest) (*model.Order, error)
}

type orderService struct {
	orderRepo repository.OrderRepo
}

func NewOrderService(orderRepo repository.OrderRepo) OrderService {
	return &orderService{orderRepo: orderRepo}
}

func (g *orderService) PlaceOrder(ctx *gin.Context, orderReq *dto.OrderRequest) (*model.Order, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	orderModel, err := g.orderRepo.PlaceOrder(userId.(uint), orderReq)
	if err != nil {
		return nil, err
	}

	return orderModel, nil

}

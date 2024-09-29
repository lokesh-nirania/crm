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
	GetFilteredOrders(
		ctx *gin.Context,
		page, pageSize int,
		sortBy, sortOrder string,
	) (*dto.OrdersPaginatedResponse, error)
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

func (g *orderService) GetFilteredOrders(
	ctx *gin.Context,
	page, pageSize int,
	sortBy, sortOrder string,
) (*dto.OrdersPaginatedResponse, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	role, exists := ctx.Get("role")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	if role == "admin" {
		orders, totalItems, err := g.orderRepo.GetAllOrdersFiltered(page, pageSize, sortBy, sortOrder)
		if err != nil {
			return nil, err
		}
		ordersResp := &dto.OrdersPaginatedResponse{
			Page:       page,
			PageSize:   pageSize,
			TotalItems: totalItems,
			TotalPages: int((totalItems + int64(pageSize) - 1) / int64(pageSize)),
			Orders:     *orders,
		}
		return ordersResp, nil
	}

	orders, totalItems, err := g.orderRepo.GetOrdersForUserFiltered(userId.(uint), page, pageSize, sortBy, sortOrder)
	if err != nil {
		return nil, err
	}

	ordersResp := &dto.OrdersPaginatedResponse{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: int((totalItems + int64(pageSize) - 1) / int64(pageSize)),
		Orders:     *orders,
	}
	return ordersResp, nil

}

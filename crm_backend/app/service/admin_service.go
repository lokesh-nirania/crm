package service

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"crm-backend/app/repository"

	"github.com/gin-gonic/gin"
)

type AdminService interface {
	GetUsers(name string) (*[]model.User, error)
	PlaceOrder(ctx *gin.Context, orderReq *dto.AdminOrderRequest) (*model.Order, error)
	ConfirmOrder(ctx *gin.Context, orderId int) (*model.Order, error)
	CancelOrder(ctx *gin.Context, orderId int) (*model.Order, error)
}

type adminService struct {
	adminRepo repository.AdminRepository
	orderRepo repository.OrderRepo
}

func NewAdminService(adminRepo repository.AdminRepository, orderRepo repository.OrderRepo) AdminService {
	return &adminService{adminRepo: adminRepo, orderRepo: orderRepo}
}

func (s *adminService) GetUsers(name string) (*[]model.User, error) {
	users, err := s.adminRepo.GetUsers(name)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (s *adminService) PlaceOrder(ctx *gin.Context, orderReq *dto.AdminOrderRequest) (*model.Order, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	orderModel, err := s.orderRepo.PlaceOrderOnBehalf(userId.(uint), orderReq)
	if err != nil {
		return nil, err
	}

	return orderModel, nil

}

func (s *adminService) ConfirmOrder(ctx *gin.Context, orderId int) (*model.Order, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	orderModel, err := s.orderRepo.ConfirmOrder(userId.(uint), orderId)
	if err != nil {
		return nil, err
	}

	return orderModel, nil
}

func (s *adminService) CancelOrder(ctx *gin.Context, orderId int) (*model.Order, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	orderModel, err := s.orderRepo.CancelOrder(userId.(uint), orderId)
	if err != nil {
		return nil, err
	}

	return orderModel, nil
}

package repository

import (
	"crm-backend/app/dto"
	"crm-backend/app/model"

	"gorm.io/gorm"
)

type OrderRepo interface {
	PlaceOrder(userId uint, orderReq *dto.OrderRequest) (*model.Order, error)
	GetAllOrdersFiltered(
		page, pageSize int,
		sortBy, sortOrder string,
	) (*[]model.Order, int64, error)
	GetOrdersForUserFiltered(
		userId uint,
		page, pageSize int,
		sortBy, sortOrder string,
	) (*[]model.Order, int64, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepo {
	return &orderRepository{db: db}
}

func (p *orderRepository) PlaceOrder(userId uint, orderReq *dto.OrderRequest) (*model.Order, error) {
	tx := p.db.Begin()

	orderModel := &model.Order{
		Status:       string(model.OrderStatusPending),
		Price:        orderReq.TotalPrice,
		CreatedByID:  userId,
		CreatedForID: userId,
	}

	if err := tx.Create(orderModel).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, c := range orderReq.Order {
		for _, s := range c.Sets {
			orderProductModel := &model.OrderProduct{
				OrderID:        orderModel.ID,
				ProductID:      uint(c.ProductId),
				SizeVariant1ID: uint(s.Size1.ID),
				SizeVariant2ID: uint(s.Size2.ID),
				SizeVariant3ID: uint(s.Size3.ID),
				Quantity:       s.Quantity,
				Price:          s.Price,
			}

			if err := tx.Create(orderProductModel).Error; err != nil {
				return nil, err
			}
		}

	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	var finalOrderModel model.Order

	if err := p.db.
		Preload("CreatedBy").
		Preload("CreatedFor").
		Preload("OrderProducts").
		First(&finalOrderModel, orderModel.ID).Error; err != nil {
		return nil, err
	}

	return nil, nil
}

func (p *orderRepository) GetAllOrdersFiltered(
	page, pageSize int,
	sortBy, sortOrder string,
) (*[]model.Order, int64, error) {
	var orders []model.Order
	var totalItems int64

	query := p.db.Model(&model.GRN{})

	query.Count(&totalItems)

	query = query.Order(sortBy + " " + sortOrder)
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("OrderProducts").
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return &orders, totalItems, nil
}

func (p *orderRepository) GetOrdersForUserFiltered(
	userId uint,
	page, pageSize int,
	sortBy, sortOrder string,
) (*[]model.Order, int64, error) {
	var orders []model.Order
	var totalItems int64

	query := p.db.Model(&model.GRN{})
	query = query.Where("created_for_id = ?", userId)

	query.Count(&totalItems)

	query = query.Order(sortBy + " " + sortOrder)
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("OrderProducts").
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return &orders, totalItems, nil
}

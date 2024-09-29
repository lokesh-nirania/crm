package repository

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"time"

	"gorm.io/gorm"
)

type OrderRepo interface {
	PlaceOrder(userId uint, orderReq *dto.OrderRequest) (*model.Order, error)
	PlaceOrderOnBehalf(creatorId uint, orderReq *dto.AdminOrderRequest) (*model.Order, error)

	ConfirmOrder(confirmerID uint, orderId int) (*model.Order, error)
	CancelOrder(cancelerId uint, orderId int) (*model.Order, error)

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
				Quantity:       s.Quantity,
				Price:          s.Price,
			}

			if s.Size2.ID != 0 {
				s := uint(s.Size2.ID)
				orderProductModel.SizeVariant2ID = &s
			}

			if s.Size3.ID != 0 {
				s := uint(s.Size3.ID)
				orderProductModel.SizeVariant3ID = &s
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
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&finalOrderModel, orderModel.ID).Error; err != nil {
		return nil, err
	}

	return &finalOrderModel, nil
}

func (p *orderRepository) PlaceOrderOnBehalf(creatorId uint, orderReq *dto.AdminOrderRequest) (*model.Order, error) {
	tx := p.db.Begin()

	orderModel := &model.Order{
		Status:       string(model.OrderStatusPending),
		Price:        orderReq.TotalPrice,
		CreatedByID:  creatorId,
		CreatedForID: uint(orderReq.CreatedForID),
	}

	if err := tx.Create(orderModel).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	for _, p := range orderReq.Products {
		q := 0
		for _, s := range p.SizeVariants {
			q += s.Quantity
		}

	}

	for _, p := range orderReq.Products {
		q := 0
		for _, s := range p.SizeVariants {
			q += s.Quantity
		}
		pp := p.Price / q

		for _, s := range p.SizeVariants {
			orderProductModel := &model.OrderProduct{
				OrderID:        orderModel.ID,
				ProductID:      uint(p.ID),
				SizeVariant1ID: uint(s.ID),
				Quantity:       s.Quantity,
				Price:          pp * s.Quantity,
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
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&finalOrderModel, orderModel.ID).Error; err != nil {
		return nil, err
	}

	return &finalOrderModel, nil
}

func (p *orderRepository) ConfirmOrder(confirmerID uint, orderId int) (*model.Order, error) {
	var order model.Order
	if err := p.db.
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&order, orderId).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	if order.Status == string(model.OrderStatusCancelled) {
		return nil, crmErrors.ERR_ORDER_ALREADY_CANCELLED
	}

	if order.Status == string(model.OrderStatusConfirmed) {
		return nil, crmErrors.ERR_ORDER_ALREADY_CONFIRMED
	}

	if order.ConfirmedByID != nil || order.ConfirmedDate != nil || order.Status != string(model.Pending) {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	// Start a transaction
	err := p.db.Transaction(func(tx *gorm.DB) error {
		// Step 1: Update GRN to confirmed status
		now := time.Now()
		order.ConfirmedDate = &now
		order.ConfirmedByID = &confirmerID
		order.Status = string(model.OrderStatusConfirmed)

		// Save the updates to the GRN
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// Step 2: Loop through GRNProducts and update the inventory
		for _, orderProduct := range order.OrderProducts {
			var inventory model.Inventory

			// Check if an inventory record exists for this product and size variant
			if err := tx.Where("product_id = ? AND size_variant_id = ?", orderProduct.ProductID, orderProduct.SizeVariant1ID).First(&inventory).Error; err != nil {
				return err
			} else {
				// Inventory record exists, increase the quantity
				inventory.Quantity -= orderProduct.Quantity
				if inventory.Quantity < 0 {
					return crmErrors.ERR_GRN_NOT_ENOUGH_INVENTORY
				}
				if err := tx.Save(&inventory).Error; err != nil {
					return err
				}
			}

			if orderProduct.SizeVariant2ID != nil {
				var i2 model.Inventory
				if err := tx.Where("product_id = ? AND size_variant_id = ?", orderProduct.ProductID, orderProduct.SizeVariant2ID).First(&i2).Error; err != nil {
					return err
				} else {
					// Inventory record exists, increase the quantity
					i2.Quantity -= orderProduct.Quantity
					if i2.Quantity < 0 {
						return crmErrors.ERR_GRN_NOT_ENOUGH_INVENTORY
					}
					if err := tx.Save(&i2).Error; err != nil {
						return err
					}
				}
			}

			if orderProduct.SizeVariant3ID != nil {
				var i3 model.Inventory
				if err := tx.Where("product_id = ? AND size_variant_id = ?", orderProduct.ProductID, orderProduct.SizeVariant3ID).First(&i3).Error; err != nil {
					return err
				} else {
					// Inventory record exists, increase the quantity
					i3.Quantity -= orderProduct.Quantity
					if i3.Quantity < 0 {
						return crmErrors.ERR_GRN_NOT_ENOUGH_INVENTORY
					}
					if err := tx.Save(&i3).Error; err != nil {
						return err
					}
				}
			}
		}

		return nil
	})

	// If the transaction fails, return the error
	if err != nil {
		return nil, err
	}

	if err := p.db.
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&order, orderId).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	return &order, nil
}

func (p *orderRepository) CancelOrder(cancelerId uint, orderId int) (*model.Order, error) {
	var order model.Order
	if err := p.db.
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&order, orderId).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	if order.Status == string(model.OrderStatusCancelled) {
		return nil, crmErrors.ERR_ORDER_ALREADY_CANCELLED
	}

	if order.Status == string(model.OrderStatusConfirmed) {
		return nil, crmErrors.ERR_ORDER_ALREADY_CONFIRMED
	}

	if order.CancelledByID != nil || order.CancelledDate != nil || order.Status != string(model.Pending) {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	// Start a transaction
	err := p.db.Transaction(func(tx *gorm.DB) error {
		// Step 1: Update GRN to confirmed status
		now := time.Now()
		order.CancelledDate = &now
		order.CancelledByID = &cancelerId
		order.Status = string(model.OrderStatusCancelled)

		// Save the updates to the GRN
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		return nil
	})

	// If the transaction fails, return the error
	if err != nil {
		return nil, err
	}

	if err := p.db.
		Preload("CreatedBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		First(&order, orderId).Error; err != nil {
		return nil, crmErrors.ERR_INVALID_ORDER
	}

	return &order, nil
}

func (p *orderRepository) GetAllOrdersFiltered(
	page, pageSize int,
	sortBy, sortOrder string,
) (*[]model.Order, int64, error) {
	var orders []model.Order
	var totalItems int64

	query := p.db.Model(&model.Order{})

	query.Count(&totalItems)

	query = query.Order(sortBy + " " + sortOrder)
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		Preload("OrderProducts.Product").
		Preload("OrderProducts.SizeVariant1").
		Preload("OrderProducts.SizeVariant2").
		Preload("OrderProducts.SizeVariant3").
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

	query := p.db.Model(&model.Order{})
	query = query.Where("created_for_id = ?", userId)

	query.Count(&totalItems)

	query = query.Order(sortBy + " " + sortOrder)
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).
		Preload("CreatedFor").
		Preload("CreatedBy").
		Preload("CancelledBy").
		Preload("ConfirmedBy").
		Preload("OrderProducts").
		Preload("OrderProducts.Product").
		Preload("OrderProducts.SizeVariant1").
		Preload("OrderProducts.SizeVariant2").
		Preload("OrderProducts.SizeVariant3").
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return &orders, totalItems, nil
}

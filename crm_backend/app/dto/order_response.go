package dto

import "crm-backend/app/model"

type OrdersPaginatedResponse struct {
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	TotalItems int64         `json:"total_items"`
	TotalPages int           `json:"total_pages"`
	Orders     []model.Order `json:"orders"`
}

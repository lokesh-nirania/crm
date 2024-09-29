package service

import (
	"crm-backend/app/dto"
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/model"
	"crm-backend/app/repository"
	"time"

	"github.com/gin-gonic/gin"
)

type GRNService interface {
	GetFilteredGRNs(
		page, pageSize int,
		sortBy, sortOrder, status, source string,
		vendorIDs, warehouseIDs, creatorIDs, confirmerIDs []int,
	) (*dto.GRNsPaginatedResponse, error)
	AddGRN(ctx *gin.Context, grn *dto.AddGRNRequest) (*dto.GRNResponse, error)
	ConfirmGRN(ctx *gin.Context, grnId int) (*dto.GRNResponse, error)

	GetGRNWarehouses(code string) (*[]model.Warehouse, error)
	AddGRNWarehouse(ctx *gin.Context, w *dto.AddWarehouseRequest) (*model.Warehouse, error)

	GetGRNVendors(code string) (*[]model.Vendor, error)
	AddGRNVendor(ctx *gin.Context, v *dto.AddVendorRequest) (*model.Vendor, error)

	GetGRNSources() (*[]model.SourceType, error)
}

type grnService struct {
	grnRepo repository.GRNRepository
}

func NewGRNService(grnRepo repository.GRNRepository) GRNService {
	return &grnService{grnRepo: grnRepo}
}

func (g *grnService) GetFilteredGRNs(
	page, pageSize int,
	sortBy, sortOrder, status, source string,
	vendorIDs, warehouseIDs, creatorIDs, confirmerIDs []int,
) (*dto.GRNsPaginatedResponse, error) {
	grns, totalItems, err := g.grnRepo.GetFilteredGRNs(
		page, pageSize,
		sortBy, sortOrder, status, source,
		vendorIDs, warehouseIDs, creatorIDs, confirmerIDs,
	)
	if err != nil {
		return nil, err
	}

	grnsResp := []dto.GRNResponse{}
	for _, g := range *grns {
		confirmedDate := ""
		if g.ConfirmedDate != nil {
			confirmedDate = g.ConfirmedDate.Format("02/01/2006")
		}
		grnsResp = append(grnsResp, dto.GRNResponse{
			ID:     int(g.ID),
			Status: g.Status,
			Source: g.Source,
			PO:     g.PO,
			Warehouse: dto.GRNWarehouseResponse{
				ID:   int(g.WarehouseID),
				Name: g.Warehouse.Name,
				Code: g.Warehouse.Code,
			},
			Vendor: dto.GRNVendorResponse{
				ID:   int(g.VendorID),
				Name: g.Vendor.Name,
				Code: g.Vendor.Code,
			},
			CreatedDate:   g.CreatedAt.Format("02/01/2006"),
			ExpectedDate:  g.ExpectedDate.Format("02/01/2006"),
			ConfirmedDate: confirmedDate,
			CreatedBy:     g.CreatedBy,
			ConfirmedBy:   g.ConfirmedBy,
		})
	}

	resp := &dto.GRNsPaginatedResponse{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: int((totalItems + int64(pageSize) - 1) / int64(pageSize)),
		GRNs:       grnsResp,
	}

	return resp, nil
}

func (g *grnService) AddGRN(ctx *gin.Context, grn *dto.AddGRNRequest) (*dto.GRNResponse, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	expectedDate, err := time.Parse("02/01/2006", grn.ExpectedDate)
	if err != nil {
		return nil, crmErrors.ERR_INVALID_GRN
	}

	var confirmedDate *time.Time
	if grn.Status == model.Confirmed {
		now := time.Now()
		confirmedDate = &now
	}

	grnModel := &model.GRN{
		ExpectedDate:  expectedDate,
		ConfirmedDate: confirmedDate,
		Status:        string(grn.Status),
		Source:        string(grn.Source),
		PO:            grn.PO,
		Remarks:       grn.Remarks,
		VendorID:      uint(grn.VendorID),
		WarehouseID:   uint(grn.WarehouseID),
		CreatedByID:   userId.(uint),
	}

	grnProductsModels := []model.GRNProduct{}
	for _, p := range grn.Products {
		for _, sv := range p.SizeVariants {
			if sv.Quantity == 0 {
				continue
			}
			grnProductModel := model.GRNProduct{
				GRNID:         0,
				ProductID:     uint(p.ID),
				SizeVariantID: uint(sv.ID),
				Quantity:      sv.Quantity,
			}

			grnProductsModels = append(grnProductsModels, grnProductModel)
		}
	}

	if len(grnProductsModels) == 0 {
		return nil, crmErrors.ERR_GRN_NO_PRODUCTS
	}

	savedGrn, err := g.grnRepo.AddGRNWithProducts(ctx, grnModel, &grnProductsModels)
	if err != nil {
		return nil, err
	}

	confirmedDateStr := ""
	if savedGrn.ConfirmedDate != nil {
		confirmedDateStr = savedGrn.ConfirmedDate.Format("02/01/2006")
	}

	grnResp := dto.GRNResponse{
		ID:            int(savedGrn.ID),
		Status:        savedGrn.Status,
		Source:        savedGrn.Source,
		PO:            savedGrn.PO,
		Warehouse:     dto.GRNWarehouseResponse{},
		Vendor:        dto.GRNVendorResponse{},
		ExpectedDate:  savedGrn.ExpectedDate.Format("02/01/2006"),
		CreatedDate:   savedGrn.CreatedAt.Format("02/01/2006"),
		ConfirmedDate: confirmedDateStr,
		CreatedBy:     savedGrn.CreatedBy,
		ConfirmedBy:   savedGrn.ConfirmedBy,
	}
	return &grnResp, nil
}

func (g *grnService) ConfirmGRN(ctx *gin.Context, grnId int) (*dto.GRNResponse, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	updatedGrn, err := g.grnRepo.ConfirmGRN(ctx, uint(grnId), userId.(uint))
	if err != nil {
		return nil, err
	}

	grnResp := &dto.GRNResponse{
		ID:      int(updatedGrn.ID),
		Status:  updatedGrn.Status,
		Source:  updatedGrn.Source,
		PO:      updatedGrn.PO,
		Remarks: updatedGrn.Remarks,
		Warehouse: dto.GRNWarehouseResponse{
			ID:   grnId,
			Name: updatedGrn.Warehouse.Name,
			Code: updatedGrn.Warehouse.Code,
		},
		Vendor: dto.GRNVendorResponse{
			ID:   grnId,
			Name: updatedGrn.Vendor.Name,
			Code: updatedGrn.Vendor.Code,
		},
		ExpectedDate:  updatedGrn.ExpectedDate.Format("02/01/2006"),
		CreatedDate:   updatedGrn.CreatedAt.Format("02/01/2006"),
		ConfirmedDate: updatedGrn.ConfirmedDate.Format("02/01/2006"),
		CreatedBy:     updatedGrn.CreatedBy,
		ConfirmedBy:   updatedGrn.ConfirmedBy,
	}

	return grnResp, nil
}

func (p *grnService) GetGRNWarehouses(code string) (*[]model.Warehouse, error) {
	warehouses, err := p.grnRepo.GetGRNWarehouses(code)

	if err != nil {
		return nil, err
	}

	return warehouses, nil
}

func (p *grnService) AddGRNWarehouse(ctx *gin.Context, w *dto.AddWarehouseRequest) (*model.Warehouse, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	warehouseModel := &model.Warehouse{
		Name:        w.Name,
		Code:        w.Code,
		CreatedByID: userId.(uint),
	}

	warehouse, err := p.grnRepo.AddGRNWarehouse(ctx, warehouseModel)
	if err != nil {
		return nil, err
	}
	return warehouse, nil
}

func (p *grnService) GetGRNVendors(code string) (*[]model.Vendor, error) {
	vendors, err := p.grnRepo.GetGRNVendors(code)

	if err != nil {
		return nil, err
	}

	return vendors, nil
}

func (p *grnService) AddGRNVendor(ctx *gin.Context, v *dto.AddVendorRequest) (*model.Vendor, error) {
	userId, exists := ctx.Get("user_id")
	if !exists {
		return nil, crmErrors.ERR_USER_NOT_LOGGED_IN
	}

	vendorModel := &model.Vendor{
		Name:        v.Name,
		Code:        v.Code,
		CreatedByID: userId.(uint),
	}

	vendor, err := p.grnRepo.AddGRNVendor(ctx, vendorModel)
	if err != nil {
		return nil, err
	}
	return vendor, nil
}

func (p *grnService) GetGRNSources() (*[]model.SourceType, error) {
	return &[]model.SourceType{model.External, model.Internal}, nil
}

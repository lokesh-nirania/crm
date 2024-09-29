package repository

import (
	"crm-backend/app/model"

	"gorm.io/gorm"
)

type AdminRepository interface {
	GetUsers(name string) (*[]model.User, error)
	CreateUser(user *model.User) error
}

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) AdminRepository {
	return &adminRepository{db: db}
}

func (a *adminRepository) GetUsers(name string) (*[]model.User, error) {
	var users []model.User

	query := a.db.Model(&model.User{})

	if name != "" {
		query = query.Where("username LIKE ?", "%"+name+"%")
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, err
	}

	return &users, nil
}

func (a *adminRepository) CreateUser(user *model.User) error {
	return a.db.Create(user).Error
}

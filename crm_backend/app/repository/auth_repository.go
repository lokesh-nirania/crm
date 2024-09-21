package repository

import (
	"crm-backend/app/model"

	"gorm.io/gorm"
)

type AuthRepository interface {
	FindByEmailOrUsername(username string) (*model.User, error)
	CreateUser(user *model.User) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (a *authRepository) FindByEmailOrUsername(username string) (*model.User, error) {
	var user model.User
	if err := a.db.Where("email = ? OR username = ?", username, username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (a *authRepository) CreateUser(user *model.User) error {
	return a.db.Create(user).Error
}

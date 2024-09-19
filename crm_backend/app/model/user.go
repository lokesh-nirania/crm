package model

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model        // Adds fields ID, CreatedAt, UpdatedAt, DeletedAt
	Username   string `gorm:"size:100;not null;unique"`                          // Username column
	Email      string `gorm:"size:100;not null;unique"`                          // Username column
	Password   string `gorm:"size:100;not null"`                                 // Encrypted password
	UserType   string `gorm:"type:enum('admin', 'employee', 'client');not null"` // Enum for user type
	Active     bool   `gorm:"default:false"`
}

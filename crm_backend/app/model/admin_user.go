// app/models/admin.go
package model

import "gorm.io/gorm"

type Admin struct {
	gorm.Model
	UserID uint `gorm:"not null"` // Foreign key to User
	User   User `gorm:"foreignKey:UserID"`
}

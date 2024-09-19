// app/models/employee.go
package model

import "gorm.io/gorm"

type Employee struct {
	gorm.Model
	UserID     uint   `gorm:"not null"` // Foreign key to User
	User       User   `gorm:"foreignKey:UserID"`
	Department string `gorm:"size:100"` // Department field
}

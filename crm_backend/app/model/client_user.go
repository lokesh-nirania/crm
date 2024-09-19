// app/models/client.go
package model

import "gorm.io/gorm"

type Client struct {
	gorm.Model
	UserID      uint   `gorm:"not null"` // Foreign key to User
	User        User   `gorm:"foreignKey:UserID"`
	CompanyName string `gorm:"size:255"` // Client's company name
	ContactInfo string `gorm:"size:255"` // Contact information
}

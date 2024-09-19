package main

import (
	"crm-backend/app/config"
	"crm-backend/app/model"
	routes "crm-backend/app/router"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("Hello World")

	config.ConnectDB()
	config.DB.AutoMigrate(&model.User{}, &model.Product{}, &model.GRN{}, &model.Inventory{}, &model.Admin{}, &model.Employee{}, &model.Client{})

	appConfig := config.ReadConfig()
	createDefaultUsers(config.DB, appConfig.DefaultUsers)

	router := gin.Default()
	routes.InitializeRoutes(router)
	router.Run(":8080")
}

func createDefaultUsers(db *gorm.DB, defaultUsers []config.DefaultUser) {
	for _, user := range defaultUsers {
		var existingUser model.User

		if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// User doesn't exist, create a new user
				newUser := model.User{
					Username: user.Username,
					Email:    user.Email,
					Password: "default_password", // You can generate a random password here
					UserType: user.Role,          // Use the role from the config
					Active:   user.Active,
				}

				if err := db.Create(&newUser).Error; err != nil {
					log.Printf("Failed to create user %s: %v", user.Email, err)
				} else {
					log.Printf("Created default user: %s", user.Email)
				}
			} else {
				log.Printf("Error checking user %s: %v", user.Email, err)
			}
		} else {
			log.Printf("User %s already exists", user.Email)
		}
	}
}

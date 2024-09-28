package main

import (
	"crm-backend/app/config"
	"crm-backend/app/dto"
	"crm-backend/app/model"
	routes "crm-backend/app/router"
	"crm-backend/app/utils.go"
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func main() {
	fmt.Println("Hello World")

	config.ConnectDB()
	config.DB.AutoMigrate(
		&model.User{},

		&model.Product{},
		&model.ProductCategory{},
		&model.ProductFit{},
		&model.ProductColor{},
		&model.ProductFabric{},
		&model.ProductSleeve{},
		&model.ProductGender{},
		&model.SizeVariant{},
		&model.ProductSource{},
		&model.GRN{},
		&model.Inventory{},
		&model.Admin{},
		&model.Employee{},
		&model.Client{},
		&model.GRNProduct{},
		&model.Vendor{},
		&model.Warehouse{},
	)

	appConfig := config.ReadConfig()
	systemUserID, err := utils.InitializeDBwithDefaultData(config.DB, appConfig.DefaultUsers)
	if err != nil {
		log.Print("unable to get system user id")
	} else {
		log.Printf("creating products, %v", systemUserID)
	}

	router := gin.Default()

	// Register the custom validator for sizevariant tag
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		v.RegisterValidation("sizevariant", dto.SizeVariantValidator)
		v.RegisterValidation("grn_status", dto.GRNStatusValidator)
		v.RegisterValidation("grn_source", dto.GRNSourceValidator)
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Replace with your Flutter web app's URL
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, // Cache preflight response for 12 hours
	}))

	routes.InitializeRoutes(router)
	router.Run(":8080")
}

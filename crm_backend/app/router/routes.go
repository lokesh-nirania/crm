package routes

import (
	"crm-backend/app/config"
	"crm-backend/app/controller"
	"crm-backend/app/middleware"
	"crm-backend/app/repository"
	"crm-backend/app/service"
	"os"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.Engine) {
	// health route
	router.GET("/api/crm/v1/healthz", func(c *gin.Context) {
		c.JSON(200, map[string]string{
			"status": "up",
		})
	})

	// extract os envs
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))

	// repo initialisation
	authRepo := repository.NewAuthRepository(config.DB)
	productRepo := repository.NewProductRepository(config.DB)
	grnRepo := repository.NewGRNRepository(config.DB)
	orderRepo := repository.NewOrderRepository(config.DB)

	// service initialisation
	authService := service.NewAuthService(authRepo, jwtSecret)
	productService := service.NewProductService(productRepo)
	grnService := service.NewGRNService(grnRepo)
	orderService := service.NewOrderService(orderRepo)

	// controller initialisation
	authController := controller.NewAuthController(authService)
	productController := controller.NewProductCtrl(productService)
	grnController := controller.NewGRNCtrl(grnService)
	orderController := controller.NewOrderCtrl(orderService)

	// Auth routes
	auth := router.Group("/api/crm/v1/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	// Protected routes (JWT required)
	span := router.Group("/api/crm/v1/span")
	span.Use(middleware.JWTAuthMiddleware(jwtSecret))
	{
		span.GET("/ping", func(c *gin.Context) {
			c.JSON(200, map[string]string{"message": "token is valid"})
		})

		span.POST("/logout", func(c *gin.Context) {
			c.JSON(200, map[string]string{"message": "success"})
		})
	}

	profile := router.Group("/api/crm/v1/profile")
	profile.Use(middleware.JWTAuthMiddleware(jwtSecret)) // Apply the JWT middleware
	{
		// profile.GET("/:email", controllers.GetProfile)
		// profile.PUT("/:email", controllers.UpdateProfile)
	}

	products := router.Group("/api/crm/v1/products")
	products.Use(middleware.JWTAuthMiddleware(jwtSecret)) // Apply the JWT middleware
	{
		// products.GET("", productController.GetAllProducts)
		products.GET("/v2", productController.GetAllProductsV2)
		products.GET("/:product_id", productController.GetProductWithSizeVariants)
		products.GET("/attributes", productController.GetProductAttributes)
		products.GET("/filters", productController.GetProductFilters)
		products.GET("/size_variants/:variant", productController.GetProductSizeVariants)

		products.POST("/add", productController.AddProduct)
		products.POST("/add/:propertyName", productController.AddProductProperty)
	}

	grn := router.Group("/api/crm/v1/grn")
	grn.Use(middleware.JWTAuthMiddleware(jwtSecret)) // Apply the JWT middleware
	{
		grn.GET("", grnController.GetAllGRN)
		grn.POST("/add", grnController.AddGRN)
		grn.POST("/confirm", grnController.ConfirmGRN)

		grnWarehouse := grn.Group("/warehouse")
		{
			grnWarehouse.GET("", grnController.GetGRNWarehouses)
			grnWarehouse.POST("/add", grnController.AddWarehouse)
		}

		grnVendor := grn.Group("/vendor")
		{
			grnVendor.GET("", grnController.GetGRNVendors)
			grnVendor.POST("/add", grnController.AddVendor)
		}

		grn.GET("/sources", grnController.GetGRNSources)

	}

	orders := router.Group("/api/crm/v1/orders")
	orders.Use(middleware.JWTAuthMiddleware(jwtSecret)) // Apply the JWT middleware
	{
		orders.GET("", nil)
		orders.POST("/place", orderController.PlaceOrder)
	}
}

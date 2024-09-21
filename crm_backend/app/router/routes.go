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

	// service initialisation
	authService := service.NewAuthService(authRepo, jwtSecret)
	productService := service.NewProductService(productRepo)

	// controller initialisation
	authController := controller.NewAuthController(authService)
	productController := controller.NewProductCtrl(productService)

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
		products.GET("", productController.GetAllProducts)
		products.GET("/v2", productController.GetAllProductsV2)
		products.GET("/properties", productController.GetProductProperties)
		products.GET("/filters", productController.GetProductFilters)

		products.POST("/add", productController.AddProduct)
		products.POST("/add/:propertyName", productController.AddProductProperty)
		// profile.PUT("/:email", controllers.UpdateProfile)
	}
}

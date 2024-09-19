package routes

import (
	"crm-backend/app/config"
	"crm-backend/app/controller"
	"crm-backend/app/repository"
	"crm-backend/app/service"

	"github.com/gin-gonic/gin"
)

func InitializeRoutes(router *gin.Engine) {
	// health route
	router.GET("/api/crm/v1/healthz", func(c *gin.Context) {
		c.JSON(200, map[string]string{
			"status": "up",
		})
	})

	// repo initialisation
	authRepo := repository.NewAuthRepository(config.DB)

	// service initialisation
	authService := service.NewAuthService(authRepo)

	// controller initialisation
	authController := controller.NewAuthController(authService)

	// Auth routes
	auth := router.Group("/api/crm/v1/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}
}

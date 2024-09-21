package controller

import (
	crmErrors "crm-backend/app/errors"
	"crm-backend/app/service"
	"net/http"

	"errors"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService service.AuthService
}

func NewAuthController(authService service.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

// Register handles user registration
func (ctrl *AuthController) Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ctrl.authService.Register(input.Email, input.Password, "client")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully", "user": user})
}

// Login handles user login
func (ctrl *AuthController) Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jwtToken, user, err := ctrl.authService.Login(input.Username, input.Password)
	if err != nil {
		if errors.Is(err, crmErrors.ERR_INVALID_USER_OR_PASSWORD) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		} else if errors.Is(err, crmErrors.ERR_USER_INACTIVE) {
			c.JSON(http.StatusForbidden, gin.H{"error": "User is inactive"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": jwtToken, "user": user})
}

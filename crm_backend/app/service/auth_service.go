package service

import (
	"crm-backend/app/model"
	"crm-backend/app/repository"
	"time"

	"crm-backend/app/errors"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(email, password, userType string) (*model.User, error)
	Login(email, password string) (string, *model.User, error)
}

type authService struct {
	authRepository repository.AuthRepository
	jwtSecret      []byte
}

func NewAuthService(repo repository.AuthRepository, jwtSecret []byte) AuthService {
	return &authService{authRepository: repo, jwtSecret: jwtSecret}
}

func (s *authService) Register(email, password, userType string) (*model.User, error) {
	// Check if user already exists
	existingUser, err := s.authRepository.FindByEmailOrUsername(email)
	if err == nil && existingUser != nil {
		return nil, err
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create new user
	newUser := &model.User{
		Email:    email,
		Password: string(hashedPassword),
		UserType: userType,
	}

	if err := s.authRepository.CreateUser(newUser); err != nil {
		return nil, err
	}

	return newUser, nil
}

// Login authenticates a user
func (s *authService) Login(email, password string) (string, *model.User, error) {
	user, err := s.authRepository.FindByEmailOrUsername(email)
	if err != nil {
		return "", nil, errors.ERR_INVALID_USER_OR_PASSWORD
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.ERR_INVALID_USER_OR_PASSWORD
	}

	if !user.Active {
		return "", nil, errors.ERR_USER_INACTIVE
	}

	jwtToken, err := s.generateJWTToken(user)
	if err != nil {
		return "", nil, errors.ERR_TOKEN_GENERATION_FAILED
	}

	return jwtToken, user, nil
}

func (s *authService) generateJWTToken(user *model.User) (string, error) {
	// Create the token claims
	claims := jwt.MapClaims{
		"user_id": user.ID,                               // User ID
		"email":   user.Email,                            // User email
		"role":    user.UserType,                         // User role (admin, client, etc.)
		"exp":     time.Now().Add(time.Hour * 72).Unix(), // Expiry time (e.g., 72 hours)
	}

	// Create a new token object
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

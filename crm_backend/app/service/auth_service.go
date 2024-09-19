package service

import (
	"crm-backend/app/model"
	"crm-backend/app/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Register(email, password, userType string) (*model.User, error)
	Login(email, password string) (*model.User, error)
}

type authService struct {
	authRepository repository.AuthRepository
}

func NewAuthService(repo repository.AuthRepository) AuthService {
	return &authService{authRepository: repo}
}

func (s *authService) Register(email, password, userType string) (*model.User, error) {
	// Check if user already exists
	existingUser, err := s.authRepository.FindByEmail(email)
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
func (s *authService) Login(email, password string) (*model.User, error) {
	user, err := s.authRepository.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, err
	}

	return user, nil
}

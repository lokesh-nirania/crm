package config

import (
	"encoding/json"
	"log"
	"os"
)

type DefaultUser struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Active   bool   `json:"active"`
}

type Config struct {
	DefaultUsers []DefaultUser `json:"default_users"`
}

func ReadConfig() Config {
	file, err := os.Open("app/config/config.json")
	if err != nil {
		log.Fatalf("failed to open config file: %v", err)
	}
	defer file.Close()

	var config Config
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		log.Fatalf("failed to decode config file: %v", err)
	}
	return config
}

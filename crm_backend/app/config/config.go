package config

import (
	"encoding/json"
	"log"
	"os"
)

type DefaultUser struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
	Active   bool   `json:"active"`
}

type DefaultProducts struct {
	ProductCategories   []string `json:"product_categories"`
	ProductColors       []string `json:"product_colors"`
	ProductFabrics      []string `json:"product_fabrics"`
	ProductFits         []string `json:"product_fits"`
	ProductGenders      []string `json:"product_genders"`
	ProductSizeVariants []string `json:"product_size_variants"`
	ProductSources      []string `json:"product_sources"`
	ProductSleeves      []string `json:"product_sleeves"`
	ProductVariants     []string `json:"product_variants"`
	Count               int      `json:"random_products_count"`
}

type Config struct {
	DefaultUsers    []DefaultUser   `json:"default_users"`
	DefaultProfucts DefaultProducts `json:"default_products"`
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

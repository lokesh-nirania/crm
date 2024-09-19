package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Initialize DB connection
func ConnectDB() {
	// Fetch database credentials from environment variables (or you can hardcode them for simplicity)
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),     // MySQL username
		os.Getenv("DB_PASSWORD"), // MySQL password
		os.Getenv("DB_HOST"),     // MySQL host (usually localhost)
		os.Getenv("DB_PORT"),     // MySQL port (usually 3306)
		os.Getenv("DB_NAME"),     // Database name
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to the database: ", err)
	}

	fmt.Println("Database connected successfully!")
}

func GetDB() *gorm.DB {
	return DB
}

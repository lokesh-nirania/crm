package main

import (
	"crm-backend/app/config"
	"crm-backend/app/model"
	routes "crm-backend/app/router"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
		&model.ProductSizeVariant{},
		&model.ProductSource{},

		&model.GRN{},
		&model.Inventory{},
		&model.Admin{},
		&model.Employee{},
		&model.Client{},
	)

	appConfig := config.ReadConfig()
	systemUserID, err := createDefaultUsers(config.DB, appConfig.DefaultUsers)
	if err != nil {
		log.Print("unable to get system user id")
	} else {
		log.Printf("creating products, %v", systemUserID)
		createRandomProducts(config.DB, appConfig.DefaultProfucts, systemUserID)
	}

	router := gin.Default()

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

func createDefaultUsers(db *gorm.DB, defaultUsers []config.DefaultUser) (uint, error) {
	// Add system user to the defaultUsers slice
	systemUser := config.DefaultUser{
		Username: "system",
		Email:    "system@notify.com",
		Role:     "admin",
		Active:   true,
	}
	defaultUsers = append(defaultUsers, systemUser)

	var systemUserID uint

	for _, user := range defaultUsers {
		var existingUser model.User

		// Check if the user already exists
		if err := db.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// User doesn't exist, create a new user

				df := "default_password"
				if user.Password != "" {
					df = user.Password
				}
				newUser := model.User{
					Username: user.Username,
					Email:    user.Email,
					Password: df,        // You can generate a random password here
					UserType: user.Role, // Use the role from the config
					Active:   user.Active,
				}

				// Create the user and capture the system user ID if it's the system user
				if err := db.Create(&newUser).Error; err != nil {
					log.Printf("Failed to create user %s: %v", user.Email, err)
					return 0, err
				} else {
					log.Printf("Created default user: %s", user.Email)

					// Check if the created user is the system user, and capture its ID
					if user.Email == "system@notify.com" {
						systemUserID = newUser.ID
					}
				}
			} else {
				log.Printf("Error checking user %s: %v", user.Email, err)
				return 0, err
			}
		} else {
			log.Printf("User %s already exists", user.Email)

			// If the system user already exists, capture its ID
			if user.Email == "system@notify.com" {
				systemUserID = existingUser.ID
			}
		}
	}

	return systemUserID, nil
}

func createRandomProducts(db *gorm.DB, defaultProducts config.DefaultProducts, systemUserID uint) {

	rand.Seed(time.Now().UnixNano())

	// Processing product properties
	categories := processProductProperty(db, "category", defaultProducts.ProductCategories, &model.ProductCategory{}, systemUserID)
	colors := processProductProperty(db, "color", defaultProducts.ProductColors, &model.ProductColor{}, systemUserID)
	fabrics := processProductProperty(db, "fabric", defaultProducts.ProductFabrics, &model.ProductFabric{}, systemUserID)
	fits := processProductProperty(db, "fit", defaultProducts.ProductFits, &model.ProductFit{}, systemUserID)
	genders := processProductProperty(db, "gender", defaultProducts.ProductGenders, &model.ProductGender{}, systemUserID)
	size_variants := processProductProperty(db, "size_variant", defaultProducts.ProductSizeVariants, &model.ProductSizeVariant{}, systemUserID)
	sources := processProductProperty(db, "source", defaultProducts.ProductSources, &model.ProductSource{}, systemUserID)
	sleeves := processProductProperty(db, "sleeve", defaultProducts.ProductSleeves, &model.ProductSleeve{}, systemUserID)
	variants := processProductProperty(db, "variant", defaultProducts.ProductVariants, &model.ProductVariant{}, systemUserID)

	products := []model.Product{}
	for i := 0; i < defaultProducts.Count; i++ {
		product := &model.Product{
			SKU:              fmt.Sprintf("SKU_%v", i+1),
			Name:             fmt.Sprintf("Name_%v", i+1),
			Status:           true,
			MRP:              float64(rand.Intn(201) + 100), // Random number between 100 and 300
			CostPrice:        float64(rand.Intn(201) + 100), // Random number between 100 and 300
			SellPrice:        float64(rand.Intn(201) + 100), // Random number between 100 and 300
			CategoryID:       randomID(categories),          // Picking random ID from categories
			FitID:            randomID(fits),                // Picking random ID from fits
			VariantID:        randomID(variants),            // Picking random ID from variants
			ColorID:          randomID(colors),              // Picking random ID from colors
			FabricID:         randomID(fabrics),             // Picking random ID from fabrics
			SleeveID:         randomID(sleeves),             // Picking random ID from sleeves
			GenderID:         randomID(genders),             // Picking random ID from genders
			SizeVariantID:    randomID(size_variants),       // Picking random ID from size variants
			SourceID:         randomID(sources),             // Picking random ID from sources
			CreatedByID:      systemUserID,
			LastModifiedByID: systemUserID,
		}

		// Add the product to the list
		products = append(products, *product)
	}

	// Optionally, save products to the database
	for _, product := range products {
		var existingUser model.Product

		// Check if the user already exists
		if err := db.Where("sku = ?", product.SKU).First(&existingUser).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&product).Error; err != nil {
					log.Printf("Failed to create product %s: %v", product.SKU, err)
				} else {
					log.Printf("Created product: %s", product.SKU)
				}
			} else {
				log.Printf("Error checking product %s: %v", product.SKU, err)
			}
		} else {
			log.Printf("Product %s already exists", product.SKU)
		}
	}
}

func randomID(ids []string) uint {
	if len(ids) == 0 {
		return 0
	}
	// Convert string ID to uint
	randomIndex := rand.Intn(len(ids))
	id, err := strconv.ParseUint(ids[randomIndex], 10, 32)
	if err != nil {
		log.Printf("Error parsing ID: %v", err)
		return 0
	}
	return uint(id)
}

func processProductProperty(db *gorm.DB, propertyName string, values []string, m interface{}, systemUserID uint) []string {
	log.Printf("processiong %v | %v", propertyName, systemUserID)
	successIds := []string{}
	for _, value := range values {
		existingRecord := m

		productProperty := model.ProductProperty{
			Name:        value,
			CreatedByID: systemUserID,
		}
		switch v := m.(type) {
		case *model.ProductCategory:
			*v = model.ProductCategory{ProductProperty: productProperty}
		case *model.ProductColor:
			*v = model.ProductColor{ProductProperty: productProperty}
		case *model.ProductFabric:
			*v = model.ProductFabric{ProductProperty: productProperty}
		case *model.ProductFit:
			*v = model.ProductFit{ProductProperty: productProperty}
		case *model.ProductGender:
			*v = model.ProductGender{ProductProperty: productProperty}
		case *model.ProductSizeVariant:
			*v = model.ProductSizeVariant{ProductProperty: productProperty}
		case *model.ProductSource:
			*v = model.ProductSource{ProductProperty: productProperty}
		case *model.ProductSleeve:
			*v = model.ProductSleeve{ProductProperty: productProperty}
		case *model.ProductVariant:
			*v = model.ProductVariant{ProductProperty: productProperty}
		default:
			log.Printf("Unknown property type for %s", value)
			continue
		}
		if err := db.Where("name = ?", value).First(&existingRecord).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Property doesn't exist, create a new entry
				newRecord := m

				productProperty := model.ProductProperty{
					Name:        value,
					CreatedByID: systemUserID,
				}
				switch v := newRecord.(type) {
				case *model.ProductCategory:
					*v = model.ProductCategory{ProductProperty: productProperty}
				case *model.ProductColor:
					*v = model.ProductColor{ProductProperty: productProperty}
				case *model.ProductFabric:
					*v = model.ProductFabric{ProductProperty: productProperty}
				case *model.ProductFit:
					*v = model.ProductFit{ProductProperty: productProperty}
				case *model.ProductGender:
					*v = model.ProductGender{ProductProperty: productProperty}
				case *model.ProductSizeVariant:
					*v = model.ProductSizeVariant{ProductProperty: productProperty}
				case *model.ProductSource:
					*v = model.ProductSource{ProductProperty: productProperty}
				case *model.ProductSleeve:
					*v = model.ProductSleeve{ProductProperty: productProperty}
				case *model.ProductVariant:
					*v = model.ProductVariant{ProductProperty: productProperty}
				default:
					log.Printf("Unknown property type for %s", value)
					continue
				}

				// Create the new record
				if err := db.Create(newRecord).Error; err != nil {
					log.Printf("Failed to create %s %s: %v", propertyName, value, err)
				} else {
					log.Printf("Created default %s: %s", propertyName, value)

					// Get the newly created ID and add it to successIds
					switch v := newRecord.(type) {
					case *model.ProductCategory:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductColor:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductFabric:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductFit:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductGender:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductSizeVariant:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductSource:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductSleeve:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					case *model.ProductVariant:
						successIds = append(successIds, fmt.Sprintf("%d", v.ID))
					}
				}
			} else {
				log.Printf("Error checking %s %s: %v", propertyName, value, err)
			}
		} else {
			log.Printf("%s %s already exists", propertyName, value)
			switch v := existingRecord.(type) {
			case *model.ProductCategory:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductColor:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductFabric:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductFit:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductGender:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductSizeVariant:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductSource:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductSleeve:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			case *model.ProductVariant:
				successIds = append(successIds, fmt.Sprintf("%d", v.ID))
			}
		}
	}

	return successIds
}

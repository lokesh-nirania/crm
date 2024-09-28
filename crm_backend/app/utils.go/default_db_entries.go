package utils

import (
	"crm-backend/app/config"
	"crm-backend/app/model"
	"fmt"
	"log"

	"gorm.io/gorm"
)

func InitializeDBwithDefaultData(db *gorm.DB, defaultUsers []config.DefaultUser) (uint, error) {
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

	initializeSizeVariants(db, systemUserID)
	initializeGenders(db, systemUserID)
	initializeColors(db, systemUserID)
	initializeSources(db, systemUserID)

	return systemUserID, nil

}

func initializeSizeVariants(db *gorm.DB, systemUserID uint) {
	sizeVariants := []model.SizeVariant{
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "XS",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "S",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "M",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "L",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "XL",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "2XL",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "3XL",
				CreatedByID: systemUserID,
			},
		},
		{
			Variant: model.Alpha,
			ProductProperty: model.ProductProperty{
				Name:        "4XL",
				CreatedByID: systemUserID,
			},
		},
	}

	for i := 24; i < 49; i++ {
		sizeVariants = append(sizeVariants, model.SizeVariant{
			Variant: model.Numeric,
			ProductProperty: model.ProductProperty{
				Name:        fmt.Sprintf("%v", i),
				CreatedByID: systemUserID,
			},
		})
	}

	sizeVariants = append(sizeVariants, model.SizeVariant{
		Variant: model.Free,
		ProductProperty: model.ProductProperty{
			Name:        fmt.Sprintf("%v Size", model.Free),
			CreatedByID: systemUserID,
		},
	})

	for _, sizeVariant := range sizeVariants {
		var existingSizeVariant model.SizeVariant
		if err := db.Where("variant = ? AND name = ?", sizeVariant.Variant, sizeVariant.ProductProperty.Name).First(&existingSizeVariant).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Size Variant doesn't exist, create a new one

				// Create the size variant and capture the system size variant ID if it's the system size variant
				if err := db.Create(&sizeVariant).Error; err != nil {
					log.Printf("Failed to create size variant %s: %v", sizeVariant.ProductProperty.Name, err)
					return
				} else {
					log.Printf("Created default size variant: %s", sizeVariant.ProductProperty.Name)
				}
			} else {
				log.Printf("Error checking size variant %s: %v", sizeVariant.ProductProperty.Name, err)
				return
			}
		} else {
			log.Printf("Size Variant %s already exists", sizeVariant.ProductProperty.Name)

		}
	}
}

func initializeGenders(db *gorm.DB, systemUserID uint) {
	genders := []model.ProductGender{
		{
			ProductProperty: model.ProductProperty{
				Name:        "Male",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Female",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Unisex",
				CreatedByID: systemUserID,
			},
		},
	}

	for _, gender := range genders {
		var existingGender model.ProductGender
		if err := db.Where("name = ?", gender.Name).First(&existingGender).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Gender doesn't exist, create a new one

				// Create the Gender and capture the system Gender ID if it's the system Gender
				if err := db.Create(&gender).Error; err != nil {
					log.Printf("Failed to create Gender %s: %v", gender.Name, err)
					return
				} else {
					log.Printf("Created default Gender: %s", gender.Name)
				}
			} else {
				log.Printf("Error checking Gender %s: %v", gender.Name, err)
				return
			}
		} else {
			log.Printf("Gender %s already exists", gender.Name)

		}
	}
}

func initializeColors(db *gorm.DB, systemUserID uint) {
	colors := []model.ProductColor{
		{
			ProductProperty: model.ProductProperty{
				Name:        "Red",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Green",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Blue",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Yellow",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Orange",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Purple",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Pink",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Black",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "White",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Brown",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Gray",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "Cyan",
				CreatedByID: systemUserID,
			},
		},
	}

	for _, color := range colors {
		var existingColor model.ProductColor
		if err := db.Where("name = ?", color.Name).First(&existingColor).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Color doesn't exist, create a new one

				// Create the Color and capture the system Color ID if it's the system Color
				if err := db.Create(&color).Error; err != nil {
					log.Printf("Failed to create Color %s: %v", color.Name, err)
					return
				} else {
					log.Printf("Created default Color: %s", color.Name)
				}
			} else {
				log.Printf("Error checking Color %s: %v", color.Name, err)
				return
			}
		} else {
			log.Printf("Color %s already exists", color.Name)

		}
	}
}

func initializeSources(db *gorm.DB, systemUserID uint) {
	sources := []model.ProductSource{
		{
			ProductProperty: model.ProductProperty{
				Name:        "Internal",
				CreatedByID: systemUserID,
			},
		},
		{
			ProductProperty: model.ProductProperty{
				Name:        "External",
				CreatedByID: systemUserID,
			},
		},
	}

	for _, source := range sources {
		var existingSource model.ProductSource
		if err := db.Where("name = ?", source.Name).First(&existingSource).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// Source doesn't exist, create a new one

				// Create the Source and capture the system Source ID if it's the system Source
				if err := db.Create(&source).Error; err != nil {
					log.Printf("Failed to create Source %s: %v", source.Name, err)
					return
				} else {
					log.Printf("Created default Source: %s", source.Name)
				}
			} else {
				log.Printf("Error checking Source %s: %v", source.Name, err)
				return
			}
		} else {
			log.Printf("Source %s already exists", source.Name)

		}
	}
}

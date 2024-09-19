# Variables
APP_NAME = crm
GO_FILES = $(shell find . -name '*.go' -not -path "./vendor/*")
PKG = ./...

# Default target
all: build run

# Build the binary
build:
	@echo "Building $(APP_NAME)..."
	GOOS=linux GOARCH=amd64 go build -o build/$(APP_NAME) .

# Run tests
test:
	@echo "Running tests..."
	go test $(PKG) -v

# Run the application
run:
	@echo "Running $(APP_NAME)..."
	./build/$(APP_NAME)

# Clean up build files
clean:
	@echo "Cleaning up..."
	rm -f ./build/$(APP_NAME)

# Lint the code
lint:
	@echo "Linting..."
	golangci-lint run ./...

# Format the code
fmt:
	@echo "Formatting Go files..."
	go fmt $(PKG)

# Generate a Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t ./build/$(APP_NAME):latest .

# Phony targets (targets that are not actual files)
.PHONY: all build test run clean lint fmt docker-build

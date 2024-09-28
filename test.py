import requests
import random
import string
import json

# Base API URL
BASE_URL = "http://localhost:8080/api/crm/v1"

# Authorization header (replace with your token)
HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZXhwIjoxNzI3NTU3NzY3LCJyb2xlIjoiYWRtaW4iLCJ1c2VyX2lkIjoxfQ.7hB7E-5PIn-RnLquzR-lqvOgl8_tlqdREfGPWJvuMEg",
    "Content-Type": "application/json"
}

# Generate random SKU
def generate_sku():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

# Helper function to create a property (e.g., fabric, color, etc.)
def create_property(property_type, name):
    url = f"{BASE_URL}/products/add/{property_type}"
    body = {
        "ID": 0,
        "name": name,
        "isChecked": False
    }
    response = requests.post(url, headers=HEADERS, data=json.dumps(body))
    if response.status_code == 200:
        property_id = response.json()['property']['ID']
        print(f"Created {property_type} - {name} with ID: {property_id}")
        return property_id
    else:
        print(f"Failed to create {property_type}: {response.text}")
        return None

# Function to create test properties for a given property type
def create_test_properties(property_type, count=15):
    property_ids = []
    for i in range(1, count + 1):
        name = f"{property_type.capitalize()}_{i}"
        property_id = create_property(property_type, name)
        if property_id:
            property_ids.append(property_id)
    return property_ids

# Create a product with the provided properties
def create_product(sku, category_id, fit_id, variant_id, color_id, fabric_id, sleeve_id, gender_id, source_id, size_variant):
    url = f"{BASE_URL}/products/add"
    body = {
        "id": 0,
        "sku": sku,
        "name": f"Product_{sku}",
        "status": True,
        "mrp": random.randint(100, 1000),
        "cost_price": random.randint(50, 900),
        "sell_price": random.randint(100, 1000),
        "category_id": category_id,
        "fit_id": fit_id,
        "variant_id": variant_id,
        "color_id": color_id,
        "fabric_id": fabric_id,
        "sleeve_id": sleeve_id,
        "gender_id": gender_id,
        "source_id": source_id,
        "size_variant": size_variant
    }
    response = requests.post(url, headers=HEADERS, data=json.dumps(body))
    if response.status_code == 200:
        print(f"Created product with SKU: {sku}")
    else:
        print(f"Failed to create product: {response.text}")

# Main script to create properties and products
def main(num_products):
    # Create properties for categories, fits, variants, colors, fabrics, sleeves, genders, and sources
    category_ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    fit_ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    variant_ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    color_ids = [1,2,3,4,5,6,7,8,9,10,11,12]
    fabric_ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    sleeve_ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
    gender_ids = [1,2,3]
    source_ids = [1,2]

    # Ensure at least one of each property exists
    if not all([category_ids, fit_ids, variant_ids, color_ids, fabric_ids, sleeve_ids, gender_ids, source_ids]):
        print("Failed to create all properties. Exiting.")
        return

    # Create products with random selections from each property
    for _ in range(num_products):
        sku = generate_sku()
        create_product(
            sku,
            random.choice(category_ids),
            random.choice(fit_ids),
            random.choice(variant_ids),
            random.choice(color_ids),
            random.choice(fabric_ids),
            random.choice(sleeve_ids),
            random.choice(gender_ids),
            random.choice(source_ids),
            size_variant=random.choice(["Alpha", "Numeric", "Free"]),
        )

# Run the script to create 15 items of each property and 10 products
if __name__ == "__main__":
    num_products_to_create = 36000  # Change this value to create more or fewer products
    main(num_products_to_create)

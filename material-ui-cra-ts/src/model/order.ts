import Product, { SizeVariant, SpecificSizeVariant } from "./product";
import User from "./user";

// api request
export interface PlaceOrderRequest {
	order: CartItem[],
	total_price: number;
}

export interface PlaceOrderAdminRequest {
	products: {
		product_id: number;
		size_variants: SpecificSizeVariant[];
		price: number;
	}[],
	created_for_id: number;
	total_price: number;
}


// api response
export interface GetOrdersResponse {
	"page": number,
	"page_size": number,
	"total_items": number,
	"total_pages": number,
	"orders": Order[];
}

export interface AddOrderResponse {
	status: string;
	order: Order;
}

// model
export class CartItem {
	product_id: number = 0;
	sets: SetForCat[] = [];
}

export class SetForCat {
	size1: SizeVariant;
	size2: SizeVariant;
	size3: SizeVariant;
	quantity: number;
	price: number = 0;

	constructor(size1: SizeVariant, size2: SizeVariant, size3: SizeVariant, quantity: number) {
		this.size1 = size1;
		this.size2 = size2;
		this.size3 = size3;
		this.quantity = quantity;
	}
}


export default class Order {
	ID: number;
	CreatedAt: string;
	UpdatedAt: string;
	Status: string;
	Price: number;
	created_by: User;
	created_for: User;
	confirmed_by: User | null = null;
	cancelled_by: User | null = null;
	OrderProducts: OrderProducts[] = [];
	constructor(ID: number, CreatedAt: string, UpdatedAt: string, Status: string, Price: number, created_by: User, created_for: User) {
		this.ID = ID;
		this.CreatedAt = CreatedAt;
		this.UpdatedAt = UpdatedAt;
		this.Status = Status;
		this.Price = Price;
		this.created_by = created_by;
		this.created_for = created_for;
	}
}

export class OrderProducts {
	ID: number;
	CreatedAt: string;
	UpdatedAt: string;
	ProductID: number;
	Product: Product;
	size_variant_1: SpecificSizeVariant;
	size_variant_2: SpecificSizeVariant | null;
	size_variant_3: SpecificSizeVariant | null;
	Quantity: number;
	Price: number;

	constructor(ID: number, CreatedAt: string, UpdatedAt: string, ProductID: number, Product: Product, size_variant_1: SpecificSizeVariant, size_variant_2: SpecificSizeVariant, size_variant_3: SpecificSizeVariant, Quantity: number, Price: number,) {
		this.ID = ID;
		this.CreatedAt = CreatedAt;
		this.UpdatedAt = UpdatedAt;
		this.ProductID = ProductID;
		this.Product = Product;
		this.size_variant_1 = size_variant_1;
		this.size_variant_2 = size_variant_2;
		this.size_variant_3 = size_variant_3;
		this.Quantity = Quantity;
		this.Price = Price;
	}
}
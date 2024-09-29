import { SizeVariant, SpecificSizeVariant } from "./product";
import User from "./user";

// api request
export interface PlaceOrderRequest {
	order: CartItem[],
	total_price: number;
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
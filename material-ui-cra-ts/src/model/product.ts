import User from "./user";
// api request
export interface ProductFormDataRequest {
	id: number;
	sku: string;
	name: string;
	status: boolean;
	mrp: number;
	cost_price: number;
	sell_price: number;
	category_id: number;
	fit_id: number;
	variant_id: number;
	color_id: number;
	fabric_id: number;
	sleeve_id: number;
	gender_id: number;
	size_variant_id: number;
	source_id: number;
}

export interface ProductFormDataResponse {
	success: boolean;
	product: ProductFormDataRequest;
}

export interface ProductPropertyAddResponse {
	success: boolean;
	property_name: string;
	property: ProductProperty;
}

// api response
export interface FilteredProductsResponse {
	"page": number,
	"page_size": number,
	"total_items": number,
	"total_pages": number,
	products: Array<Product>,
}

export interface FiltersResponse {
	filters: Array<FilterResponse>
}

export interface FilterResponse {
	name: string;
	type: string;
	metadata: any;
}

export interface ProductPropertiesResponse {
	properties: {
		categories: ProductProperty[];
		colors: ProductProperty[];
		fabrics: ProductProperty[];
		fits: ProductProperty[];
		genders: ProductProperty[];
		size_variants: ProductProperty[];
		sleeves: ProductProperty[];
		sources: ProductProperty[];
		variants: ProductProperty[];
	}
}



// product model
export default class Product {
	ID: number;
	sku: string;
	name: string;
	status: boolean;
	mrp: number;
	cost_price: number;
	sell_price: number;
	category: ProductProperty;
	fit: ProductProperty;
	variant: ProductProperty;
	color: ProductProperty;
	fabric: ProductProperty;
	sleeve: ProductProperty;
	gender: ProductProperty;
	size_variant: ProductProperty;
	source: ProductProperty;
	createdBy: User;
	lastModifiedBy: User;

	constructor(
		ID: number,
		sku: string = "",
		name: string = "",
		status: boolean = false,
		mrp: number = 0,
		cost_price: number = 0,
		sell_price: number = 0,
		category: ProductProperty,
		fit: ProductProperty,
		variant: ProductProperty,
		color: ProductProperty,
		fabric: ProductProperty,
		sleeve: ProductProperty,
		gender: ProductProperty,
		size_variant: ProductProperty,
		source: ProductProperty,
		createdBy: User,
		lastModifiedBy: User
	) {
		this.ID = ID;
		this.sku = sku;
		this.name = name;
		this.status = status;
		this.mrp = mrp;
		this.cost_price = cost_price;
		this.sell_price = sell_price;
		this.category = category;
		this.fit = fit;
		this.variant = variant;
		this.color = color;
		this.fabric = fabric;
		this.sleeve = sleeve;
		this.gender = gender;
		this.size_variant = size_variant;
		this.source = source;
		this.createdBy = createdBy;
		this.lastModifiedBy = lastModifiedBy;
	}
}

export class ProductProperty {
	ID: number;
	name: string;
	// createdBy: User;
	isChecked: boolean;

	constructor(id: number, name: string = "", isChecked: boolean = false) {
		this.ID = id;
		this.name = name;
		// this.createdBy = createdBy;
		this.isChecked = isChecked;
	}
}


// filters
export class ProductFilter {
	name: string;
	filterType: string;
	isSelected: boolean;

	constructor(name: string, filterType: string, isSelected = false) {
		this.name = name;
		this.filterType = filterType;
		this.isSelected = isSelected;
	}
}

export class RangeFilter extends ProductFilter {
	min: number;
	max: number;

	constructor(name: string, filterType = "range", isSelected = false, min = 0, max = 90000) {
		super(name, filterType, isSelected);
		this.min = min;
		this.max = max;
	}
}

export class LikeFilter extends ProductFilter {
	content: string;

	constructor(name: string, filterType = "range", isSelected = false, content: string) {
		super(name, filterType, isSelected);
		this.content = content;
	}
}

export class ListFilter extends ProductFilter {
	values: Array<ProductProperty>;

	constructor(name: string, filterType = "range", isSelected = false, values: Array<ProductProperty>) {
		super(name, filterType, isSelected);
		this.values = values;
	}
}


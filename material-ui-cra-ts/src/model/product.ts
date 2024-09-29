import User from "./user";
// api request
export interface ProductFormDataRequest {
	id: number;
	sku: string;
	name: string;
	description: string;
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
	source_id: number;
	size_variant: string;
	image_file_id: string;
}


export interface ProductFormDataResponse {
	success: boolean;
	product: ProductFormDataRequest;
}

export interface ProductPropertyAddResponse {
	success: boolean;
	property_name: string;
	property: ProductAttributeProperty;
}

// api response
export interface FilteredProductsResponse {
	"page": number,
	"page_size": number,
	"total_items": number,
	"total_pages": number,
	products: Array<Product>,
}

export interface ProductWithInventoryResponse {
	product: ProductWithInventory,
}

export interface FiltersResponse {
	filters: Array<FilterResponse>
}

export interface FilterResponse {
	name: string;
	type: string;
	metadata: any;
}

export interface ProductAttributesResponse {
	properties: {
		categories: ProductAttributeProperty[];
		colors: ProductAttributeProperty[];
		fabrics: ProductAttributeProperty[];
		fits: ProductAttributeProperty[];
		genders: ProductAttributeProperty[];
		sleeves: ProductAttributeProperty[];
		sources: ProductAttributeProperty[];
		variants: ProductAttributeProperty[];
	},
	lists: {
		size_variants: string[];
	}
}

export interface SizeVariantListResponse {
	status: string;
	size_variants: SizeVariant[]
}



// product model
export default class Product {
	ID: number;
	sku: string;
	name: string;
	status: boolean;
	description: string;
	mrp: number;
	cost_price: number;
	sell_price: number;
	category: ProductAttributeProperty;
	fit: ProductAttributeProperty;
	variant: ProductAttributeProperty;
	color: ProductAttributeProperty;
	fabric: ProductAttributeProperty;
	sleeve: ProductAttributeProperty;
	gender: ProductAttributeProperty;
	size_variant: string;
	source: ProductAttributeProperty;
	image_file_id: string;
	createdBy: User;
	lastModifiedBy: User;

	constructor(
		ID: number,
		sku: string = "",
		name: string = "",
		status: boolean = false,
		description: string,
		mrp: number = 0,
		cost_price: number = 0,
		sell_price: number = 0,
		category: ProductAttributeProperty,
		fit: ProductAttributeProperty,
		variant: ProductAttributeProperty,
		color: ProductAttributeProperty,
		fabric: ProductAttributeProperty,
		sleeve: ProductAttributeProperty,
		gender: ProductAttributeProperty,
		size_variant: string,
		source: ProductAttributeProperty,
		image_file_id: string,
		createdBy: User,
		lastModifiedBy: User
	) {
		this.ID = ID;
		this.sku = sku;
		this.name = name;
		this.status = status;
		this.description = description;
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
		this.image_file_id = image_file_id;
		this.createdBy = createdBy;
		this.lastModifiedBy = lastModifiedBy;
	}
}

export class ProductWithInventory extends Product {
	available_sizes: SpecificSizeVariant[] = [];
	available_sets: number[][] = [];
}

export class ProductAttributeProperty {
	ID: number;
	name: string;
	isChecked: boolean;

	constructor(id: number, name: string = "", isChecked: boolean = false) {
		this.ID = id;
		this.name = name;
		// this.createdBy = createdBy;
		this.isChecked = isChecked;
	}
}

export class ProductAttributeList {
	name: string;
	isChecked: boolean;

	constructor(name: string = "", isChecked: boolean = false) {
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

	constructor(name: string, filterType = "like", isSelected = false, content = "") {
		super(name, filterType, isSelected);
		this.content = content;
	}
}

export class PropertyFilter extends ProductFilter {
	values: Array<ProductAttributeProperty>;

	constructor(name: string, filterType = "property", isSelected = false, values: Array<ProductAttributeProperty>) {
		super(name, filterType, isSelected);
		this.values = values;
	}
}

export class ListFilter extends ProductFilter {
	values: Array<ProductAttributeList>;

	constructor(name: string, filterType = "list", isSelected = false, values: Array<ProductAttributeList> = []) {
		super(name, filterType, isSelected);
		this.values = values;
	}
}

// size variants
export class SizeVariant {
	id: number;
	variant: string;
	name: string;
	created_by: User;

	constructor(id: number, variant: string, name: string, created_by: User) {
		this.id = id;
		this.variant = variant;
		this.name = name;
		this.created_by = created_by;
	}
}

export class SpecificSizeVariant extends SizeVariant {
	quantity: number;

	constructor(id: number, variant: string, name: string, created_by: User, quantity: number) {
		super(id, variant, name, created_by);
		this.quantity = quantity;
	}

}


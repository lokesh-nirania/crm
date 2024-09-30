import { SpecificSizeVariant } from "./product";
import User from "./user";

// api request
export interface AddGRNFormDataRequest {
	expected_date: string;
	status: string;
	source: string;
	po: string;
	remarks: string;
	vendor_id: number;
	warehouse_id: number;
	products: {
		product_id: number;
		size_variants: SpecificSizeVariant[];
	}[]
}

export interface ConfirmGRNRequest {
	grn_id: number;
}


export interface AddGRNWarehouseRequest {
	name: string;
	code: string;
}

export interface AddGRNVendorRequest {
	name: string;
	code: string;
}



// api response
export interface AddGRNResponse {
	status: string;
	grn: GRN;
}

export interface FilteredGRNsResponse {
	"page": number,
	"page_size": number,
	"total_items": number,
	"total_pages": number,
	grns: Array<GRN>,
}

export interface GetGRNWarehouseResponse {
	warehouses: Warehouse[]
}

export interface GetGRNVendorResponse {
	vendors: Vendor[]
}

export interface GetGRNSourcesResponse {
	sources: string[]
}

export interface AddGRNWarehouseResponse {
	status: string;
	warehouse: Warehouse;
}

export interface AddGRNVendorResponse {
	status: string;
	warehouse: Warehouse;
}

// grn model
export default class GRN {
	id: number;
	status: string;
	source: string;
	po: string;
	remarks: string;
	vendor: Vendor;
	warehouse: Warehouse;
	created_at: string;
	expected_date: string;
	confirmed_date: string;
	created_by: User;
	confirmed_by: User | null;

	constructor(
		ID: number,
		status: string,
		source: string,
		po: string,
		remarks: string,
		vendor: Vendor,
		warehouse: Warehouse,
		created_at: string,
		expected_date: string,
		confirmed_date: string,
		created_by: User,
		confirmed_by: User,
	) {
		this.id = ID;
		this.status = status;
		this.source = source;
		this.po = po;
		this.remarks = remarks;
		this.vendor = vendor;
		this.warehouse = warehouse;
		this.created_at = created_at;
		this.expected_date = expected_date;
		this.created_by = created_by;
		this.confirmed_date = confirmed_date;
		this.confirmed_by = confirmed_by;
	}
}

export class Vendor {
	ID: number;
	name: string;
	code: string;
	created_by: User;

	constructor(
		ID: number,
		name: string,
		code: string,
		created_by: User,
	) {
		this.ID = ID;
		this.name = name;
		this.code = code;
		this.created_by = created_by;
	}
}

export class Warehouse {
	ID: number;
	name: string;
	code: string;
	created_by: User;

	constructor(
		ID: number,
		name: string,
		code: string,
		created_by: User,
	) {
		this.ID = ID;
		this.name = name;
		this.code = code;
		this.created_by = created_by;
	}
}


import React, { useEffect, useState } from 'react';
import { getAllFilteredProducts, getAllFilters } from '../api/product_service';
import { enqueueSnackbar } from 'notistack';
import Product, { ListFilter, ProductFilter, ProductProperty } from '../model/product';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { DataGrid, GridPaginationModel, GridRowSelectionModel, GridRowsProp } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';

const Products: React.FC = () => {

	const [tempfilters, setTempFilters] = useState<Array<ProductFilter>>([]);
	const [filters, setFilters] = useState<Array<ProductFilter>>([]);
	const [initialFilters, setInitialFilters] = useState<Array<ProductFilter>>([]);

	const [openFormDialog, setOpenFormDialog] = useState(false);

	const navigate = useNavigate();

	const fetchProductFilters = async () => {
		try {
			const f = await getAllFilters();
			setFilters(f);
			setTempFilters(f);
			setInitialFilters(f);

		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const handleApplyFilters = () => {
		setFilters(tempfilters);
	}

	const handleCheckBoxChange = (fid: number, pid: number, nv: boolean) => {
		console.log(fid, pid);

		const updatedFilters: Array<ProductFilter> = [];

		tempfilters.forEach((f, fi) => {
			if (f instanceof ListFilter) {
				let npps: Array<ProductProperty> = []
				f.values.forEach((pp, ppi) => {
					let npp: ProductProperty = new ProductProperty(pp.ID, pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
					npps.push(npp)
				});
				let nf: ListFilter = new ListFilter(f.name, f.filterType, f.isSelected, npps)
				updatedFilters.push(nf)
			}
		});

		setTempFilters(updatedFilters);
	}
	useEffect(() => {
		fetchProductFilters();
	}, []);

	useEffect(() => {
		console.log("filters are changed above");
	}, [filters]);


	return (
		<div style={{ display: 'flex', width: '100%' }}>

			<div style={{ width: '200px', marginRight: '16px' }}>
				{initialFilters.map((f, fi) => {
					if (f instanceof ListFilter) {
						return (
							<Accordion sx={{ margin: 0, padding: 0 }} key={fi}>
								<AccordionSummary
									expandIcon={<ExpandMore />}
									aria-controls="panel1-content"
									id="panel1-header"
								>
									{f.name.toUpperCase()}
								</AccordionSummary>
								<AccordionDetails>
									<FormGroup>
										{f.values.map((v, vi) => {
											return (
												<FormControlLabel
													key={vi}
													control={
														<Checkbox
															onChange={(h) => {
																console.log("h.target.checked ", h.target.checked)
																handleCheckBoxChange(fi, vi, h.target.checked);
															}}
															defaultChecked={v.isChecked}
														/>
													}
													label={v.name}
												/>
											);
										})}
										<Button
											variant="contained"
											color="primary"
											onClick={() => handleApplyFilters()} // Add your handler function here
											sx={{ marginTop: 2 }} // Optional: Add margin for spacing
										>
											Apply
										</Button>
									</FormGroup>
								</AccordionDetails>
							</Accordion>
						);
					}
					return null; // Return null for unsupported filter types
				})}
				<Button
					variant="contained"
					color="primary"
					onClick={() => setOpenFormDialog(true)} // Add your handler function here
					sx={{ marginTop: 2 }} // Optional: Add margin for spacing
				>
					Add New Product
				</Button>
			</div>

			{/* Products Table Section */}
			<div style={{}}>
				<ProductsTable filters={filters} />
			</div>

			<Dialog open={openFormDialog} onClose={() => { setOpenFormDialog(false) }} fullWidth>
				<DialogTitle>Add New Product</DialogTitle>
				<DialogContent>
					<ProductForm onSuccess={() => { setOpenFormDialog(false); fetchProductFilters(); }} /> {/* Pass the close function to Auth */}
				</DialogContent>
			</Dialog>
		</div>
	);

};

export default Products;

interface ProductsTableProps {
	filters: Array<ProductFilter>;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ filters }) => {
	const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
		page: 0,
		pageSize: 10,
	});
	const [rows, setRows] = useState<GridRowsProp>([]);
	const [loading, setLoading] = useState(false);
	const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
	const [rowCount, setRowCount] = useState(0);

	// Simulated API call to fetch data
	const fetchProducts = async (page: number, pageSize: number) => {
		setLoading(true);
		try {
			const f = await getAllFilteredProducts(filters, page, pageSize);
			let a: Array<{
				id: number,
				sku: string,
				name: string,
				status: string,
				mrp: number,
				cost_price: number,
				sell_price: number,
				category: string,
				fit: string,
				variant: string,
				color: string,
				fabric: string,
				sleeve: string,
				gender: string,
				size_variant: string,
				source: string,
			}> = [];

			// Iterate over fetched products and populate the 'a' array
			f.products.forEach((element: Product) => {
				a.push({
					id: element.ID,
					sku: element.sku,
					name: element.name,
					status: element.status ? 'Active' : 'Inactive',
					mrp: element.mrp,
					cost_price: element.cost_price,
					sell_price: element.sell_price,
					category: element.category.name,
					fit: element.fit.name,
					variant: element.variant.name,
					color: element.color.name,
					fabric: element.fabric.name,
					sleeve: element.sleeve.name,
					gender: element.gender.name,
					size_variant: element.size_variant.name,
					source: element.source.name,
				});
			});

			// Set the rows with the new array of products
			setRows(a);
			setRowCount(f.total_items); // Assuming data.totalItems gives total product count
		} catch (error) {
			console.error("Failed to fetch data:", error);
		}
		setLoading(false);
	};

	// Fetch data when page or page size changes
	useEffect(() => {
		console.log("filters are changed");
		fetchProducts(paginationModel.page + 1, paginationModel.pageSize);
	}, [paginationModel.page, paginationModel.pageSize, filters]);

	return (
		<div style={{ height: '100%', width: 1600, overflow: 'auto' }}>
			<DataGrid
				rows={rows}
				pagination
				// checkboxSelection
				disableColumnMenu
				disableColumnSorting
				paginationModel={paginationModel}
				pageSizeOptions={[3, 5, 10, 20, 50, 100]}
				rowCount={rowCount}
				paginationMode="server"
				onPaginationModelChange={setPaginationModel}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					setRowSelectionModel(newRowSelectionModel);
				}}
				rowSelectionModel={rowSelectionModel}
				loading={loading}
				keepNonExistentRowsSelected


				columns={[
					// { field: 'id', headerName: 'ID', width: 90 },
					{ field: 'sku', headerName: 'SKU', flex: 2 },
					{ field: 'name', headerName: 'Name', flex: 2 },
					{ field: 'mrp', headerName: 'MRP', flex: 1 },
					{ field: 'cost_price', headerName: 'Cost Price', flex: 1 },
					{ field: 'sell_price', headerName: 'Sell Price', flex: 1 },
					{ field: 'status', headerName: 'Status', flex: 1 },
					{ field: 'category', headerName: 'Category', flex: 1 },
					{ field: 'fit', headerName: 'Fit', flex: 1 },
					{ field: 'variant', headerName: 'Variant', flex: 1 },
					{ field: 'color', headerName: 'Color', flex: 1 },
					{ field: 'fabric', headerName: 'Fabric', flex: 1 },
					{ field: 'sleeve', headerName: 'Sleeve', flex: 1 },
					{ field: 'gender', headerName: 'Gender', flex: 1 },
					{ field: 'size_variant', headerName: 'Size Variant', flex: 1 },
					{ field: 'source', headerName: 'Source', flex: 1 },

				]}

			/>
		</div>
	);
};


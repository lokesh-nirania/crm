import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { getAllFilteredProducts, getAllFilters } from '../api/product_service';
import { enqueueSnackbar } from 'notistack';
import Product, { PropertyFilter, ProductFilter, ProductAttributeProperty, ListFilter, ProductAttributeList } from '../model/product';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, IconButton } from '@mui/material';
import { Edit, ExpandMore, Visibility } from '@mui/icons-material';
import { DataGrid, GridPaginationModel, GridRowSelectionModel, GridRowsProp } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductInfoCard from '../components/ProductCard';

const Products: React.FC = () => {

	const [tempfilters, setTempFilters] = useState<Array<ProductFilter>>([]);
	const [filters, setFilters] = useState<Array<ProductFilter>>([]);
	const [initialFilters, setInitialFilters] = useState<Array<ProductFilter>>([]);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

	const [openFormDialog, setOpenFormDialog] = useState(false);
	const [openInfoCard, setOpenInfoCard] = useState(false);

	const fetchProductFilters = async () => {
		try {
			const f = await getAllFilters();
			setFilters(f);
			setTempFilters(f);
			setInitialFilters(f);

		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
			window.location.href = '/';
		}
	}

	const handleApplyFilters = () => {
		setFilters(tempfilters);
	}

	const handleCheckBoxChange = (fid: number, pid: number, nv: boolean) => {
		console.log(fid, pid);

		const updatedFilters: Array<ProductFilter> = [];

		tempfilters.forEach((f, fi) => {
			if (f instanceof PropertyFilter) {
				let npps: Array<ProductAttributeProperty> = []
				f.values.forEach((pp, ppi) => {
					let npp: ProductAttributeProperty = new ProductAttributeProperty(pp.ID, pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
					npps.push(npp)
				});
				const nf = new PropertyFilter(f.name, f.filterType, f.isSelected, npps)
				updatedFilters.push(nf)
			} else if (f instanceof ListFilter) {
				let npps: Array<ProductAttributeList> = []
				f.values.forEach((pp, ppi) => {
					let npp: ProductAttributeList = new ProductAttributeList(pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
					npps.push(npp)
				});
				const nf = new ListFilter(f.name, f.filterType, f.isSelected, npps)
				updatedFilters.push(nf);
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
				{initialFilters.length > 0 && initialFilters.map((f, fi) => {
					if ((f instanceof PropertyFilter || f instanceof ListFilter) && f.values.length > 0) {
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
					} else if (f instanceof ListFilter && f.values.length > 0) {

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
				<ProductsTable
					filters={filters}
					setOpenInfoCard={setOpenInfoCard}
					setSelectedProduct={setSelectedProduct}
				/>
			</div>

			<Dialog open={openFormDialog} onClose={() => { setOpenFormDialog(false); }} fullWidth>
				<DialogTitle>Add New Product</DialogTitle>
				<DialogContent>
					<ProductForm
						onSuccess={() => { setOpenFormDialog(false); fetchProductFilters(); }}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={openInfoCard} onClose={() => { setOpenInfoCard(false); }} fullWidth>
				<DialogTitle>View Product Details</DialogTitle>
				<DialogContent>
					<ProductInfoCard product={selectedProduct} />
				</DialogContent>
			</Dialog>
		</div >
	);

};

export default Products;

interface ProductsTableProps {
	filters: Array<ProductFilter>;
	setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
	setOpenInfoCard: Dispatch<SetStateAction<boolean>>;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ filters, setSelectedProduct, setOpenInfoCard }) => {
	const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
		page: 0,
		pageSize: 10,
	});
	const [rows, setRows] = useState<GridRowsProp>([]);
	const [products, setProducts] = useState<Array<Product>>([]);
	const [loading, setLoading] = useState(false);
	const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
	const [rowCount, setRowCount] = useState(0);

	// Simulated API call to fetch data
	const fetchProducts = async (page: number, pageSize: number) => {
		setLoading(true);
		try {
			const f = await getAllFilteredProducts(filters, page, pageSize);
			let a: Array<{
				index: number,
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
				actions: JSX.Element,
			}> = [];

			setProducts(f.products);

			// Iterate over fetched products and populate the 'a' array
			f.products.forEach((element: Product, index: number) => {
				a.push({
					index: index,
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
					size_variant: element.size_variant,
					source: element.source.name,
					actions: <></>,
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
		<div style={{ height: "100%", width: 1600, overflow: 'auto' }}>
			<DataGrid
				disableMultipleRowSelection={true}
				autoHeight
				rows={rows}
				pagination
				rowHeight={40}
				checkboxSelection

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
					{
						field: 'actions', headerName: "Actions", flex: 1,
						renderCell: (params) => (
							<div>
								<IconButton aria-label="edit" onClick={() => { setOpenInfoCard(true); setSelectedProduct(products[params.row.index]) }}>
									<Visibility />
								</IconButton>
							</div>
						),
					},

				]}

			/>
		</div>
	);
};


import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, MenuItem, Button, Grid2 as Grid, Box, OutlinedInput, InputAdornment, Checkbox, FormGroup, FormControlLabel, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import Product, { ProductAttributeProperty, SpecificSizeVariant } from '../../model/product';
import { enqueueSnackbar } from 'notistack';
import GRN, { AddGRNFormDataRequest, Vendor, Warehouse } from '../../model/grns';
import { getGRNSources, getGRNVendors, getGRNWarehouses, postGRNData } from '../../api/grns_service';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import GRNWarehouseForm from './GRNWarehouseForm';
import GRNVendorForm from './GRNVendorForm';
import dayjs from 'dayjs';
import GRNProductForm from './GRNProductForm';

// Define types for your dropdown options and product data


const GRNForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
	const [openAddWarehouseForm, setAddWarehouseForm] = React.useState(false);
	const [openAddVendorForm, setAddVendorForm] = React.useState(false);
	const [openAddProductForm, setAddProductForm] = React.useState(false);

	const [selectedVendor, setSelectedVendor] = useState<Vendor | null>();
	const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);

	const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>();
	const [warehouseOptions, setWarehouseOptions] = useState<Warehouse[]>([]);

	const [selectedSource, setSelectedSource] = useState<string>("");
	const [sourceOptions, setSourceOptions] = useState<string[]>([]);

	const [date, setDate] = useState<dayjs.Dayjs>(dayjs());
	const [remarks, setRemarks] = useState("");
	const [po, setPO] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [sizeVariants, setSizeVariants] = useState<SpecificSizeVariant[][]>([]);

	const fetchWarehouseOptions = async () => {
		try {

			const w = await getGRNWarehouses();
			setWarehouseOptions(w.warehouses);
			setSelectedWarehouse(w.warehouses[0] ?? null);

		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const fetchVendorOptions = async () => {
		try {

			const v = await getGRNVendors();
			setVendorOptions(v.vendors);
			setSelectedVendor(v.vendors[0] ?? null)

		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const fetchSourceOptions = async () => {
		try {

			const s = await getGRNSources();
			setSourceOptions(s.sources);
			setSelectedSource(s.sources[0] ?? null)

		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const addProductWithVariants = async (product: Product, sizeVaraints: SpecificSizeVariant[]) => {
		setProducts((prevProducts) => [...prevProducts, product]);
		setSizeVariants((prevProducts) => [...prevProducts, sizeVaraints]);
		console.log("added product i guess ", product.sku, sizeVaraints)
	}

	const deleteProductWithVariants = async (index: number) => {
		setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
		setSizeVariants((prevVariants) => prevVariants.filter((_, i) => i !== index));

		console.log("Deleted product and size variants at index", index);
	};


	const saveGRN = async () => {
		try {
			const grnData: AddGRNFormDataRequest = {
				expected_date: date.format("DD/MM/YYYY"),
				status: "Pending",
				source: selectedSource,
				po: po,
				remarks: remarks,
				vendor_id: selectedVendor?.ID ?? 0,
				warehouse_id: selectedWarehouse?.ID ?? 0,
				products: products.map((p, pi) => {
					return {
						product_id: p.ID,
						size_variants: sizeVariants[pi],
					}
				})
			}
			await postGRNData(grnData);
			enqueueSnackbar("GRN Added Successfully", { variant: 'success' });
			onSuccess();
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}



	useEffect(() => {
		fetchWarehouseOptions();
		fetchVendorOptions();
		fetchSourceOptions();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveGRN();
	};



	return (
		<div>
			<form onSubmit={handleSubmit}>
				<Box sx={{ mt: 2 }}>
					<Grid container spacing={2}>
						<Grid size={5}>
							<Grid container direction="column" spacing={2}>
								<Grid>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker label="Expected Date"
											defaultValue={date}
											format='DD/MM/YYYY'
											onChange={(newValue) => {
												if (newValue !== null) setDate(newValue)
											}}
										/>
									</LocalizationProvider>
								</Grid>
								<Grid>
									<TextField
										id="source"
										select
										label="Source"
										fullWidth
										value={selectedSource}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											setSelectedSource(event.target.value);
										}}
									>
										{sourceOptions.map((option) => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
									</TextField>
								</Grid>
							</Grid>
						</Grid>
						<Grid size={7}>
							<TextField id="remarks" label="Remarks" variant="outlined" fullWidth
								value={remarks}
								multiline
								rows={4}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setRemarks(event.target.value)
								}}
							/>
						</Grid>
						<Grid size={5}>
							<TextField id="po" label="PO" variant="outlined" fullWidth
								value={po}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setPO(event.target.value)
								}}
							/>
						</Grid>
						<Grid size={6}>
							<TextField
								id="warehouse"
								select
								label="Warehouse"
								fullWidth size="small"
								value={selectedWarehouse?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = warehouseOptions.find(option => option.name === event.target.value);
									setSelectedWarehouse(selectedOption);

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => { setAddWarehouseForm(true) }}
										>
											Add Warehouse
										</Button>
									</Box>
								}
							>
								{warehouseOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={6}>
							<TextField
								id="vendor"
								select
								label="Vendor"
								fullWidth size="small"
								value={selectedVendor?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = vendorOptions.find(option => option.name === event.target.value);
									setSelectedVendor(selectedOption);

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => { setAddVendorForm(true) }}
										>
											Add Vendor
										</Button>
									</Box>
								}
							>
								{vendorOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						{products.map((p, pi) => {
							return <Box sx={{ p: 2, border: '1px dashed grey' }}>
								<Grid container spacing={2}>
									<Grid size={9}>
										<TextField
											id="product"
											label="Product"
											fullWidth
											slotProps={{
												input: {
													readOnly: true, // Recommended way
												},
											}}
											value={p.sku + " (" + p.name + ")"}
										>

										</TextField>
									</Grid>
									<Grid size={3}>
										<TextField
											id="size_variant"
											label="Size Variant"
											fullWidth
											slotProps={{
												input: {
													readOnly: true, // Recommended way
												},
											}}
											value={p.size_variant}

										>

										</TextField>

									</Grid>

									{sizeVariants[pi].map((sv, si) => {
										if (sv.quantity > 0) {
											return <Grid size={3}>
												<TextField
													id="size_variant"
													label={sv.variant === "Free" ? "Quantity" : sv.name}
													type="number"
													slotProps={{
														input: {
															readOnly: true, // Recommended way
														},
													}}
													fullWidth
													value={sv.quantity}
												>

												</TextField>

											</Grid>
										}
									})}
								</Grid>
								<Box display="flex" justifyContent="end">
									{/* <Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { setAddProductForm(true) }}>Edit</Button> */}
									<Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { deleteProductWithVariants(pi) }}>Delete</Button>
								</Box>
							</Box>
						})
						}







					</Grid>
					<Box display="flex" justifyContent="end">
						<Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { setAddProductForm(true) }}>Add Product</Button>
					</Box>
					<Box display="flex" justifyContent="end">
						<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onSuccess}>Cancel</Button>
						<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" onClick={handleSubmit}>Save</Button>
					</Box>
				</Box>
			</form >
			<Dialog open={openAddWarehouseForm} onClose={() => { setAddWarehouseForm(false); }}>
				<DialogTitle>Add Warehouse</DialogTitle>
				<DialogContent>
					<GRNWarehouseForm onSuccess={() => { setAddWarehouseForm(false); fetchWarehouseOptions(); }} />
				</DialogContent>
			</Dialog>
			<Dialog open={openAddVendorForm} onClose={() => { setAddVendorForm(false) }}>
				<DialogTitle>Add Vendor</DialogTitle>
				<DialogContent>
					<GRNVendorForm onSuccess={() => { setAddVendorForm(false); fetchVendorOptions(); }} />
				</DialogContent>
			</Dialog>
			<Dialog open={openAddProductForm} onClose={() => { setAddProductForm(false) }}>
				<DialogTitle>Add Product</DialogTitle>
				<DialogContent>
					<GRNProductForm
						onSuccess={(product: Product, sizeVaraints: SpecificSizeVariant[]) => {
							setAddProductForm(false);
							addProductWithVariants(product, sizeVaraints);
						}}
						onClose={() => setAddProductForm(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default GRNForm;

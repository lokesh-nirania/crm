import React, { useState, useEffect } from 'react';
import { TextField, Switch, FormControl, InputLabel, MenuItem, Button, Grid2 as Grid, Paper, styled, Box, Card, OutlinedInput, InputAdornment, Checkbox, FormGroup, FormControlLabel, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ProductFormDataRequest, ProductProperty } from '../model/product';
import { getProductProperties, postProductForm, postProductProperty } from '../api/product_service';
import { enqueueSnackbar } from 'notistack';
// Define types for your dropdown options and product data


const ProductForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
	const [open, setOpen] = React.useState(false);
	const [openTitle, setOpenTitle] = React.useState("");
	const [openLabel, setOpenLabel] = React.useState("");
	const [openKey, setOpenKey] = React.useState("");
	const [openValue, setOpenValue] = React.useState<ProductProperty>({ ID: 0, name: "", isChecked: false });

	const handleClose = () => {
		setOpen(false);
	};

	// Form state with types
	const [productData, setProductData] = useState<ProductFormDataRequest>({
		id: 0,
		sku: "",
		name: "",
		status: false,
		mrp: 0,
		cost_price: 0,
		sell_price: 0,
		category_id: 0,
		fit_id: 0,
		variant_id: 0,
		color_id: 0,
		fabric_id: 0,
		sleeve_id: 0,
		gender_id: 0,
		size_variant_id: 0,
		source_id: 0,
	});

	const [isLoading, setIsLoading] = useState(false);

	// Dropdown options state (you'll fetch these from APIs)
	const [categoryOptions, setCategoryOptions] = useState<ProductProperty[]>([]);
	const [fitOptions, setFitOptions] = useState<ProductProperty[]>([]);
	const [variantOptions, setVariantOptions] = useState<ProductProperty[]>([]);
	const [colorOptions, setColorOptions] = useState<ProductProperty[]>([]);
	const [fabricOptions, setFabricOptions] = useState<ProductProperty[]>([]);
	const [sleeveOptions, setSleeveOptions] = useState<ProductProperty[]>([]);
	const [genderOptions, setGenderOptions] = useState<ProductProperty[]>([]);
	const [sizeVariantOptions, setSizeVariantOptions] = useState<ProductProperty[]>([]);
	const [sourceOptions, setSourceOptions] = useState<ProductProperty[]>([]);

	const fetchProductProperties = async () => {
		try {

			const f = await getProductProperties("all");
			setCategoryOptions(f.properties.categories);
			setFitOptions(f.properties.fits);
			setVariantOptions(f.properties.variants)
			setColorOptions(f.properties.colors)
			setFabricOptions(f.properties.fabrics)
			setSleeveOptions(f.properties.sleeves)
			setGenderOptions(f.properties.genders)
			setSizeVariantOptions(f.properties.size_variants)
			setSourceOptions(f.properties.sources)
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const saveProduct = async () => {
		try {
			setIsLoading(true);
			await postProductForm(productData);
			enqueueSnackbar("Product Added Successfully", { variant: 'success' });
			onSuccess();
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		} finally {
			setIsLoading(false);
		}
	}

	const saveProductProperty = async () => {
		try {
			setIsLoading(true);
			const newP = await postProductProperty(openKey, openValue);
			enqueueSnackbar(`Product ${openLabel}: ${openValue.name} added`, { variant: 'success' });
			setOpen(false);
			switch (openKey) {
				case "category":
					setCategoryOptions((prevCatOp) => [
						...prevCatOp,
						newP.property // Append the new property value
					]);
					break;

				case "fit":
					setFitOptions((prevFitOp) => [
						...prevFitOp,
						newP.property
					]);
					break;

				case "variant":
					setVariantOptions((prevVariantOp) => [
						...prevVariantOp,
						newP.property
					]);
					break;

				case "color":
					setColorOptions((prevColorOp) => [
						...prevColorOp,
						newP.property
					]);
					break;

				case "fabric":
					setFabricOptions((prevFabricOp) => [
						...prevFabricOp,
						newP.property
					]);
					break;

				case "sleeve":
					setSleeveOptions((prevSleeveOp) => [
						...prevSleeveOp,
						newP.property
					]);
					break;

				case "gender":
					setGenderOptions((prevGenderOp) => [
						...prevGenderOp,
						newP.property
					]);
					break;

				case "size_variant":
					setSizeVariantOptions((prevSizeVariantOp) => [
						...prevSizeVariantOp,
						newP.property
					]);
					break;

				case "source":
					setSourceOptions((prevSourceOp) => [
						...prevSourceOp,
						newP.property
					]);
					break;

				default:
					console.log("Unknown property key:", openKey);
					break;
			}
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		} finally {
			setIsLoading(false);

		}
	}

	const handleTextFieldInput = (key: string, value: string | number) => {
		setProductData((prevProductData) => ({
			...prevProductData,
			[key]: value,
		}));
	};


	// Fetch dropdown data from APIs
	useEffect(() => {
		fetchProductProperties();
	}, []);

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Process the product data (e.g., call an API to create the product)
		saveProduct();
	};



	return (
		<div>
			<form onSubmit={handleSubmit}>
				<Box sx={{ mt: 2 }}>
					<Grid container spacing={2}>
						<Grid size={5}>
							<TextField id="sku" label="SKU" variant="outlined" fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									handleTextFieldInput("sku", event.target.value)
								}}
							/>
						</Grid>
						<Grid size={5}>
							<TextField id="name" label="Name" variant="outlined" fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									handleTextFieldInput("name", event.target.value)

								}}
							/>
						</Grid>
						<Grid size={2}>
							<FormGroup>
								<FormControlLabel control={<Checkbox defaultChecked />} label="Active" />
							</FormGroup>
						</Grid>
						<Grid size={4}>
							<FormControl fullWidth size="small">
								<InputLabel htmlFor="mrp">MRP</InputLabel>
								<OutlinedInput
									id="mrp"
									startAdornment={<InputAdornment position="start">₹</InputAdornment>}
									label="MRP"
									type='number'
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										handleTextFieldInput("mrp", Number(event.target.value))

									}}
								/>
							</FormControl>
						</Grid>
						<Grid size={4}>
							<FormControl fullWidth size="small">
								<InputLabel htmlFor="cost_price">Cost Price</InputLabel>
								<OutlinedInput
									id="cost_price"
									startAdornment={<InputAdornment position="start">₹</InputAdornment>}
									label="Cost Price"
									type='number'
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										handleTextFieldInput("cost_price", Number(event.target.value))

									}}
								/>
							</FormControl>
						</Grid>
						<Grid size={4}>
							<FormControl fullWidth size="small">
								<InputLabel htmlFor="sell_price">Sell Price</InputLabel>
								<OutlinedInput
									id="sell_price"
									startAdornment={<InputAdornment position="start">₹</InputAdornment>}
									label="Sell Price"
									type='number'
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										handleTextFieldInput("sell_price", Number(event.target.value))

									}}
								/>
							</FormControl>
						</Grid>
						<Grid size={4}>
							<TextField
								id="category"
								select
								label="Category"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = categoryOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("category_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Category")
												setOpenLabel("Category")
												setOpenKey("category")
											}}
										>
											Add Category
										</Button>
									</Box>
								}
							>
								{categoryOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="fit"
								select
								label="Fit"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = fitOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("fit_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Fit")
												setOpenLabel("Fit")
												setOpenKey("fit")
											}}
										>
											Add Fit
										</Button>
									</Box>
								}
							>
								{fitOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="variant"
								select
								label="Variant"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = variantOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("variant_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Variant")
												setOpenLabel("Variant")
												setOpenKey("variant")
											}}
										>
											Add Variant
										</Button>
									</Box>
								}
							>
								{variantOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="color"
								select
								label="Color"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = colorOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("color_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Color")
												setOpenLabel("Color")
												setOpenKey("color")
											}}
										>
											Add Color
										</Button>
									</Box>
								}
							>
								{colorOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="fabric"
								select
								label="Fabric"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = fabricOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("fabric_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Fabric")
												setOpenLabel("Fabric")
												setOpenKey("fabric")
											}}
										>
											Add Fabric
										</Button>
									</Box>
								}
							>
								{fabricOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="sleeve"
								select
								label="Sleeve"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sleeveOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("sleeve_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Sleeve")
												setOpenLabel("Sleeve")
												setOpenKey("sleeve")
											}}
										>
											Add Sleeve
										</Button>
									</Box>
								}
							>
								{sleeveOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="gender"
								select
								label="Gender"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = genderOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("gender_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Gender")
												setOpenLabel("Gender")
												setOpenKey("gender")
											}}
										>
											Add Gender
										</Button>
									</Box>
								}
							>
								{genderOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="size_variant"
								select
								label="Size Variant"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sizeVariantOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("size_variant_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Size Variant")
												setOpenLabel("Size Variant")
												setOpenKey("size_ariant")
											}}
										>
											Add Size Variant
										</Button>
									</Box>
								}
							>
								{sizeVariantOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={4}>
							<TextField
								id="source"
								select
								label="Source"
								fullWidth size="small"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sourceOptions.find(option => option.name === event.target.value);
									handleTextFieldInput("source_id", selectedOption?.ID ?? 0)

								}}
								helperText={
									<Box display="flex" justifyContent="end">
										<Button size='small' variant="text" color="primary"
											onClick={() => {
												setOpen(true);
												setOpenTitle("Add Source")
												setOpenLabel("Source")
												setOpenKey("source")
											}}
										>
											Add Source
										</Button>
									</Box>
								}
							>
								{sourceOptions.map((option) => (
									<MenuItem key={option.name} value={option.name}>
										{option.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
					</Grid>
					<Box display="flex" justifyContent="end">
						<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onSuccess}>Cancel</Button>
						<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" onClick={handleSubmit}>Save</Button>
					</Box>
				</Box>
			</form >
			<Dialog
				open={open}
				onClose={handleClose}
			>
				<DialogTitle>{openTitle}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						required
						margin="dense"
						id="name"
						name="category"
						label={openLabel}
						type="text"
						fullWidth
						variant="outlined"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							let p: ProductProperty = new ProductProperty(0, event.target.value)
							setOpenValue(p)
						}}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={saveProductProperty}>Add</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ProductForm;

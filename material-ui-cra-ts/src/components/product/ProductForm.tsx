import React, { useState, useEffect, useRef } from 'react';
import { TextField, Switch, FormControl, InputLabel, MenuItem, Button, Grid2 as Grid, Paper, styled, Box, Card, OutlinedInput, InputAdornment, Checkbox, FormGroup, FormControlLabel, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText, CircularProgress } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Product, { ProductFormDataRequest, ProductAttributeProperty } from '../../model/product';
import { getProductAttributes, postProductForm, postProductProperty } from '../../api/product_service';
import { enqueueSnackbar } from 'notistack';
import ImageUploadPreview from '../ImageUploadPreview';
// Define types for your dropdown options and product data


const ProductForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
	const [open, setOpen] = React.useState(false);
	const [openTitle, setOpenTitle] = React.useState("");
	const [openLabel, setOpenLabel] = React.useState("");
	const [openKey, setOpenKey] = React.useState("");
	const [openValue, setOpenValue] = React.useState<ProductAttributeProperty>({ ID: 0, name: "", isChecked: false });

	const handleClose = () => {
		setOpen(false);
	};

	const [isLoading, setIsLoading] = useState(false);

	const [sku, setSKU] = useState("");
	const [name, setName] = useState("");
	const [desc, setDesc] = useState("");
	const [costPrice, setCostPrice] = useState(0);
	const [sellPrice, setSellPrice] = useState(0);
	const [mrp, setMRP] = useState(0);

	const [categoryOptions, setCategoryOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<ProductAttributeProperty | null>(null);

	const [fitOptions, setFitOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedFit, setSelectedFit] = useState<ProductAttributeProperty | null>(null);

	const [variantOptions, setVariantOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedVariant, setSelectedVariant] = useState<ProductAttributeProperty | null>(null);

	const [colorOptions, setColorOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedColor, setSelectedColor] = useState<ProductAttributeProperty | null>(null);

	const [fabricOptions, setFabricOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedFabric, setSelectedFabric] = useState<ProductAttributeProperty | null>(null);

	const [sleeveOptions, setSleeveOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedSleeve, setSelectedSleeve] = useState<ProductAttributeProperty | null>(null);

	const [genderOptions, setGenderOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedGender, setSelectedGender] = useState<ProductAttributeProperty | null>(null);

	const [sourceOptions, setSourceOptions] = useState<ProductAttributeProperty[]>([]);
	const [selectedSource, setSelectedSource] = useState<ProductAttributeProperty | null>(null);

	const [sizeVariantOptions, setSizeVariantOptions] = useState<string[]>([]);
	const [selectedSizeVariant, setSelectedSizeVariant] = useState<string>("");

	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imageUploading, isImageUploading] = useState(false);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [uploadedImageFileID, setUploadedImageFileID] = useState<string>("");
	const inputRef = useRef<HTMLInputElement | null>(null); // Ref to the file input

	const fetchProductProperties = async () => {
		try {

			const f = await getProductAttributes("all");


			setCategoryOptions(f.properties.categories);
			setFitOptions(f.properties.fits);
			setVariantOptions(f.properties.variants);
			setColorOptions(f.properties.colors);
			setFabricOptions(f.properties.fabrics);
			setSleeveOptions(f.properties.sleeves);
			setGenderOptions(f.properties.genders);
			setSizeVariantOptions(f.lists.size_variants);
			setSourceOptions(f.properties.sources);


			setSelectedCategory(f.properties.categories.length > 0 ? f.properties.categories[0] : null);
			setSelectedFit(f.properties.fits.length > 0 ? f.properties.fits[0] : null);
			setSelectedVariant(f.properties.variants.length > 0 ? f.properties.variants[0] : null);
			setSelectedColor(f.properties.colors.length > 0 ? f.properties.colors[0] : null);
			setSelectedFabric(f.properties.fabrics.length > 0 ? f.properties.fabrics[0] : null);
			setSelectedSleeve(f.properties.sleeves.length > 0 ? f.properties.sleeves[0] : null);
			setSelectedGender(f.properties.genders.length > 0 ? f.properties.genders[0] : null);
			setSelectedSizeVariant(f.lists.size_variants.length > 0 ? f.lists.size_variants[0] : "");
			setSelectedSource(f.properties.sources.length > 0 ? f.properties.sources[0] : null);


		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const saveProduct = async () => {
		try {
			setIsLoading(true);
			const productData: ProductFormDataRequest = {
				id: 0,
				sku: sku,
				name: name,
				status: false,
				description: desc,
				mrp: mrp,
				cost_price: costPrice,
				sell_price: sellPrice,
				category_id: selectedCategory?.ID ?? 0,
				fit_id: selectedFit?.ID ?? 0,
				variant_id: selectedVariant?.ID ?? 0,
				color_id: selectedColor?.ID ?? 0,
				fabric_id: selectedFabric?.ID ?? 0,
				sleeve_id: selectedSleeve?.ID ?? 0,
				gender_id: selectedGender?.ID ?? 0,
				source_id: selectedSource?.ID ?? 0,
				size_variant: selectedSizeVariant,
				image_file_id: uploadedImageFileID,
			};
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

				// case "size_variant":
				// 	setSizeVariantOptions((prevSizeVariantOp) => [
				// 		...prevSizeVariantOp,
				// 		newP.property
				// 	]);
				// 	break;

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

	const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		isImageUploading(true);
		const files = e.target.files;
		if (files && files.length > 0) {
			const selectedFilesArray = Array.from(files);
			setSelectedImage(selectedFilesArray[0]);

			const previews = URL.createObjectURL(selectedFilesArray[0])
			setImagePreview(previews);

			const formData = new FormData();
			formData.append('file', selectedFilesArray[0]);

			try {
				// Upload image
				const response = await fetch('http://localhost:8081/submit', {
					method: 'POST',
					body: formData,
				});

				if (response.ok) {
					const result = await response.json();
					console.log('File uploaded successfully:', result);

					// Retrieve the file ID from the response (fid)
					const fileId = result.fid;
					console.log('File ID:', fileId);
					setUploadedImageFileID(fileId);

					enqueueSnackbar("Image upload success", { variant: 'success' });

					// Do something with the fileId (e.g., store it or pass it along in another request)
				} else {
					enqueueSnackbar("Image upload failed", { variant: 'error' }); // Show error notification
					console.error('Image upload failed');
					handleRemove();
				}
			} catch (error: any) {
				enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
				console.error('Error uploading image:', error);
				handleRemove();
			}
		}


		isImageUploading(false);
	};



	const handleRemove = () => {
		setSelectedImage(null);
		setImagePreview("");

		if (inputRef.current) {
			inputRef.current.value = ""; // Clear the file input value
		}
	};


	return (
		<div>
			<form onSubmit={handleSubmit}>
				<Box sx={{ mt: 2 }}>
					<Grid container spacing={2}>
						<Grid size={9}>
							<OutlinedInput
								fullWidth
								type="file"
								size="small"
								inputProps={{ accept: 'image/*', multiple: false }}
								onChange={handleImageSelect}
								inputRef={inputRef}
							/>
						</Grid>
						{imagePreview !== "" && <Grid size={3}>
							<Button variant="outlined" fullWidth color="secondary" onClick={handleRemove}>
								Remove
							</Button>
						</Grid>}
						{imagePreview !== "" && <Grid size={12}>
							<Box
								mb={2}
								sx={{ p: 2, border: '1px dashed grey' }}
							>
								{/* Image Element */}
								<img
									src={imagePreview}
									alt="preview"
									height="200"
									onError={(e) => {
										e.currentTarget.style.display = 'none'; // Hide the image if there's an error loading the URL
									}}
									style={{
										filter: imageUploading ? 'grayscale(100%)' : 'none', // Apply grayscale filter when loading
										opacity: imageUploading ? 0.5 : 1, // Reduce opacity when loading
										transition: 'opacity 0.3s ease', // Smooth transition when loading completes
									}}
								// onLoad={handleImageLoad} // Call this when the image has fully loaded
								/>

								{/* Loader Overlay */}
								{imageUploading && (
									<CircularProgress
										sx={{

											top: '50%',             // Center the loader vertically
											left: '50%',            // Center the loader horizontally
											transform: 'translate(-50%, -50%)', // Proper centering
										}}
									/>
								)}
							</Box>
						</Grid>}
						<Grid size={5}>
							<TextField id="sku" label="SKU" variant="outlined" fullWidth size="small"
								value={sku}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setSKU(event.target.value)
								}}

							/>
						</Grid>
						<Grid size={5}>
							<TextField id="name" label="Name" variant="outlined" fullWidth size="small"
								value={name}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setName(event.target.value)
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
									value={mrp}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setMRP(Number(event.target.value))
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
									value={costPrice}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setCostPrice(Number(event.target.value))
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
									value={sellPrice}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setSellPrice(Number(event.target.value))
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
								value={selectedCategory?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = categoryOptions.find(option => option.name === event.target.value) || null;
									setSelectedCategory(selectedOption);
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
								value={selectedFit?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = fitOptions.find(option => option.name === event.target.value) || null;
									setSelectedFit(selectedOption);
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
								value={selectedVariant?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = variantOptions.find(option => option.name === event.target.value) || null;
									setSelectedVariant(selectedOption)

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
								value={selectedColor?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = colorOptions.find(option => option.name === event.target.value) || null;
									setSelectedColor(selectedOption)
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
								value={selectedFabric?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = fabricOptions.find(option => option.name === event.target.value) || null;
									setSelectedFabric(selectedOption)
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
								value={selectedSleeve?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sleeveOptions.find(option => option.name === event.target.value) || null;
									setSelectedSleeve(selectedOption)
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
								value={selectedGender?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = genderOptions.find(option => option.name === event.target.value) || null;
									setSelectedGender(selectedOption)
								}}

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
								value={selectedSizeVariant}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sizeVariantOptions.find(option => option === event.target.value) || "";
									setSelectedSizeVariant(selectedOption)
								}}

							>
								{sizeVariantOptions.map((option) => (
									<MenuItem key={option} value={option}>
										{option}
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
								value={selectedSource?.name ?? ""}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									const selectedOption = sourceOptions.find(option => option.name === event.target.value) || null;
									setSelectedSource(selectedOption)
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
						<Grid size={12}>
							<TextField
								id="desc"
								minRows={4}
								maxRows={6}
								multiline
								label="Description"
								fullWidth size="small"

								value={desc}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setDesc(event.target.value)
								}}


							>

							</TextField>
						</Grid>
					</Grid>
					<Box display="flex" justifyContent="end">
						<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onSuccess}>Cancel</Button>
						{<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" disabled={imageUploading} onClick={handleSubmit}>Save</Button>}
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
							let p: ProductAttributeProperty = new ProductAttributeProperty(0, event.target.value)
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

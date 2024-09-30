import { Dialog, DialogTitle, DialogContent, Box, Button, Grid2 as Grid, TextField, Typography, Autocomplete, debounce } from "@mui/material";
import React, { useEffect, useState } from "react"
import Product, { SpecificSizeVariant } from "../../model/product";
import GRNProductForm from "../grn/GRNProductForm";
import OrderProductForm from "./OrderProductForm";
import User from "../../model/user";
import { getUsers, postPlaceAdminOrder } from "../../api/order_service";
import { enqueueSnackbar } from "notistack";
import { PlaceOrderAdminRequest } from "../../model/order";

const OrderForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
	const [openAddProductForm, setAddProductForm] = React.useState(false);

	const [products, setProducts] = useState<Product[]>([]);
	const [prices, setPrices] = useState<number[]>([]);
	const [sizeVariants, setSizeVariants] = useState<SpecificSizeVariant[][]>([]);

	const [availableUsers, setAvailableUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [searchField, setSearchField] = useState("");
	const [loading, setLoading] = React.useState(false);

	const [grandTotal, setGrandTotal] = useState(0);

	const addProductWithVariants = async (product: Product, sizeVaraints: SpecificSizeVariant[], price: number) => {
		setProducts((prevProducts) => [...prevProducts, product]);
		setSizeVariants((prevProducts) => [...prevProducts, sizeVaraints]);
		setPrices((prevProducts) => [...prevProducts, price]);
		console.log("added product i guess ", product.sku, sizeVaraints)
	}

	const deleteProductWithVariants = async (index: number) => {
		setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
		setSizeVariants((prevVariants) => prevVariants.filter((_, i) => i !== index));
		setPrices((prevVariants) => prevVariants.filter((_, i) => i !== index));

		console.log("Deleted product and size variants at index", index);
	};

	const loadAvailableUsers = async (name: string) => {
		setLoading(true);
		try {
			const u = await getUsers(name); // Pass search term to API
			setAvailableUsers(u.users);
		} catch (error: any) {
			enqueueSnackbar("Error loading users", { variant: 'error' });
		}
		setLoading(false);
	};

	const debouncedSearch = debounce((searchTerm: string) => {
		loadAvailableUsers(searchTerm);
	}, 900); // Adjust the delay as needed (300ms is common)

	const handleInputChange = (event: React.ChangeEvent<{}>, value: string) => {
		setSearchField(value);
		debouncedSearch(value); // Trigger debounced search
	};

	const postOrder = async () => {
		try {
			const req: PlaceOrderAdminRequest = {
				products: products.map((p, pi) => {
					return {
						product_id: p.ID,
						size_variants: sizeVariants[pi].filter(obj => obj.quantity > 0),
						price: prices[pi],
					}
				}),
				created_for_id: selectedUser?.ID ?? 0,
				total_price: grandTotal
			}
			const u = await postPlaceAdminOrder(req); // Pass search term to API
			enqueueSnackbar("Order Success", { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error, { variant: 'error' });
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		postOrder();
	};

	useEffect(() => {
		setGrandTotal(prices.reduce((sum, item) => sum + item, 0))
	}, [prices])

	useEffect(() => {
		loadAvailableUsers("");
	}, []);

	return (<div>
		<form onSubmit={() => { }}>
			<Box sx={{ mt: 2 }}>
				<Grid container spacing={2}>
					<Grid size={9}>
						<Autocomplete
							id="user-select"
							sx={{ minWidth: 250 }}
							options={availableUsers}
							autoHighlight
							loading={loading}
							getOptionLabel={(option) => (option.Username + " (" + option.Email + ")")}
							onInputChange={handleInputChange} // Trigger on input change
							value={selectedUser}
							onChange={(event, newValue) => setSelectedUser(newValue)}
							renderOption={(props, option) => (
								<Box
									component="li"
									sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
									{...props}
								>
									{option.Username} ({option.Email})
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Order on behalf of"
									autoComplete="new-password" // disable autocomplete and autofill
								/>
							)}
						/>
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
								<Grid size={3}>
									<Typography variant="h6" component="span" color="primary">
										₹{prices[pi]}
									</Typography>
								</Grid>
							</Grid>
							<Box display="flex" justifyContent="end">
								{/* <Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { setAddProductForm(true) }}>Edit</Button> */}
								<Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { deleteProductWithVariants(pi) }}>Delete</Button>
							</Box>
						</Box>
					})
					}
					<Typography variant="h6" component="span" color="primary">
						Total: ₹{grandTotal}
					</Typography>

				</Grid>
				<Box display="flex" justifyContent="end">
					<Button sx={{ mt: 4, ml: 2 }} variant="contained" onClick={() => { setAddProductForm(true) }}>Add Product</Button>
				</Box>
				<Box display="flex" justifyContent="end">
					<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onSuccess}>Cancel</Button>
					<Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" onClick={handleSubmit}>Place Order</Button>
				</Box>

			</Box>
		</form>
		<Dialog open={openAddProductForm} onClose={() => { setAddProductForm(false) }}>
			<DialogTitle>Add Product</DialogTitle>
			<DialogContent>
				<OrderProductForm
					onSuccess={(product: Product, sizeVaraints: SpecificSizeVariant[], price: number) => {
						setAddProductForm(false);
						addProductWithVariants(product, sizeVaraints, price);
					}}
					onClose={() => setAddProductForm(false)}
				/>
			</DialogContent>
		</Dialog>
	</div>)


}

export default OrderForm
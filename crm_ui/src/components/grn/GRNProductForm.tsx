import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid2 as Grid, Box, Autocomplete } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AddGRNWarehouseRequest } from '../../model/grns';
import { postWarehouseData } from '../../api/grns_service';
import Product, { LikeFilter, ProductFilter, SizeVariant, SpecificSizeVariant } from '../../model/product';
import { getAllFilteredProducts, getSizeVariants } from '../../api/product_service';
import debounce from 'lodash.debounce';

// Define types for your dropdown options and product data

interface GRNProductFormProps {
    onSuccess: (product: Product, sizeVaraints: SpecificSizeVariant[]) => void; // This prop should expect a Product as a parameter
    onClose: () => void;
}

const GRNProductForm: React.FC<GRNProductFormProps> = ({ onSuccess, onClose }) => {
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = React.useState(false);

    const [sizeVariants, setSizeVariants] = useState<SpecificSizeVariant[]>([]);
    const [searchField, setSearchField] = useState("");

    // Function to load products based on the search term
    const loadAvailableProducts = async (name: string) => {
        setLoading(true);
        try {
            const filter: LikeFilter = new LikeFilter("name", "like", false, name)
            const p = await getAllFilteredProducts([filter], 1, 50); // Pass search term to API
            setAvailableProducts(p.products);
        } catch (error: any) {
            enqueueSnackbar("Error loading products", { variant: 'error' });
        }
        setLoading(false);
    };

    const loadSizeVariants = async (variant: string) => {
        try {
            const sv = await getSizeVariants(variant); // Pass search term to API
            const specificSizeVariants: SpecificSizeVariant[] = [];
            sv.size_variants.forEach(s => {
                specificSizeVariants.push(new SpecificSizeVariant(s.id, s.variant, s.name, s.created_by, 0))
            });
            setSizeVariants(specificSizeVariants);
        } catch (error: any) {
            enqueueSnackbar("Error loading products", { variant: 'error' });
        }
    }

    const handleSizeVariantQuantityChange = async (index: number, new_quantity: number) => {
        const updatedSizeVariants = [...sizeVariants];
        console.log(sizeVariants[index])
        sizeVariants[index].quantity = new_quantity;


        setSizeVariants(updatedSizeVariants);
    }

    // Debounce the search input to avoid making too many API calls
    const debouncedSearch = debounce((searchTerm: string) => {
        loadAvailableProducts(searchTerm);
    }, 900); // Adjust the delay as needed (300ms is common)

    const handleInputChange = (event: React.ChangeEvent<{}>, value: string) => {
        setSearchField(value);
        debouncedSearch(value); // Trigger debounced search
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProduct != null) onSuccess(selectedProduct, sizeVariants)
    };


    useEffect(() => {
        loadAvailableProducts("");
    }, []);

    useEffect(() => {
        if (selectedProduct != null) {
            loadSizeVariants(selectedProduct.size_variant);
        }
    }, [selectedProduct]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={9}>
                            <Autocomplete
                                id="product-select"
                                sx={{ minWidth: 250 }}
                                options={availableProducts}
                                autoHighlight
                                loading={loading}
                                getOptionLabel={(option) => (option.sku + " (" + option.name + ")")}
                                onInputChange={handleInputChange} // Trigger on input change
                                value={selectedProduct}
                                onChange={(event, newValue) => setSelectedProduct(newValue)}
                                renderOption={(props, option) => (
                                    <Box
                                        component="li"
                                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                                        {...props}
                                    >
                                        {option.sku} ({option.name})
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search for a Product"
                                        autoComplete="new-password" // disable autocomplete and autofill
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={3}>
                            {selectedProduct && <TextField
                                id="size_variant"
                                label="Size Variant"
                                fullWidth
                                disabled
                                value={selectedProduct?.size_variant ?? ""}

                            >

                            </TextField>}

                        </Grid>
                        {/* <Grid size={12}>
                            {selectedProduct && <Box>Select Quantity</Box>}
                        </Grid> */}
                        {sizeVariants.map((sv, si) => {
                            return <Grid size={3}>
                                <TextField
                                    id="size_variant"
                                    label={sv.variant === "Free" ? "Quantity" : sv.name}
                                    type="number"
                                    defaultValue={0}
                                    fullWidth
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        handleSizeVariantQuantityChange(si, Number(event.target.value))
                                    }}
                                >

                                </TextField>

                            </Grid>
                        })}
                    </Grid>
                    <Box display="flex" justifyContent="end">
                        <Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" onClick={handleSubmit}>
                            Add Product
                        </Button>
                    </Box>
                </Box>
            </form>
        </div>
    );
};

export default GRNProductForm;

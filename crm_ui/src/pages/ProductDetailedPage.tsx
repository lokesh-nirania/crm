import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product, { ProductWithInventory, SizeVariant, SpecificSizeVariant } from "../model/product";
import { addToCart, getProductWithInventory } from "../api/product_service";
import { enqueueSnackbar } from "notistack";
import { CircularProgress, Box, Grid2 as Grid, Typography, TableContainer, Paper, Table, TableBody, TableRow, TableCell, Button, Card, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { CartItem, SetForCat } from "../model/order";
import Cart from "./Cart";
import { useAuth } from "../providers/AuthContext";



const ProductDetailedPage: React.FC = () => {
    const { index } = useParams();

    const { user } = useAuth();

    const [product, setProduct] = useState<ProductWithInventory | null>(null);
    const fetchProduct = async (id: number) => {
        try {
            const f = await getProductWithInventory(id);
            setProduct(f.product);
            enqueueSnackbar("Product Fetched with Inventory", { variant: 'success' }); // Show error notification
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
        }
    }

    useEffect(() => {
        if (index) {
            fetchProduct(Number(index))

        }
    }, [])
    if (product === null) return <></>
    return <><ProductInfoCard product={product} /></>
}

export default ProductDetailedPage;

const ProductInfoCard: React.FC<{ product: ProductWithInventory }> = ({ product }) => {
    const [imageSrc, setImageSrc] = useState(`http://localhost:7000/${product?.image_file_id}`);
    const [setCountForCart, setSetCountForCart] = useState<number[]>(Array(product.available_sets.length).fill(0))
    // const [maxCountForCart, setMaxCountForCart] = useState<number[]>(Array(product.available_sets.length).fill(9999))
    const [isCardEnable, setCartEnable] = useState(false);

    const { user } = useAuth();

    let q = 0;
    product.available_sizes.forEach(element => {
        if (element.quantity) {
            q += element.quantity;
        }
    });

    if (!product) {
        return <CircularProgress />;
    }

    const handleImageError = () => {
        setImageSrc('/assets/dummy-product-image.png');
    };

    const handleCountIncrease = (index: number) => {
        let min = 9999;
        for (let i = 0; i < 3; i++) {
            if (min > product.available_sizes[product.available_sets[index][i]].quantity) {
                min = product.available_sizes[product.available_sets[index][i]].quantity
            }
        }
        if (setCountForCart[index] < min) {
            const updatedCounts = [...setCountForCart];
            updatedCounts[index] += 1;
            setSetCountForCart(updatedCounts);
        }
    };

    const handleCountDecrease = (index: number) => {
        if (setCountForCart[index] > 0) {
            const updatedCounts = [...setCountForCart];
            updatedCounts[index] -= 1;
            setSetCountForCart(updatedCounts);
        }

    };

    useEffect(() => {
        let quantity = 0
        setCountForCart.forEach(element => {
            quantity += element
        });
        if (quantity > 0) {
            setCartEnable(true)
        } else {
            setCartEnable(false)
        }
    }, [setCountForCart])

    return (
        <Grid container spacing={2}>
            <Grid size={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
                    <img
                        src={imageSrc}
                        alt={product.name}
                        style={{ maxWidth: "600", minWidth: "200" }}
                        onError={handleImageError}
                    />
                </Box>
            </Grid>
            <Grid size={7}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }} >
                    <Grid>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>
                        <Card sx={{ maxWidth: 450 }}>
                            <TableContainer >
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Price</TableCell>
                                            <TableCell>
                                                <Typography variant="h6" component="span" color="primary">
                                                    ₹{product.sell_price}
                                                </Typography>
                                                {product.mrp > product.sell_price && (
                                                    <Typography
                                                        variant="body2"
                                                        component="span"
                                                        color="text.secondary"
                                                        sx={{ textDecoration: 'line-through', ml: 1 }}
                                                    >
                                                        ₹{product.mrp}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Category</TableCell>
                                            <TableCell>{product.category.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Fit</TableCell>
                                            <TableCell>{product.fit.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Color</TableCell>
                                            <TableCell>{product.color.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Fabric</TableCell>
                                            <TableCell>{product.fabric.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sleeve</TableCell>
                                            <TableCell>{product.sleeve.name}</TableCell>
                                        </TableRow>
                                        {user?.UserType !== "admin" && product.size_variant !== "Free" && <TableRow>
                                            <TableCell>Available Sizes</TableCell>
                                            <TableCell>
                                                {product.available_sizes.length > 0 ? (
                                                    product.available_sizes.reduce((acc: any[][], size, index) => {
                                                        const chunkIndex = Math.floor(index / 5);
                                                        if (!acc[chunkIndex]) {
                                                            acc[chunkIndex] = []; // start a new row
                                                        }
                                                        acc[chunkIndex].push(size);
                                                        return acc;
                                                    }, []).map((chunk, rowIndex) => (
                                                        <Box minWidth={200} key={rowIndex} sx={{ display: "flex", gap: 1, marginBottom: 1 }}>
                                                            {chunk.map((size) => (
                                                                <Button
                                                                    key={size.name}
                                                                    variant="outlined"
                                                                    disabled={size.quantity === 0}
                                                                    sx={{
                                                                        borderRadius: "50%",
                                                                        width: 40,
                                                                        height: 40,
                                                                        minWidth: 40,
                                                                    }}
                                                                >
                                                                    {size.name}
                                                                </Button>
                                                            ))}
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Box>No sizes available</Box>
                                                )}
                                            </TableCell>
                                        </TableRow>}
                                        {user?.UserType === "admin" && product.size_variant !== "Free" && <TableRow>
                                            <TableCell>Available Sizes</TableCell>
                                            <TableCell>
                                                {product.available_sizes.length > 0 ? (
                                                    product.available_sizes.reduce((acc: any[][], size, index) => {
                                                        const chunkIndex = Math.floor(index / 6);
                                                        if (!acc[chunkIndex]) {
                                                            acc[chunkIndex] = []; // start a new row
                                                        }
                                                        acc[chunkIndex].push(size);
                                                        return acc;
                                                    }, []).map((chunk, rowIndex) => (
                                                        <Box minWidth={200} key={rowIndex}  >
                                                            {chunk.map((size) => (
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-block',  // To make the box inline like a pill
                                                                        px: 1,  // Horizontal padding for pill-like appearance
                                                                        py: 1,  // Vertical padding for height
                                                                        borderRadius: 5,  // High border-radius for pill shape
                                                                        bgcolor: '#1976d2',  // A blue background (Material UI primary color)
                                                                        color: 'white',  // White text for good contrast
                                                                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',  // A subtle shadow for depth
                                                                        border: 'none',  // No border to keep it clean
                                                                        mb: 1,
                                                                        mr: 1
                                                                    }}
                                                                >
                                                                    <Button
                                                                        key={size.name}
                                                                        variant="outlined"
                                                                        sx={{
                                                                            mr: 1,
                                                                            borderRadius: "50%",
                                                                            width: 40,
                                                                            height: 40,
                                                                            minWidth: 40,
                                                                            borderColor: "#1976d2", // A nice blue border for contrast
                                                                            color: "#1976d2", // Matching text color
                                                                            bgcolor: "white", // Light background for contrast with border
                                                                            '&:hover': {
                                                                                bgcolor: '#e3f2fd',  // A light blue background on hover
                                                                            },
                                                                        }}
                                                                    >
                                                                        {size.name}
                                                                    </Button>
                                                                    <Button
                                                                        key={size.name}
                                                                        variant="outlined"
                                                                        sx={{
                                                                            mr: 1,
                                                                            borderRadius: "50%",
                                                                            width: 40,
                                                                            height: 40,
                                                                            minWidth: 40,
                                                                            borderColor: "#1976d2", // A nice blue border for contrast
                                                                            color: "#1976d2", // Matching text color
                                                                            bgcolor: "white", // Light background for contrast with border
                                                                            '&:hover': {
                                                                                bgcolor: '#e3f2fd',  // A light blue background on hover
                                                                            },
                                                                        }}
                                                                    >
                                                                        {size.quantity}
                                                                    </Button>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Box>No sizes available</Box>
                                                )}
                                            </TableCell>
                                        </TableRow>}
                                        <TableRow>
                                            <TableCell>Status</TableCell>
                                            <TableCell>
                                                {q > 0 && product.available_sets.length === 0 && <Box>In Stock (Set not available)</Box>}
                                                {q > 0 && product.available_sets.length > 0 && <Box>In Stock (Sets available)</Box>}
                                                {product.available_sets.length == 0 && <Box>Out of Stock</Box>}
                                            </TableCell>
                                        </TableRow>
                                        {q > 0 && product.available_sets.length > 0 &&
                                            <TableRow>
                                                <TableCell>Available sets</TableCell>
                                                <TableCell>
                                                    {product.available_sets.map((set, si) => {
                                                        return (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mr: 1 }}>
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-block',  // To make the box inline like a pill
                                                                        px: 1,  // Horizontal padding for pill-like appearance
                                                                        py: 1,  // Vertical padding for height
                                                                        borderRadius: 5,  // High border-radius for pill shape
                                                                        bgcolor: '#1976d2',  // A blue background (Material UI primary color)
                                                                        color: 'white',  // White text for good contrast
                                                                        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',  // A subtle shadow for depth
                                                                        border: 'none',  // No border to keep it clean
                                                                        mb: 1
                                                                    }}
                                                                >
                                                                    {set.map((index) => {
                                                                        return <Button
                                                                            key={product.available_sizes[index].id}
                                                                            variant="outlined"
                                                                            sx={{
                                                                                mr: 1,
                                                                                borderRadius: "50%",
                                                                                width: 40,
                                                                                height: 40,
                                                                                minWidth: 40,
                                                                                borderColor: "#1976d2", // A nice blue border for contrast
                                                                                color: "#1976d2", // Matching text color
                                                                                bgcolor: "white", // Light background for contrast with border
                                                                                '&:hover': {
                                                                                    bgcolor: '#e3f2fd',  // A light blue background on hover
                                                                                },
                                                                            }}
                                                                        >
                                                                            {product.available_sizes[index].name}
                                                                        </Button>
                                                                    })}
                                                                </Box>
                                                                {user?.UserType !== "admin" && <Box sx={{
                                                                    ml: 2,

                                                                    px: 1,  // Horizontal padding for pill-like appearance
                                                                    py: 1,  // Vertical padding for height
                                                                    borderRadius: 5,  // High border-radius for pill shape
                                                                    border: "1px dashed grey"
                                                                }}>
                                                                    <IconButton
                                                                        onClick={() => { handleCountDecrease(si) }}
                                                                        size="small"
                                                                        sx={{
                                                                            color: "#1976d2",
                                                                        }}
                                                                    >
                                                                        <Remove />
                                                                    </IconButton>
                                                                    {setCountForCart[si]}
                                                                    <IconButton
                                                                        onClick={() => { handleCountIncrease(si) }}
                                                                        size="small"
                                                                        sx={{
                                                                            color: "#1976d2",
                                                                        }}
                                                                    >
                                                                        <Add />
                                                                    </IconButton>
                                                                </Box>}
                                                            </Box>
                                                        )
                                                    })}
                                                    {user?.UserType !== "admin" && <Button
                                                        variant="outlined"
                                                        disabled={!isCardEnable}
                                                        sx={{
                                                            mr: 1,

                                                            borderColor: "#1976d2", // A nice blue border for contrast
                                                            color: "#1976d2", // Matching text color
                                                            bgcolor: "white", // Light background for contrast with border
                                                            '&:hover': {
                                                                bgcolor: '#e3f2fd',  // A light blue background on hover
                                                            },
                                                        }}
                                                        onClick={() => {
                                                            let cartItem = new CartItem();
                                                            cartItem.product_id = product.ID;

                                                            setCountForCart.forEach((element, si) => {
                                                                if (element > 0) {
                                                                    const sv1 = product.available_sizes[product.available_sets[si][0]]
                                                                    const sv2 = product.available_sizes[product.available_sets[si][1]]
                                                                    const sv3 = product.available_sizes[product.available_sets[si][2]]

                                                                    const s = new SetForCat(sv1, sv2, sv3, element)

                                                                    cartItem.sets.push(s);

                                                                }
                                                            });

                                                            const added = addToCart(cartItem);
                                                            if (added) {
                                                                enqueueSnackbar("Added to cart", { variant: 'success' }); // Show error notification
                                                            } else {
                                                                enqueueSnackbar("Failed to add to cart", { variant: 'error' }); // Show error notification

                                                            }

                                                        }}
                                                    >
                                                        Add to Cart
                                                    </Button>}
                                                </TableCell>
                                            </TableRow>
                                        }


                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    )


};
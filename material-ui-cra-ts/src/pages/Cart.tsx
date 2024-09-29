import React, { useEffect, useState } from 'react';
import { isLoggedIn } from '../api/auth_service';
import product, { ProductWithInventory } from '../model/product';
import { addToCart, getCart, getProductWithInventory } from '../api/product_service';
import { enqueueSnackbar } from 'notistack';
import ProductInfoCard from '../components/product/ProductCard';
import { Box, Button, Card, CardContent, CardMedia, Grid2 as Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
import { Remove, Add } from '@mui/icons-material';
import { CartItem, PlaceOrderRequest, SetForCat } from '../model/order';
import { postPlaceOrder } from '../api/order_service';
import { useNavigate } from 'react-router-dom';

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<ProductWithInventory[]>([]);
    const [cartPrices, setCartPrices] = useState<number[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const navigate = useNavigate();

    const checkLoginStatus = async () => {
        await isLoggedIn();
    }

    const fetchCartProductInfo = async () => {
        try {
            const products: ProductWithInventory[] = await Promise.all(
                cartItems.map(async (cartItem) => {
                    const f = await getProductWithInventory(cartItem.product_id);
                    return f.product; // Return the product from the async function
                })
            );

            // Set products once all the promises are resolved
            setProducts(products);

            const prices: number[] = [];
            let totalPrice = 0;
            cartItems.forEach((element, ci) => {
                const p: number = element.sets.reduce((sum, item) => sum + item.quantity, 0) * 3 * products[ci].sell_price
                prices.push(p);
                totalPrice += p
            });

            setCartPrices(prices);
            setTotalPrice(totalPrice)
            console.log("Total items in cart:", products.length);
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification in case of any error
        }
    };

    const placeOrder = async () => {
        try {
            let placeOrderReq: PlaceOrderRequest = {
                order: [],
                total_price: totalPrice
            }

            cartItems.forEach((cartItem, ci) => {
                let newCartItem = new CartItem();

                newCartItem.product_id = cartItem.product_id;
                cartItem.sets.forEach((set, si) => {
                    let newSet = new SetForCat(set.size1, set.size2, set.size3, set.quantity)
                    newSet.price = 3 * products[ci].sell_price * set.quantity

                    newCartItem.sets.push(newSet);
                });

                placeOrderReq.order.push(newCartItem)
            });
            const f = await postPlaceOrder(placeOrderReq);
            enqueueSnackbar("Order Place Successfully", { variant: 'success' }); // Show error notification in case of any error
            navigate("/orders")

            localStorage.removeItem('cart'); setCartItems([])
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification in case of any error
        }
    }



    useEffect(() => {
        checkLoginStatus(); // Call the function inside useEffect
        setCartItems(getCart());
    }, []);

    useEffect(() => {
        fetchCartProductInfo();
    }, [cartItems])


    return <Box sx={{ m: 2 }}>
        <Box sx={{ mt: 2 }}>
            Total Price: <Typography variant="h6" component="span" color="primary">
                ₹{totalPrice}
            </Typography>
        </Box>
        <Button sx={{ mt: 2 }} variant="contained" color="error" onClick={() => { localStorage.removeItem('cart'); setCartItems([]) }}>
            Clear Cart
        </Button>
        <Button sx={{ mt: 2, ml: 2 }} variant="contained" color="success" onClick={placeOrder}>
            Place Order
        </Button>
        {cartItems.length > 0 && products.map((p, pi) => {
            return <Box>
                <ProductCartSummaryCard product={p} cart={cartItems[pi]} />

            </Box>
        })}


    </Box>;
};

export default CartPage;

const ProductCartSummaryCard: React.FC<{ product: ProductWithInventory, cart: CartItem }> = ({ product, cart }) => {
    const [imageSrc, setImageSrc] = useState(`http://localhost:7000/${product.image_file_id}`);
    const handleImageError = () => {
        setImageSrc('/assets/dummy-product-image.png');
    };

    return (
        <Box>
            <Card sx={{ maxWidth: 450, minWidth: 200 }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={imageSrc}
                    alt={product.name}
                    onError={handleImageError}
                />
                <CardContent>
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
                                        <TableRow>
                                            <TableCell>Sets</TableCell>
                                            <TableCell>{cart && cart.sets.map((s) => {
                                                return <div>
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
                                                        <Button
                                                            key={s.size1.id}
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
                                                            {s.size1.name}
                                                        </Button>
                                                        <Button
                                                            key={s.size2.id}
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
                                                            {s.size2.name}
                                                        </Button>
                                                        <Button
                                                            key={s.size3.id}
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
                                                            {s.size3.name}
                                                        </Button>

                                                    </Box>
                                                    <Button
                                                        key={12}
                                                        variant="outlined"
                                                        sx={{
                                                            ml: 4,
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
                                                        {s.quantity}
                                                    </Button>
                                                </div>

                                            })}

                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Price</TableCell>
                                            <TableCell>
                                                <Typography variant="h6" component="span" color="primary">
                                                    ₹{cart.sets.reduce((sum, item) => sum + item.quantity, 0) * 3 * product.sell_price}
                                                </Typography>

                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grid>
                </CardContent>
            </Card>

        </Box>
    )
}

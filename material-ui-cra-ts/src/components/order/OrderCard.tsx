import React from 'react';
import { Card, CardContent, Typography, Grid2 as Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Order from '../../model/order';

const OrderCard: React.FC<{ order: Order | null }> = ({ order }) => {
    if (order === null) return (<></>)
    return (
        <Card variant="outlined" sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Order #{order.ID} - Status: {order.Status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Created at: {new Date(order.CreatedAt).toLocaleString()}
                </Typography>

                {/* User Information */}
                <Grid container spacing={2} marginTop={2}>
                    <Grid size={6}>
                        <Typography variant="subtitle1">Created By</Typography>
                        <Typography variant="body1">{order.created_by.Username}</Typography>
                        <Typography variant="body2">{order.created_by.Email}</Typography>
                        <Typography variant="body2">User Type: {order.created_by.UserType}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle1">Created For</Typography>
                        <Typography variant="body1">{order.created_for.Username}</Typography>
                        <Typography variant="body2">{order.created_for.Email}</Typography>
                        <Typography variant="body2">User Type: {order.created_for.UserType}</Typography>
                    </Grid>
                </Grid>

                {/* Product Table */}
                <Typography variant="h6" marginTop={2}>
                    Products
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Size Variants</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {order.OrderProducts.map((product) => (
                            <TableRow key={product.ID}>
                                <TableCell>{product.Product.sku} ({(product.Product.name)})</TableCell>
                                <TableCell>{product.Quantity}</TableCell>
                                <TableCell>₹{product.Price}</TableCell>

                                <TableCell>
                                    {product.size_variant_1.name} ,
                                    {product.size_variant_2?.name} ,
                                    {product.size_variant_3?.name}
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Total Price */}
                <Typography variant="h6" marginTop={2}>
                    Total Price: ₹{order.Price}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default OrderCard;

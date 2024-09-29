import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, CardMedia } from '@mui/material';
import Product from '../../model/product';


const ProductInfoCard: React.FC<{ product: Product | null }> = ({ product }) => {
    const [imageUri, setImageUri] = useState("");

    useEffect(() => {
        if (product !== null)
            setImageUri("http://localhost:7000/" + product.image_file_id)
    }, [])

    if (product === null) return (<></>)
    return (
        <Card sx={{ maxWidth: 600, margin: 'auto', boxShadow: 3 }}>
            {/* Conditionally render the image */}
            {imageUri && (
                <CardMedia
                    component="img"
                    image={imageUri}
                    alt={"preview"}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'; // Hide image if loading fails
                    }}
                />
            )}

            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    {product.name}
                </Typography>

                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell><strong>SKU:</strong></TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell><strong>Status:</strong></TableCell>
                            <TableCell>{product.status ? "Active" : "Inactive"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>MRP:</strong></TableCell>
                            <TableCell>{product.mrp}</TableCell>
                            <TableCell><strong>Cost Price:</strong></TableCell>
                            <TableCell>{product.cost_price}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Sell Price:</strong></TableCell>
                            <TableCell>{product.sell_price}</TableCell>
                            <TableCell><strong>Category:</strong></TableCell>
                            <TableCell>{product.category.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Fit:</strong></TableCell>
                            <TableCell>{product.fit.name}</TableCell>
                            <TableCell><strong>Variant:</strong></TableCell>
                            <TableCell>{product.variant.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Color:</strong></TableCell>
                            <TableCell>{product.color.name}</TableCell>
                            <TableCell><strong>Fabric:</strong></TableCell>
                            <TableCell>{product.fabric.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Sleeve:</strong></TableCell>
                            <TableCell>{product.sleeve.name}</TableCell>
                            <TableCell><strong>Gender:</strong></TableCell>
                            <TableCell>{product.gender.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Size Variant:</strong></TableCell>
                            <TableCell>{product.size_variant}</TableCell>
                            <TableCell><strong>Source:</strong></TableCell>
                            <TableCell>{product.source.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><strong>Description:</strong></TableCell>
                            <TableCell colSpan={3}>{product.description}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

            </CardContent>
        </Card>
    );
};

export default ProductInfoCard;

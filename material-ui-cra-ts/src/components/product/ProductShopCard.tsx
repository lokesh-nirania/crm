import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, CardActionArea } from '@mui/material';
import Product from '../../model/product';


const ProductShopCard: React.FC<{ product: Product, index: number, onClick: (id: number) => void }> = ({ product, index, onClick }) => {
    const [imageSrc, setImageSrc] = useState(`http://localhost:7000/${product.image_file_id}`);
    const handleImageError = () => {
        setImageSrc('/assets/dummy-product-image.png');
    };

    let sizes = ""
    if (product.size_variant === "Numeric") {
        sizes = "24 to 48"
    } else if (product.size_variant === "Alpha") {
        sizes = "XS to 4XL"
    } else {
        sizes = "NA"
    }
    return (
        <Card sx={{ maxWidth: 300, minWidth: 200 }}>
            {/* Image */}
            <CardActionArea onClick={() => { onClick(product.ID) }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={imageSrc} // Placeholder if image is not available
                    alt={product.name}
                    onError={handleImageError}
                />

                {/* Product Info */}
                <CardContent>
                    <Typography variant="h6" component="div">
                        {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        SKU: {product.sku}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Color: {product.color.name}
                    </Typography>
                    {sizes !== "NA" && <Typography variant="body2" color="text.secondary">
                        Sizes: {sizes}
                    </Typography>}
                    <Typography variant="body2" color="text.secondary">
                        Gender: {product.gender.name}
                    </Typography>

                    {/* Pricing */}
                    <Box sx={{ mt: 1 }}>
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
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ProductShopCard;

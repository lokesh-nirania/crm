import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, FormGroup, Grid2 as Grid, Pagination } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getAllFilteredProducts, getAllFilters } from '../api/product_service';
import Product, { ListFilter, ProductAttributeList, ProductAttributeProperty, ProductFilter, PropertyFilter } from '../model/product';
import { enqueueSnackbar } from 'notistack';
import { ExpandMore } from '@mui/icons-material';
import ProductShopCard from '../components/product/ProductShopCard';
import ProductInfoCard from '../components/product/ProductCard';

const Shop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProdcut] = useState<Product | null>(null)
    const [tempfilters, setTempFilters] = useState<Array<ProductFilter>>([]);
    const [filters, setFilters] = useState<Array<ProductFilter>>([]);
    const [initialFilters, setInitialFilters] = useState<Array<ProductFilter>>([]);
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [openInfoCard, setOpenInfoCard] = useState(false);

    const fetchProductFilters = async () => {
        try {
            const f = await getAllFilters();
            setFilters(f);
            setTempFilters(f);
            setInitialFilters(f);

        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
            window.location.href = '/';
        }
    }

    const handleApplyFilters = () => {
        setFilters(tempfilters);
    }

    const fetchProducts = async (page: number, pageSize: number) => {

        try {
            const f = await getAllFilteredProducts(filters, page, pageSize);
            setProducts(f.products);
            setTotalPages(f.total_pages)

        } catch (error) {
            console.error("Failed to fetch data:", error);

        }
    };

    const handleCheckBoxChange = (fid: number, pid: number, nv: boolean) => {
        console.log(fid, pid);

        const updatedFilters: Array<ProductFilter> = [];

        tempfilters.forEach((f, fi) => {
            if (f instanceof PropertyFilter) {
                let npps: Array<ProductAttributeProperty> = []
                f.values.forEach((pp, ppi) => {
                    let npp: ProductAttributeProperty = new ProductAttributeProperty(pp.ID, pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
                    npps.push(npp)
                });
                const nf = new PropertyFilter(f.name, f.filterType, f.isSelected, npps)
                updatedFilters.push(nf)
            } else if (f instanceof ListFilter) {
                let npps: Array<ProductAttributeList> = []
                f.values.forEach((pp, ppi) => {
                    let npp: ProductAttributeList = new ProductAttributeList(pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
                    npps.push(npp)
                });
                const nf = new ListFilter(f.name, f.filterType, f.isSelected, npps)
                updatedFilters.push(nf);
            }
        });

        setTempFilters(updatedFilters);
    }

    const handleCardClick = async (index: number) => {
        setSelectedProdcut(products[index]);
        setOpenInfoCard(true);
    }

    useEffect(() => {
        fetchProductFilters();
    }, [])

    useEffect(() => {
        fetchProducts(pageNo, 8);
    }, [filters, pageNo])

    return (

        <div style={{ display: 'flex', width: '100%', height: '80vh' }}>

            <div style={{ width: '200px', marginRight: '16px', flexShrink: 0 }}>
                {initialFilters.length > 0 && initialFilters.map((f, fi) => {
                    if ((f instanceof PropertyFilter || f instanceof ListFilter) && f.values.length > 0) {
                        return (
                            <Accordion sx={{ margin: 0, padding: 0 }} key={fi}>
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    {f.name.toUpperCase()}
                                </AccordionSummary>
                                <AccordionDetails>
                                    <FormGroup>
                                        {f.values.map((v, vi) => {
                                            return (
                                                <FormControlLabel
                                                    key={vi}
                                                    control={
                                                        <Checkbox
                                                            onChange={(h) => {
                                                                console.log("h.target.checked ", h.target.checked)
                                                                handleCheckBoxChange(fi, vi, h.target.checked);
                                                            }}
                                                            defaultChecked={v.isChecked}
                                                        />
                                                    }
                                                    label={v.name}
                                                />
                                            );
                                        })}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleApplyFilters()} // Add your handler function here
                                            sx={{ marginTop: 2 }} // Optional: Add margin for spacing
                                        >
                                            Apply
                                        </Button>
                                    </FormGroup>
                                </AccordionDetails>
                            </Accordion>
                        );
                    } else if (f instanceof ListFilter && f.values.length > 0) {

                    }
                    return null; // Return null for unsupported filter types
                })}
            </div>
            <div style={{ display: 'flex', width: '100%', height: '90vh', flexDirection: 'column' }}>
                {/* Scrollable Content */}
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Grid container spacing={3}>
                        {products.map((product, pi) => (
                            <Grid key={product.ID} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}>
                                <ProductShopCard product={product} index={pi} onClick={handleCardClick} />
                            </Grid>
                        ))}
                    </Grid>
                </div>

                {/* Pagination (outside the scrollable area) */}
                <div style={{ padding: '16px', borderTop: '1px solid #ccc', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pagination count={totalPages} onChange={(event: React.ChangeEvent<unknown>, value: number) => {
                        setPageNo(value);
                    }} color="primary" />
                </div>
            </div>
            <Dialog open={openInfoCard} onClose={() => { setOpenInfoCard(false); }} fullWidth>
                <DialogTitle>View Product Details</DialogTitle>
                <DialogContent>
                    <ProductInfoCard product={selectedProduct} />
                </DialogContent>
            </Dialog>
        </div>
    )
};

export default Shop;
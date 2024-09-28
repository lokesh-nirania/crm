import React, { useState } from 'react';
import { TextField, Button, Grid2 as Grid, Box } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AddGRNVendorRequest } from '../../model/grns';
import { postVendorData } from '../../api/grns_service';

// Define types for your dropdown options and product data


const GRNVendorForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [vendorName, setVendorName] = useState("");
    const [vendorCode, setVendorCode] = useState("");

    const saveVendor = async () => {
        try {
            const warehouseReq: AddGRNVendorRequest = { name: vendorName, code: vendorCode }
            await postVendorData(warehouseReq);
            enqueueSnackbar("Vendor Added Successfully", { variant: 'success' });
            onSuccess();
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveVendor();
    };



    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <TextField
                                id="name"
                                label="Name"
                                fullWidth
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setVendorName(event.target.value)
                                }}
                            >
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                id="code"
                                label="Code"
                                fullWidth
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setVendorCode(event.target.value)
                                }}
                            >
                            </TextField>
                        </Grid>
                    </Grid>
                    <Box display="flex" justifyContent="end">
                        <Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" color="error" onClick={onSuccess}>Cancel</Button>
                        <Button sx={{ mt: 4, mb: 2, ml: 2 }} variant="contained" onClick={handleSubmit}>Save</Button>
                    </Box>
                </Box>
            </form >
        </div>
    );
};

export default GRNVendorForm;

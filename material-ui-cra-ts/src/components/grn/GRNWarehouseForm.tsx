import React, { useState } from 'react';
import { TextField, Button, Grid2 as Grid, Box } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { AddGRNWarehouseRequest } from '../../model/grns';
import { postWarehouseData } from '../../api/grns_service';

// Define types for your dropdown options and product data


const GRNWarehouseForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [wareHouseName, setWarehouseName] = useState("");
    const [wareHouseCode, setWarehouseCode] = useState("");

    const saveWarehouse = async () => {
        try {
            const warehouseReq: AddGRNWarehouseRequest = { name: wareHouseName, code: wareHouseCode }
            await postWarehouseData(warehouseReq);
            enqueueSnackbar("Warehouse Added Successfully", { variant: 'success' });
            onSuccess();
        } catch (error: any) {
            enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveWarehouse();
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
                                    setWarehouseName(event.target.value)
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
                                    setWarehouseCode(event.target.value)
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

export default GRNWarehouseForm;

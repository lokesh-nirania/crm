import React from "react";
import GRN from "../../model/grns";
import { Card, CardContent, Typography, Grid2 as Grid, Box } from "@mui/material";

const GRNCard: React.FC<{ grn: GRN | null }> = ({ grn }) => {
    if (grn === null) return <></>;
    return <Card sx={{ maxWidth: 600, borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
                GRN ID: {grn.id}
            </Typography>
            <Grid container spacing={2}>
                <Grid size={6}>
                    <Typography variant="body1">Status: {grn.status}</Typography>
                    <Typography variant="body1">Source: {grn.source}</Typography>
                    <Typography variant="body1">PO: {grn.po}</Typography>
                </Grid>
                <Grid size={6}>
                    <Typography variant="body1">Warehouse: {grn.warehouse.name} ({grn.warehouse.code})</Typography>
                    <Typography variant="body1">Vendor: {grn.vendor.name} ({grn.vendor.code})</Typography>
                </Grid>
            </Grid>

            <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary">Dates</Typography>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Typography variant="body2">Created: {grn.created_at}</Typography>
                    </Grid>
                    <Grid size={4}>
                        <Typography variant="body2">Expected: {grn.expected_date}</Typography>
                    </Grid>
                    <Grid size={4}>
                        <Typography variant="body2">Confirmed: {grn.confirmed_date === "" ? "Unconfirmed" : grn.confirmed_date}</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary">User Info</Typography>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography variant="body2">Created By: {grn.created_by.Username}</Typography>
                        <Typography variant="body2">Email: {grn.created_by.Email}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="body2">Confirmed By: {grn.confirmed_by?.Username ?? "-"}</Typography>
                        <Typography variant="body2">Email: {grn.confirmed_by?.Email ?? "-"}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </CardContent>
    </Card>;

}


export default GRNCard
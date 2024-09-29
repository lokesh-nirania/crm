import React, { useEffect, useState } from 'react';
import { ProductFilter } from '../model/product';
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { DataGrid, GridPaginationModel, GridRowSelectionModel, GridRowsProp } from '@mui/x-data-grid';
import { confirmGRNData, getAllFilteredGRNs } from '../api/grns_service';
import GRN, { ConfirmGRNRequest } from '../model/grns';
import GRNForm from '../components/grn/GRNForm';
import { Edit, Visibility } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import GRNCard from '../components/grn/GRNCard';

const Orders: React.FC = () => {

	// const [tempfilters, setTempFilters] = useState<Array<ProductFilter>>([]);
	// const [filters, setFilters] = useState<Array<ProductFilter>>([]);
	// const [initialFilters, setInitialFilters] = useState<Array<ProductFilter>>([]);

	const [openFormDialog, setOpenFormDialog] = useState(false);

	// const fetchProductFilters = async () => {
	// 	try {
	// 		const f = await getAllFilters();
	// 		setFilters(f);
	// 		setTempFilters(f);
	// 		setInitialFilters(f);

	// 	} catch (error: any) {
	// 		enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
	// 		window.location.href = '/';
	// 	}
	// }

	// const handleApplyFilters = () => {
	// 	setFilters(tempfilters);
	// }

	// const handleCheckBoxChange = (fid: number, pid: number, nv: boolean) => {
	// 	console.log(fid, pid);

	// 	const updatedFilters: Array<ProductFilter> = [];

	// 	tempfilters.forEach((f, fi) => {
	// 		if (f instanceof PropertyFilter) {
	// 			let npps: Array<ProductAttributeProperty> = []
	// 			f.values.forEach((pp, ppi) => {
	// 				let npp: ProductAttributeProperty = new ProductAttributeProperty(pp.ID, pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
	// 				npps.push(npp)
	// 			});
	// 			const nf = new PropertyFilter(f.name, f.filterType, f.isSelected, npps)
	// 			updatedFilters.push(nf)
	// 		} else if (f instanceof ListFilter) {
	// 			let npps: Array<ProductAttributeList> = []
	// 			f.values.forEach((pp, ppi) => {
	// 				let npp: ProductAttributeList = new ProductAttributeList(pp.name, (ppi === pid && fi === fid) ? nv : pp.isChecked)
	// 				npps.push(npp)
	// 			});
	// 			const nf = new ListFilter(f.name, f.filterType, f.isSelected, npps)
	// 			updatedFilters.push(nf);
	// 		}
	// 	});

	// 	setTempFilters(updatedFilters);
	// }
	useEffect(() => {
		// fetchProductFilters();
	}, []);

	// useEffect(() => {
	// 	console.log("filters are changed above");
	// }, [filters]);


	return (
		<div style={{ display: 'flex', width: '100%' }}>

			<div style={{ width: '200px', marginRight: '16px' }}>
				{/* {initialFilters.length > 0 && initialFilters.map((f, fi) => {
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
				})} */}
				<Button
					variant="contained"
					color="primary"
					onClick={() => setOpenFormDialog(true)} // Add your handler function here
					sx={{ marginTop: 2 }} // Optional: Add margin for spacing
				>
					Add New GRN
				</Button>
				<></>
			</div>

			{/* Products Table Section */}
			<div style={{}}>
				<OrderTable filters={[]} />
			</div>

			<Dialog open={openFormDialog} onClose={() => { setOpenFormDialog(false) }} fullWidth>
				<DialogTitle>Add New GRN</DialogTitle>
				<DialogContent>
					<GRNForm onSuccess={() => { setOpenFormDialog(false); /*fetchProductFilters();*/ }} />
				</DialogContent>
			</Dialog >
		</div >
	);

};

export default Orders;

interface OrderTableProps {
	filters: Array<ProductFilter>;
}

const OrderTable: React.FC<OrderTableProps> = ({ filters }) => {
	const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
		page: 0,
		pageSize: 10,
	});
	const [rows, setRows] = useState<GridRowsProp>([]);
	const [grns, setGRNS] = useState<GRN[]>([]);
	const [selectedGrn, setSelectedGRN] = useState<GRN | null>(null);
	const [loading, setLoading] = useState(false);
	const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
	const [rowCount, setRowCount] = useState(0);

	const [openViewGRNDialog, setOpenViewGRNDialog] = useState(false);

	const handleGRNViewButton = async (index: number) => {
		setSelectedGRN(grns[index])
		setOpenViewGRNDialog(true);
	}

	const confirmGRNButton = async (grn_id: number, index: number) => {
		try {
			const confirmGrnRequest: ConfirmGRNRequest = {
				grn_id: grn_id,
			}
			const confirmedGRN = await confirmGRNData(confirmGrnRequest)
			const updatedRow: {
				index: number,
				id: number,
				source: string,
				status: string,
				po: string,
				remarks: string,
				vendor: string,
				warehouse: string,
				created_at: string,
				expected_date: string,
				confirmed_date: string,
				created_by: string,
				confirmed_by: string,
				actions: JSX.Element,
			} = {
				index: index,
				id: confirmedGRN.grn.id,
				source: confirmedGRN.grn.source,
				status: confirmedGRN.grn.status,
				po: confirmedGRN.grn.po,
				remarks: confirmedGRN.grn.remarks,
				vendor: confirmedGRN.grn.vendor.name,
				warehouse: confirmedGRN.grn.warehouse.name,
				created_at: confirmedGRN.grn.created_at,
				expected_date: confirmedGRN.grn.expected_date,
				confirmed_date: confirmedGRN.grn.confirmed_date,
				created_by: confirmedGRN.grn.created_by.Username,
				confirmed_by: confirmedGRN.grn.confirmed_by?.Username ?? "-",
				actions: <></>,
			}

			// need to update only row with ID = grin_id
			setRows((prevRows) =>
				prevRows.map((row) =>
					row.id === grn_id ? updatedRow : row // Replace the row with the updated row data
				)
			);

			setGRNS((prevRows) =>
				prevRows.map((grn) =>
					grn.id === grn_id ? confirmedGRN.grn : grn // Replace the row with the updated row data
				)
			);

			enqueueSnackbar("GRN Confirmed Succcessfully", { variant: 'success' }); // Show error notification

			console.log("need to confrom grin i ", grn_id, JSON.stringify(confirmedGRN))
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	// Simulated API call to fetch data
	const fetchOrders = async (page: number, pageSize: number) => {
		setLoading(true);
		try {
			const f = await getAllFilteredGRNs(filters, page, pageSize);
			setGRNS(f.grns);
			let a: Array<{
				index: number,
				id: number,
				source: string,
				status: string,
				po: string,
				remarks: string,
				vendor: string,
				warehouse: string;
				created_at: string;
				expected_date: string,
				confirmed_date: string,
				created_by: string,
				confirmed_by: string,
				actions: JSX.Element,
			}> = [];

			console.log("----> ", f.grns);

			// Iterate over fetched products and populate the 'a' array
			f.grns.forEach((element: GRN, index: number) => {
				a.push({
					index: index,
					id: element.id,
					source: element.source,
					status: element.status,
					po: element.po,
					remarks: element.remarks,
					vendor: element.vendor.name,
					warehouse: element.warehouse.name,
					created_at: element.created_at,
					expected_date: element.expected_date,
					confirmed_date: element.confirmed_date,
					created_by: element.created_by.Username,
					confirmed_by: element.confirmed_by?.Username ?? "-",
					actions: <></>,
				});
			});

			// Set the rows with the new array of products
			setRows(a);
			setRowCount(f.total_items); // Assuming data.totalItems gives total product count
		} catch (error) {
			console.error("Failed to fetch data:", error);

		}
		setLoading(false);
	};

	// Fetch data when page or page size changes
	useEffect(() => {
		console.log("filters are changed");
		fetchOrders(paginationModel.page + 1, paginationModel.pageSize);
	}, [paginationModel.page, paginationModel.pageSize, filters]);

	return (
		<div style={{ height: '100%', width: 1600, overflow: 'auto' }}>
			<DataGrid
				rows={rows}
				disableMultipleRowSelection={true}
				pagination
				checkboxSelection
				rowHeight={40}
				disableColumnMenu
				disableColumnSorting
				paginationModel={paginationModel}
				pageSizeOptions={[3, 5, 10, 20, 50, 100]}
				rowCount={rowCount}
				paginationMode="server"
				onPaginationModelChange={setPaginationModel}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					setRowSelectionModel(newRowSelectionModel);
				}}
				rowSelectionModel={rowSelectionModel}
				loading={loading}
				keepNonExistentRowsSelected


				columns={[
					{ field: 'id', headerName: 'GRN ID', width: 90 },
					{ field: 'status', headerName: 'Status', flex: 1 },
					{ field: 'source', headerName: 'Source', flex: 1 },
					{ field: 'created_at', headerName: 'Created On', flex: 1 },
					{ field: 'created_by', headerName: 'Created By', flex: 1 },
					{ field: 'expected_date', headerName: 'Expected By', flex: 1 },
					{ field: 'confirmed_date', headerName: 'Confirmed On', flex: 1 },
					{ field: 'confirmed_by', headerName: 'Confirmed By', flex: 1 },
					{ field: 'po', headerName: 'PO', flex: 2 },
					{ field: 'vendor', headerName: 'Vendor', flex: 1 },
					{ field: 'warehouse', headerName: 'Warehouse', flex: 1 },

					{
						field: 'actions', headerName: "Actions", flex: 2,
						renderCell: (params) => (
							<div>
								<IconButton aria-label="view" onClick={() => handleGRNViewButton(params.row.index)}>
									<Visibility />
								</IconButton>
								{params.row.status === "Pending" && <Button variant="contained" onClick={() => { confirmGRNButton(params.row.id, params.row.index) }}>Confirm</Button>}
								{params.row.status === "Confirmed" && <Button variant="contained" disabled>Confirmed</Button>}
							</div>
						),
					},
				]}

			/>
			<Dialog open={openViewGRNDialog} onClose={() => { setOpenViewGRNDialog(false) }} fullWidth>
				<DialogTitle>View GRN</DialogTitle>
				<DialogContent>
					<GRNCard grn={selectedGrn} />
				</DialogContent>
			</Dialog >
		</div>
	);
};


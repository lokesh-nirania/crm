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
import { cancelOrder, confirmOrder, getOrders } from '../api/order_service';
import Order from '../model/order';
import { useAuth } from '../providers/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/order/OrderForm';
import OrderCard from '../components/order/OrderCard';

const Orders: React.FC = () => {


	const [openFormDialog, setOpenFormDialog] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();




	return (
		<div style={{ width: '100%' }}>
			<Button
				variant="contained"
				color="primary"
				onClick={() => {
					if (user?.UserType === "admin") { setOpenFormDialog(true) }
					else {
						navigate("/shop")
					}
				}} // Add your handler function here
				sx={{ marginTop: 2, mb: 2 }} // Optional: Add margin for spacing
			>
				Add New Order
			</Button>
			<OrderTable filters={[]} />

			<Dialog open={openFormDialog} onClose={() => { setOpenFormDialog(false) }} fullWidth>
				<DialogTitle>Add New Order</DialogTitle>
				<DialogContent>
					<OrderForm onSuccess={() => { setOpenFormDialog(false); /*fetchProductFilters();*/ }} />
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
	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(false);
	const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
	const [rowCount, setRowCount] = useState(0);

	const { user } = useAuth();

	const [openViewGRNDialog, setOpenViewGRNDialog] = useState(false);

	const handleOrderViewButton = async (index: number) => {
		setSelectedOrder(orders[index])
		setOpenViewGRNDialog(true);
	}

	const confirmOrderButton = async (order_id: number, index: number) => {
		try {
			const confirmedOrder = await confirmOrder(order_id)
			const updatedRow: {
				index: number,
				id: number;
				created_at: string;
				updated_at: string;
				status: string;
				price: number;
				created_by: string;
				created_for: string;
				actions: JSX.Element,
			} = {
				index: index,
				id: confirmedOrder.order.ID,
				created_at: confirmedOrder.order.CreatedAt,
				updated_at: confirmedOrder.order.UpdatedAt,
				status: confirmedOrder.order.Status,
				price: confirmedOrder.order.Price,
				created_by: confirmedOrder.order.created_by.Username,
				created_for: confirmedOrder.order.created_for.Username,
				actions: <></>,
			}

			// need to update only row with ID = grin_id
			setRows((prevRows) =>
				prevRows.map((row) =>
					row.id === order_id ? updatedRow : row // Replace the row with the updated row data
				)
			);

			setOrders((prevRows) =>
				prevRows.map((grn) =>
					grn.ID === order_id ? confirmedOrder.order : grn // Replace the row with the updated row data
				)
			);

			enqueueSnackbar("Order Confirmed Succcessfully", { variant: 'success' }); // Show error notification

			console.log("need to confrom grin i ", order_id, JSON.stringify(confirmedOrder))
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	const cancelOrderButton = async (order_id: number, index: number) => {
		try {
			const cancelledOrder = await cancelOrder(order_id)
			const updatedRow: {
				index: number,
				id: number;
				created_at: string;
				updated_at: string;
				status: string;
				price: number;
				created_by: string;
				created_for: string;
				actions: JSX.Element,
			} = {
				index: index,
				id: cancelledOrder.order.ID,
				created_at: cancelledOrder.order.CreatedAt,
				updated_at: cancelledOrder.order.UpdatedAt,
				status: cancelledOrder.order.Status,
				price: cancelledOrder.order.Price,
				created_by: cancelledOrder.order.created_by.Username,
				created_for: cancelledOrder.order.created_for.Username,
				actions: <></>,
			}

			// need to update only row with ID = grin_id
			setRows((prevRows) =>
				prevRows.map((row) =>
					row.id === order_id ? updatedRow : row // Replace the row with the updated row data
				)
			);

			setOrders((prevRows) =>
				prevRows.map((grn) =>
					grn.ID === order_id ? cancelledOrder.order : grn // Replace the row with the updated row data
				)
			);

			enqueueSnackbar("Order Confirmed Succcessfully", { variant: 'success' }); // Show error notification

			console.log("need to confrom grin i ", order_id, JSON.stringify(cancelledOrder))
		} catch (error: any) {
			enqueueSnackbar(error.message, { variant: 'error' }); // Show error notification
		}
	}

	// Simulated API call to fetch data
	const fetchOrders = async (page: number, pageSize: number) => {
		setLoading(true);
		try {
			const f = await getOrders([], page, pageSize);
			setOrders(f.orders);
			let a: Array<{
				index: number,
				id: number;
				created_at: string;
				updated_at: string;
				status: string;
				price: number;
				created_by: string;
				created_for: string;
				confirmed_by: string;
				cancelled_by: string;
				actions: JSX.Element,
			}> = [];

			console.log("----> ", f.orders);

			// Iterate over fetched products and populate the 'a' array
			f.orders.forEach((element: Order, index: number) => {
				a.push({
					index: index,
					id: element.ID,
					created_at: element.CreatedAt,
					updated_at: element.UpdatedAt,
					status: element.Status,
					price: element.Price,
					created_by: element.created_by.Username,
					created_for: element.created_for.Username,
					confirmed_by: element.confirmed_by?.Username ?? "-",
					cancelled_by: element.cancelled_by?.Username ?? "-",
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
		<div >
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
					{ field: 'id', headerName: 'Order ID', width: 90 },
					{ field: 'status', headerName: 'Status', flex: 1 },
					{ field: 'price', headerName: 'Price', },
					{ field: 'created_at', headerName: 'Created On', flex: 2 },
					{ field: 'created_by', headerName: 'Created By', flex: 1 },
					{ field: 'created_for', headerName: 'Created For', flex: 1 },
					{ field: 'confirmed_by', headerName: 'Confirmed By', flex: 1 },
					{ field: 'cancelled_by', headerName: 'Cancelled By', flex: 1 },

					{
						field: 'actions', headerName: "Actions", flex: user?.UserType === "admin" ? 3 : 2,
						renderCell: (params) => (
							<div>
								<IconButton aria-label="view" onClick={() => handleOrderViewButton(params.row.index)}>
									<Visibility />
								</IconButton>
								{user?.UserType === "admin" && params.row.status === "Pending" && <Button sx={{ ml: 1 }} variant="contained" onClick={() => { confirmOrderButton(params.row.id, params.row.index) }}>Confirm</Button>}
								{params.row.status === "Pending" && <Button variant="contained" sx={{ ml: 1 }} color="error" onClick={() => { cancelOrderButton(params.row.id, params.row.index) }}>Cancel</Button>}
								{params.row.status === "Confirmed" && <Button variant="contained" sx={{ ml: 1 }} disabled>Confirmed</Button>}
								{params.row.status === "Cancelled" && <Button variant="contained" sx={{ ml: 1 }} disabled>Cancelled</Button>}
							</div>
						),
					},
				]}

			/>
			<Dialog open={openViewGRNDialog} onClose={() => { setOpenViewGRNDialog(false) }} fullWidth>
				<DialogTitle>View Order</DialogTitle>
				<DialogContent>
					<OrderCard order={selectedOrder} />
				</DialogContent>
			</Dialog >
		</div>
	);
};


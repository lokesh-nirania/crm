package dto

type OrderRequest struct {
	Order      []CartItem `json:"order" binding:"required"`
	TotalPrice int        `json:"total_price" binding:"required"`
}

type CartItem struct {
	ProductId int   `json:"product_id" binding:"required"`
	Sets      []Set `json:"sets" binding:"required"`
}

type Set struct {
	Size1    SetSizeVariant `json:"size1" binding:"required"`
	Size2    SetSizeVariant `json:"size2" binding:"required"`
	Size3    SetSizeVariant `json:"size3" binding:"required"`
	Quantity int            `json:"quantity" binding:"required"`
	Price    int            `json:"price" binding:"required"`
}

type SetSizeVariant struct {
	ID       int    `json:"id" binding:"required"`
	Varinat  string `json:"variant"`
	Name     string `json:"name"`
	Quantity int    `json:"quantity" binding:"required"`
}

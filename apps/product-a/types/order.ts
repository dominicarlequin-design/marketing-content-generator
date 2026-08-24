export type OrderLineItem = {
  isbn: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
};

export type Order = {
  orderId: string;
  status: string;
  items: OrderLineItem[];
};

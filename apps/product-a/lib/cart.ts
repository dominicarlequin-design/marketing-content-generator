import type { Book } from "@/types/book";

const CART_STORAGE_KEY = "riverside-books-cart";

export type CartItem = {
  isbn: string;
  title: string;
  author: string;
  quantity: number;
};

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(book: Pick<Book, "isbn" | "title" | "author">): CartItem[] {
  const items = readCart();
  const existing = items.find((item) => item.isbn === book.isbn);
  const next = existing
    ? items.map((item) =>
        item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item
      )
    : [...items, { isbn: book.isbn, title: book.title, author: book.author, quantity: 1 }];
  writeCart(next);
  return next;
}

export function removeFromCart(isbn: string): CartItem[] {
  const next = readCart().filter((item) => item.isbn !== isbn);
  writeCart(next);
  return next;
}

export function setQuantity(isbn: string, quantity: number): CartItem[] {
  const items = readCart();
  const next =
    quantity <= 0
      ? items.filter((item) => item.isbn !== isbn)
      : items.map((item) => (item.isbn === isbn ? { ...item, quantity } : item));
  writeCart(next);
  return next;
}

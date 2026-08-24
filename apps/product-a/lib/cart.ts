import { useSyncExternalStore } from "react";
import type { Book } from "@/types/book";

const CART_STORAGE_KEY = "riverside-books-cart";

export type CartItem = {
  isbn: string;
  title: string;
  author: string;
  price: number;
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

// A stable in-memory snapshot, kept in sync with localStorage. useSyncExternalStore requires
// getSnapshot to return a cached reference (not re-parse JSON on every call), so this is the
// source of truth components read from; localStorage is just where it persists across reloads.
let cachedItems: CartItem[] = readCart();

const listeners = new Set<() => void>();

function writeCart(items: CartItem[]): void {
  cachedItems = items;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// A single stable reference — useSyncExternalStore requires getServerSnapshot to return the
// same value across calls, same as getSnapshot; a fresh [] literal each call causes React to
// think the snapshot changed every render and loop forever.
const EMPTY_CART: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

// The hook components should use to read the cart — automatically re-renders on any mutation
// below, and handles the server-has-no-cart / client-hydrates-real-cart split without a manual
// "hydrated" state flag (React's own sanctioned pattern for external, client-only state).
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, () => cachedItems, getServerSnapshot);
}

export function getCart(): CartItem[] {
  return cachedItems;
}

export function addToCart(book: Pick<Book, "isbn" | "title" | "author" | "price">): CartItem[] {
  const existing = cachedItems.find((item) => item.isbn === book.isbn);
  const next = existing
    ? cachedItems.map((item) =>
        item.isbn === book.isbn ? { ...item, quantity: item.quantity + 1 } : item
      )
    : [
        ...cachedItems,
        { isbn: book.isbn, title: book.title, author: book.author, price: book.price, quantity: 1 },
      ];
  writeCart(next);
  return next;
}

export function removeFromCart(isbn: string): CartItem[] {
  const next = cachedItems.filter((item) => item.isbn !== isbn);
  writeCart(next);
  return next;
}

export function setQuantity(isbn: string, quantity: number): CartItem[] {
  const next =
    quantity <= 0
      ? cachedItems.filter((item) => item.isbn !== isbn)
      : cachedItems.map((item) => (item.isbn === isbn ? { ...item, quantity } : item));
  writeCart(next);
  return next;
}

export function clearCart(): void {
  writeCart([]);
}

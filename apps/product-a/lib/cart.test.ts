import { beforeEach, describe, expect, it } from "vitest";
import { addToCart, clearCart, getCart, removeFromCart, setQuantity } from "./cart";

const midnightLibrary = { isbn: "978-0-525-55948-1", title: "The Midnight Library", author: "Matt Haig", price: 17.99 };
const educated = { isbn: "978-0-399-59050-4", title: "Educated", author: "Tara Westover", price: 16.99 };

beforeEach(() => {
  clearCart();
});

describe("addToCart", () => {
  it("adds a new item with quantity 1", () => {
    const items = addToCart(midnightLibrary);
    expect(items).toEqual([{ ...midnightLibrary, quantity: 1 }]);
  });

  it("increments quantity instead of duplicating when the same book is added again", () => {
    addToCart(midnightLibrary);
    const items = addToCart(midnightLibrary);
    expect(items).toEqual([{ ...midnightLibrary, quantity: 2 }]);
  });

  it("keeps separate line items for different books", () => {
    addToCart(midnightLibrary);
    const items = addToCart(educated);
    expect(items).toHaveLength(2);
    expect(items.map((item) => item.isbn)).toEqual([midnightLibrary.isbn, educated.isbn]);
  });
});

describe("removeFromCart", () => {
  it("removes the matching item and leaves others untouched", () => {
    addToCart(midnightLibrary);
    addToCart(educated);
    const items = removeFromCart(midnightLibrary.isbn);
    expect(items).toEqual([{ ...educated, quantity: 1 }]);
  });

  it("is a no-op when the isbn isn't in the cart", () => {
    addToCart(midnightLibrary);
    const items = removeFromCart("not-a-real-isbn");
    expect(items).toEqual([{ ...midnightLibrary, quantity: 1 }]);
  });
});

describe("setQuantity", () => {
  it("updates the quantity for an existing item", () => {
    addToCart(midnightLibrary);
    const items = setQuantity(midnightLibrary.isbn, 5);
    expect(items).toEqual([{ ...midnightLibrary, quantity: 5 }]);
  });

  it("removes the item when quantity is set to 0 (matches the cart page's quantity input)", () => {
    addToCart(midnightLibrary);
    const items = setQuantity(midnightLibrary.isbn, 0);
    expect(items).toEqual([]);
  });

  it("removes the item when quantity is negative", () => {
    addToCart(midnightLibrary);
    const items = setQuantity(midnightLibrary.isbn, -1);
    expect(items).toEqual([]);
  });
});

describe("clearCart", () => {
  it("empties the cart", () => {
    addToCart(midnightLibrary);
    addToCart(educated);
    clearCart();
    expect(getCart()).toEqual([]);
  });
});

describe("getCart / localStorage persistence", () => {
  it("reflects the current state after mutations", () => {
    addToCart(midnightLibrary);
    expect(getCart()).toEqual([{ ...midnightLibrary, quantity: 1 }]);
  });

  it("persists to localStorage so a reload doesn't lose the cart", () => {
    addToCart(midnightLibrary);
    const raw = window.localStorage.getItem("riverside-books-cart");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual([{ ...midnightLibrary, quantity: 1 }]);
  });
});

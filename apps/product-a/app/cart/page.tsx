"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, removeFromCart, setQuantity, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {totalItems === 0 ? "Nothing here yet." : `${totalItems} item${totalItems === 1 ? "" : "s"}`}
      </p>

      {items.length === 0 ? (
        <Link href="/" className="text-sm underline">
          Browse the catalog
        </Link>
      ) : (
        <>
          <ul className="divide-y divide-neutral-200">
            {items.map((item) => (
              <li key={item.isbn} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-neutral-500">{item.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(event) =>
                      setItems(setQuantity(item.isbn, Number(event.target.value)))
                    }
                    className="w-14 rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setItems(removeFromCart(item.isbn))}
                    className="text-xs text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-neutral-400">
            Checkout isn&apos;t built yet — the shared schema has no price column, so an order
            total can&apos;t be computed until that&apos;s added (a schema decision, not
            something to invent here).
          </p>
        </>
      )}
    </main>
  );
}

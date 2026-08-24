import Link from "next/link";
import { getBooks } from "@/lib/books";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function Home() {
  const { books, source } = await getBooks();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Riverside Books</h1>
        <Link href="/cart" className="text-sm underline">
          View cart
        </Link>
      </div>
      <p className="mb-6 text-sm text-neutral-500">Browse what&apos;s on the shelf.</p>

      {source === "sample" && (
        <p className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Showing sample data. Copy <code>.env.example</code> to <code>.env.local</code> and fill
          in a Supabase project&apos;s URL and anon key to see your real catalog.
        </p>
      )}

      {source === "supabase" && books.length === 0 && (
        <p className="text-sm text-neutral-500">No books in the catalog yet.</p>
      )}

      {books.length > 0 && (
        <ul className="divide-y divide-neutral-200">
          {books.map((book) => (
            <li key={book.isbn} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-neutral-500">{book.author}</p>
                <p className="text-xs text-neutral-400">
                  {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : "Out of stock"}
                </p>
              </div>
              <AddToCartButton book={book} disabled={book.stockQuantity === 0} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

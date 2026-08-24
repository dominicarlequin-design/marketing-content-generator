import { getBooks } from "@/lib/books";

export default async function Home() {
  const { books, configured } = await getBooks();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Riverside Books</h1>
      <p className="mb-6 text-sm text-neutral-500">Browse what&apos;s on the shelf.</p>

      {!configured && (
        <p className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Supabase isn&apos;t configured yet. Copy <code>.env.example</code> to{" "}
          <code>.env.local</code> and fill in your project&apos;s URL and anon key to see live
          catalog data.
        </p>
      )}

      {configured && books.length === 0 && (
        <p className="text-sm text-neutral-500">No books in the catalog yet.</p>
      )}

      {configured && books.length > 0 && (
        <ul className="divide-y divide-neutral-200">
          {books.map((book) => (
            <li key={book.isbn} className="py-3">
              <p className="font-medium">{book.title}</p>
              <p className="text-sm text-neutral-500">{book.author}</p>
              <p className="text-xs text-neutral-400">
                {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : "Out of stock"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

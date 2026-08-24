import { getSupabaseClient } from "./supabase";
import type { Book } from "../types/book";

export type BooksSource = "supabase" | "sample";

type BooksResult = {
  books: Book[];
  source: BooksSource;
};

// Sample data for local dev / demos before a Supabase project is configured. Pulled straight
// from docs/schema/riverside-books-integration-chaos-test.csv (the team's existing synthetic
// dataset) — not invented. Real catalog data comes from the "books" table once .env.local points
// at a real Supabase project (see .env.example and supabase/migrations/0001_books.sql).
const SAMPLE_BOOKS: Book[] = [
  { isbn: "978-0-525-55948-1", title: "The Midnight Library", author: "Matt Haig", stockQuantity: 42 },
  { isbn: "978-0-399-59050-4", title: "Educated", author: "Tara Westover", stockQuantity: 18 },
  { isbn: "978-0-7352-1909-0", title: "Where the Crawdads Sing", author: "Delia Owens", stockQuantity: 7 },
  { isbn: "978-1-250-30170-7", title: "The Silent Patient", author: "Alex Michaelides", stockQuantity: 0 },
  { isbn: "978-0-7352-1129-2", title: "Atomic Habits", author: "James Clear", stockQuantity: 95 },
  { isbn: "978-0-316-55635-9", title: "Circe", author: "Madeline Miller", stockQuantity: 33 },
  { isbn: "978-0-593-13520-4", title: "Project Hail Mary", author: "Andy Weir", stockQuantity: 55 },
  {
    isbn: "978-1-5011-6193-4",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    stockQuantity: 4,
  },
];

export async function getBooks(): Promise<BooksResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { books: SAMPLE_BOOKS, source: "sample" };
  }

  const { data, error } = await supabase
    .from("books")
    .select("ISBN, book_title, author_name, stock_quantity");

  if (error) {
    throw error;
  }

  const books: Book[] = (data ?? []).map((row) => ({
    isbn: row.ISBN,
    title: row.book_title,
    author: row.author_name,
    stockQuantity: row.stock_quantity,
  }));

  return { books, source: "supabase" };
}

import { getSupabaseClient } from "./supabase";
import type { Book } from "../types/book";

type BooksResult = {
  books: Book[];
  configured: boolean;
};

export async function getBooks(): Promise<BooksResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return { books: [], configured: false };
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

  return { books, configured: true };
}

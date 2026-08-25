export type Book = {
  isbn: string;
  title: string;
  author: string;
  stockQuantity: number;
  price: number;
  // Populated once live Google Books lookups exist (docs/google-books-integration-plan.md) —
  // null/undefined for sample data and anything not yet looked up.
  coverImageUrl?: string | null;
};

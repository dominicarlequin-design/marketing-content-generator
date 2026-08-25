import { fetchBookMetadata, clearCacheEntry, type BookMetadata } from "../lib/fetchBookMetadata";

// fetchBookMetadata() caches results in-module, including `null` on failure,
// keyed by ISBN, with no exported way to bust that cache. So a retry that
// simply calls fetchBookMetadata(isbn) again for the same ISBN in the same
// process will very likely hit that cache and return the same cached null
// instantly, without actually re-attempting the network request. This is a
// real limitation, not fixed here — fetchBookMetadata.ts is off-limits.
// Left in per request anyway: it's a correct retry of the *call*, just not
// a reliable retry of the *network fetch* for an already-cached failure.
async function fetchWithRetry(isbn: string): Promise<BookMetadata | null> {
  const first = await fetchBookMetadata(isbn);
  if (first) return first;

  clearCacheEntry(isbn);
  await new Promise((resolve) => setTimeout(resolve, 800));
  return fetchBookMetadata(isbn);
}

// One real, checksum-valid ISBN per genre bucket in lib/fetchBookMetadata.ts's
// GENRE_KEYWORD_RULES, verified live against Open Library before being hardcoded here.
// Run with: node scripts/genre-spot-check-openlibrary.ts (from apps/product-d/)
const SPOT_CHECK_BOOKS: { isbn: string; title: string; expectedGenre: string }[] = [
  { isbn: "9780064400558", title: "Charlotte's Web", expectedGenre: "children's" },
  { isbn: "9780141439846", title: "Dracula", expectedGenre: "horror" },
  { isbn: "9780307454546", title: "The Girl with the Dragon Tattoo", expectedGenre: "mystery" },
  { isbn: "9780446605236", title: "The Notebook", expectedGenre: "romance" },
  { isbn: "9780671027032", title: "How to Win Friends and Influence People", expectedGenre: "self-help" },
  { isbn: "9781476753836", title: "Salt, Fat, Acid, Heat", expectedGenre: "cookbook" },
  { isbn: "9780062316097", title: "Sapiens", expectedGenre: "nonfiction" },
  { isbn: "9780743273565", title: "The Great Gatsby", expectedGenre: "fiction" },
];

async function run() {
  for (const { isbn, title, expectedGenre } of SPOT_CHECK_BOOKS) {
    try {
      const result = await fetchWithRetry(isbn);
      const actualGenre = result?.genre ?? "(no result)";
      console.log(`${isbn}\t${title}\texpected=${expectedGenre}\tactual=${actualGenre}`);
    } catch (err) {
      console.log(`${isbn}\t${title}\texpected=${expectedGenre}\tERROR: ${String(err)}`);
    }
    // light throttling, be polite to the API
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

run();

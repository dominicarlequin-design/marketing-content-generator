import pandas as pd
import random

df = pd.read_csv("marketing_content_generator_synthetic_data.csv")

BOOK_CATALOG = {
    "978-0-12757-702-8": {"title": "The Salt and the Silence", "author": "Marguerite Voss"},
    "978-0-25860-353-3": {"title": "Nine Lives of Ember Cole", "author": "Priya Ashworth"},
    "978-0-28726-371-2": {"title": "A Quiet Kind of Thunder", "author": "Desmond Okafor"},
    "978-0-34957-196-1": {"title": "The Cartographer's Daughter", "author": "Liesel Thorne"},
    "978-0-38746-241-8": {"title": "Midnight in the Copper Hills", "author": "Rowan Faulkner"},
    "978-0-41285-371-6": {"title": "Everything We Buried", "author": "Naomi Kessler"},
    "978-0-56566-314-4": {"title": "The Last Orchard in Vellamere", "author": "Tobias Renn"},
    "978-0-59735-376-8": {"title": "Ledger of Small Gods", "author": "Amara Sethi"},
    "978-0-60019-710-7": {"title": "Cold Harbor", "author": "Frank Delacroix"},
    "978-0-62581-374-1": {"title": "The Weight of Wildflowers", "author": "Cecily Marsh"},
    "978-0-65519-520-7": {"title": "Ashes Over Rialto", "author": "Giancarlo Petrini"},
    "978-0-69429-750-5": {"title": "The Longest Winter Market", "author": "Ingrid Solvang"},
    "978-0-69638-392-6": {"title": "Static and Bone", "author": "Django Marchetti"},
    "978-0-86622-538-9": {"title": "The Beekeeper of Alsen Road", "author": "Ruth Ann Pemberton"},
    "978-1-10942-172-0": {"title": "Six Ways to Say Goodbye", "author": "Halcyon Reyes"},
    "978-1-17665-693-8": {"title": "The Obsidian Ledger", "author": "Corvin Blackwood"},
    "978-1-17944-512-5": {"title": "Paper Moons Over Kestrel Bay", "author": "Odette Lindqvist"},
    "978-1-19116-146-3": {"title": "The Physics of Falling", "author": "Samuel Okonkwo-Reid"},
    "978-1-19880-553-8": {"title": "Wolves at the Vineyard Gate", "author": "Miriam Castellano"},
    "978-1-21226-849-7": {"title": "The Improbable Rescue of Mabel Finch", "author": "Percy Nkemelu"},
    "978-1-40512-987-1": {"title": "Six Hours to Amaranth", "author": "Eloise Bardot"},
    "978-1-59009-880-2": {"title": "The Debt We Carry Home", "author": "Yusuf Al-Rashid"},
    "978-1-64948-773-9": {"title": "Glasswing", "author": "Junie Halloran"},
    "978-1-65296-287-4": {"title": "The Understory", "author": "Wendell Marsh Cho"},
    "978-1-80010-846-3": {"title": "A Recipe for Leaving", "author": "Isabela Fontes"},
    "978-1-87992-169-3": {"title": "The Clockmaker's Apprentice", "author": "Hendrik Vance"},
    "978-1-91959-405-8": {"title": "Salt Line", "author": "Bridget Ohanian"},
    "978-1-99166-838-1": {"title": "The Year of Eating Dangerously", "author": "Tomas Falk"},
    "978-1-99192-532-9": {"title": "Underneath the Marigolds", "author": "Adaeze Nwosu"},
    "9781161759811": {"title": "The Archivist's Confession", "author": "Rene Duvall"},
}

POST_TEMPLATES = [
    "📚 New arrival: {title} by {author} is here! Grab your copy today. #NewRelease",
    "Looking for your next read? {title} by {author} just landed on our shelves! 🔥",
    "Just in: {title} (ISBN: {isbn}) — a must-read from {author}. Come check it out!"
]

def generate_post(isbn):
    customer_match = df[df["isbn"].astype(str) == str(isbn)]
    if customer_match.empty:
        return f"No customer record found with ISBN {isbn}"

    row = customer_match.iloc[0]

    # Respect the schema's business rule: stock_quantity should never be negative
    if row["stock_quantity"] < 0:
        return f"Data error: ISBN {isbn} has invalid stock_quantity ({row['stock_quantity']}). Skipping post generation."

    book = BOOK_CATALOG.get(str(isbn))
    if not book:
        return f"ISBN {isbn} found in customer data, but no catalog details available yet"

    template = random.choice(POST_TEMPLATES)
    return template.format(title=book["title"], author=book["author"], isbn=isbn)

if __name__ == "__main__":
    isbn_input = input("Enter ISBN: ")
    post = generate_post(isbn_input)
    print("\nGenerated Post:\n" + post)

# Marketing Content Generator

Part of Team 5's four-product suite for Riverside Books Bookstore.

## What it does

Generates marketing content: email campaigns, social posts, and event
promos for the bookstore's customers.

## Role in the suite

This product pulls shared customer and inventory data from the other
three products in the suite:

- **Product A, Customer Ordering & Loyalty App** (Jeffrey de la Cruz):
  supplies `customer_id`, `signup_date` for audience targeting
- **Product B, Staff Inventory & Ops Dashboard** (Philip Myers):
  supplies `ISBN`, `Non Book UPC` for product-based campaigns
- **Event data** (`event_id`, `event_name`, `event_date`, `event_time`):
  drives author event and book-signing promos

## Shared data contract

| Column | Format | Example |
|---|---|---|
| customer_id | string | cust_00042 |
| signup_date | date (YYYY-MM-DD) | 2026-03-14 |
| ISBN | 13-digit, hyphens included, string | 978-1-56592-479-6 |
| Non Book UPC | string | 012345678905 |
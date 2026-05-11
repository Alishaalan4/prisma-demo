CREATE OR REPLACE VIEW "popular_books" AS
SELECT
  b.id,
  b.title,
  AVG(r.rating)::double precision AS avg_rating,
  COUNT(r.id)::integer AS review_count
FROM "Book" b
JOIN "Review" r ON r."bookId" = b.id
GROUP BY b.id, b.title
HAVING AVG(r.rating) > 4;

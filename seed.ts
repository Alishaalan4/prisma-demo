import { faker } from "@faker-js/faker";

import { prisma } from "./lib/prisma";

async function main() {
  faker.seed(42);

  // Keep seed deterministic and rerunnable.
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  const publishers = await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.publisher.create({
        data: {
          name: `${faker.company.name()} Publishing ${i + 1}`,
        },
      }),
    ),
  );

  const genres = await Promise.all(
    ["Fiction", "History", "Science", "Fantasy", "Biography"].map((name) =>
      prisma.genre.create({
        data: { name },
      }),
    ),
  );

  const authors = await Promise.all(
    Array.from({ length: 4 }).map((_, i) =>
      prisma.author.create({
        data: {
          name: faker.person.fullName(),
          email: `author${i + 1}@example.com`,
        },
      }),
    ),
  );

  const users = await Promise.all(
    Array.from({ length: 8 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: `reader${i + 1}@example.com`,
        },
      }),
    ),
  );

  const books = [];
  for (let i = 0; i < 12; i++) {
    const author = faker.helpers.arrayElement(authors);
    const publisher = faker.helpers.arrayElement(publishers);
    const selectedGenres = faker.helpers.arrayElements(
      genres,
      faker.number.int({ min: 1, max: 3 }),
    );

    const book = await prisma.book.create({
      data: {
        title: faker.book.title(),
        authorId: author.id,
        publisherId: publisher.id,
        genres: {
          connect: selectedGenres.map((genre) => ({ id: genre.id })),
        },
      },
      include: { genres: true },
    });

    books.push(book);
  }

  for (const book of books) {
    const reviewCount = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < reviewCount; i++) {
      const user = faker.helpers.arrayElement(users);
      await prisma.review.create({
        data: {
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentence(),
          bookId: book.id,
          userId: user.id,
        },
      });
    }
  }

  console.log(
    `Seeded ${publishers.length} publishers, ${genres.length} genres, ${authors.length} authors, ${users.length} users, ${books.length} books.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

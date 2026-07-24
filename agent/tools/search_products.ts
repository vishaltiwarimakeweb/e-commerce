import { defineTool } from "eve/tools";
import { z } from "zod";
import { getProducts } from "@/lib/products";

// Wraps the same getProducts() service the catalog page and /api/products use,
// so the assistant only ever sees real, active products from the database.
export default defineTool({
  description:
    "Search the store's product catalog by keyword, category, and/or price range. " +
    "Returns matching products (title, description, price, category, tags, rating, stock) " +
    "so the assistant can recommend, compare, or answer questions about them. " +
    "Never invent products or prices — always call this tool first.",
  inputSchema: z.object({
    query: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Free-text search matched against product titles, e.g. 'running shoes'."),
    category: z.string().trim().min(1).optional().describe("Exact product category to filter by."),
    minPrice: z.number().min(0).optional().describe("Minimum price in US dollars (not cents)."),
    maxPrice: z.number().min(0).optional().describe("Maximum price in US dollars (not cents)."),
  }),
  async execute({ query, category, minPrice, maxPrice }) {
    const result = await getProducts({
      q: query,
      category,
      // The catalog stores prices as integer cents; the model reasons in dollars.
      minPrice: minPrice !== undefined ? Math.round(minPrice * 100) : undefined,
      maxPrice: maxPrice !== undefined ? Math.round(maxPrice * 100) : undefined,
      tags: undefined,
      sort: "newest",
      page: 1,
      limit: 10,
    });

    return {
      total: result.total,
      products: result.products.map((product) => ({
        id: product._id,
        title: product.title,
        description: product.shortDescription,
        price: Math.round(product.price) / 100,
        category: product.category,
        tags: product.tags,
        rating: product.ratingAverage,
        ratingCount: product.ratingCount,
        inStock: product.stock > 0,
      })),
    };
  },
});

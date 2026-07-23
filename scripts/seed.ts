// Dev-only dummy data for the Phase 1 catalog. Run with `npm run seed`.
// Images are placeholders (picsum.photos) so this never needs real Cloudinary
// credentials — real product photo uploads arrive with the Phase 6 admin panel.
import { connectToDatabase } from "../src/lib/db";
import { Product } from "../src/models/Product";

interface SeedProduct {
  title: string;
  shortDescription: string;
  description: string;
  price: number; // cents
  tags: string[];
  stock: number;
}

const CATALOG: Record<string, SeedProduct[]> = {
  Electronics: [
    {
      title: "Wireless Bluetooth Headphones",
      shortDescription: "Over-ear headphones with 30-hour battery life.",
      description:
        "Immerse yourself in rich, balanced sound with these over-ear Bluetooth headphones. Active noise cancellation, plush memory-foam ear cups, and a 30-hour battery make them ideal for daily commutes and long flights.",
      price: 7999,
      tags: ["audio", "wireless", "bluetooth"],
      stock: 42,
    },
    {
      title: "4K Action Camera",
      shortDescription: "Waterproof action camera with image stabilization.",
      description:
        "Capture every adventure in crisp 4K resolution. Waterproof up to 10m without a housing, with built-in electronic image stabilization and a wide-angle lens for immersive footage.",
      price: 12999,
      tags: ["camera", "outdoor", "4k"],
      stock: 18,
    },
    {
      title: "Smart Fitness Watch",
      shortDescription: "Track workouts, sleep, and heart rate all day.",
      description:
        "A lightweight fitness watch with continuous heart-rate monitoring, sleep tracking, and 20+ workout modes. Syncs with your phone for notifications and a full week of battery life.",
      price: 8999,
      tags: ["wearable", "fitness", "smart"],
      stock: 35,
    },
    {
      title: "Portable Power Bank 20000mAh",
      shortDescription: "Fast-charge two devices at once, pocket-sized.",
      description:
        "Never run out of battery on the go. This 20000mAh power bank charges two devices simultaneously with USB-C PD fast charging, and slips easily into a bag or pocket.",
      price: 3499,
      tags: ["charging", "travel", "power-bank"],
      stock: 60,
    },
    {
      title: "Noise-Cancelling Earbuds",
      shortDescription: "True wireless earbuds with a compact charging case.",
      description:
        "Compact true wireless earbuds with active noise cancellation, IPX4 sweat resistance, and a charging case good for an extra 24 hours of listening time.",
      price: 5999,
      tags: ["audio", "wireless", "earbuds"],
      stock: 50,
    },
  ],
  Clothing: [
    {
      title: "Classic Denim Jacket",
      shortDescription: "Timeless mid-wash denim jacket, unisex fit.",
      description:
        "A wardrobe staple cut from heavyweight, mid-wash denim. Button-front closure, chest pockets, and a relaxed unisex fit that layers well in every season.",
      price: 6499,
      tags: ["denim", "jacket", "outerwear"],
      stock: 28,
    },
    {
      title: "Organic Cotton T-Shirt",
      shortDescription: "Breathable everyday tee in 100% organic cotton.",
      description:
        "Soft, breathable, and built to last. This crew-neck tee is cut from 100% organic cotton and pre-shrunk for a fit that stays true wash after wash.",
      price: 1999,
      tags: ["cotton", "basics", "t-shirt"],
      stock: 90,
    },
    {
      title: "Slim Fit Chinos",
      shortDescription: "Stretch-cotton chinos for work or weekends.",
      description:
        "Tailored slim-fit chinos with a touch of stretch for all-day comfort. Sits at the natural waist with a clean, versatile silhouette that pairs with everything.",
      price: 4499,
      tags: ["chinos", "pants", "casual"],
      stock: 40,
    },
    {
      title: "Merino Wool Sweater",
      shortDescription: "Lightweight crew-neck sweater, naturally warm.",
      description:
        "Fine-gauge merino wool keeps you warm without the bulk. Naturally moisture-wicking and breathable, this crew-neck layers effortlessly under a jacket.",
      price: 8499,
      tags: ["wool", "sweater", "winter"],
      stock: 22,
    },
    {
      title: "Running Sneakers",
      shortDescription: "Lightweight trainers with responsive cushioning.",
      description:
        "Engineered mesh uppers keep feet cool while a responsive foam midsole absorbs impact mile after mile. Built for daily training and everyday wear alike.",
      price: 7499,
      tags: ["shoes", "running", "sneakers"],
      stock: 33,
    },
  ],
  "Home & Kitchen": [
    {
      title: "Stainless Steel French Press",
      shortDescription: "Double-walled press for rich, full-bodied coffee.",
      description:
        "Brew barista-quality coffee at home with this double-walled stainless steel French press. Keeps coffee hot longer and is virtually unbreakable compared to glass.",
      price: 3999,
      tags: ["coffee", "kitchen", "stainless-steel"],
      stock: 45,
    },
    {
      title: "Non-Stick Frying Pan Set",
      shortDescription: "3-piece ceramic-coated non-stick cookware set.",
      description:
        "A 3-piece set of ceramic-coated frying pans that heat evenly and release food effortlessly. PFOA-free coating and comfortable stay-cool handles.",
      price: 5999,
      tags: ["cookware", "kitchen", "non-stick"],
      stock: 30,
    },
    {
      title: "Ceramic Dinnerware Set",
      shortDescription: "16-piece set for everyday dining, service for 4.",
      description:
        "A complete 16-piece stoneware dinnerware set with dinner plates, salad plates, bowls, and mugs. Microwave, oven, and dishwasher safe.",
      price: 8999,
      tags: ["dinnerware", "kitchen", "ceramic"],
      stock: 20,
    },
    {
      title: "Cordless Stick Vacuum",
      shortDescription: "Lightweight vacuum with 40 minutes of runtime.",
      description:
        "A lightweight cordless stick vacuum with powerful suction and up to 40 minutes of runtime. Converts to a handheld for quick clean-ups.",
      price: 15999,
      tags: ["vacuum", "cleaning", "cordless"],
      stock: 15,
    },
    {
      title: "Aromatherapy Diffuser",
      shortDescription: "Ultrasonic diffuser with 7-color ambient light.",
      description:
        "Fill any room with your favorite essential oil scent. Whisper-quiet ultrasonic mist, a 7-color ambient light ring, and auto shut-off when water runs low.",
      price: 2999,
      tags: ["home", "diffuser", "relaxation"],
      stock: 55,
    },
  ],
  Books: [
    {
      title: "The Art of Clean Code",
      shortDescription: "A practical guide to writing maintainable software.",
      description:
        "A practical, example-driven guide to writing code that's easy to read, test, and maintain — for developers at any experience level.",
      price: 2499,
      tags: ["programming", "software", "non-fiction"],
      stock: 70,
    },
    {
      title: "Atomic Habits",
      shortDescription: "A proven framework for building better habits.",
      description:
        "A step-by-step framework for building good habits and breaking bad ones, grounded in behavioral science and real-world case studies.",
      price: 1899,
      tags: ["self-help", "productivity", "non-fiction"],
      stock: 85,
    },
    {
      title: "A Brief History of Time",
      shortDescription: "An accessible journey through modern physics.",
      description:
        "A landmark work that makes the biggest questions in cosmology — from the Big Bang to black holes — accessible to any curious reader.",
      price: 1699,
      tags: ["science", "physics", "non-fiction"],
      stock: 40,
    },
    {
      title: "The Midnight Library",
      shortDescription: "A novel about the infinite lives we could live.",
      description:
        "Between life and death lies a library of infinite books, each one a different version of the life you could have lived. A moving novel about regret and possibility.",
      price: 1599,
      tags: ["fiction", "novel", "bestseller"],
      stock: 65,
    },
    {
      title: "Deep Work",
      shortDescription: "Rules for focused success in a distracted world.",
      description:
        "A compelling argument for the value of deep, focused work — and a practical guide to cultivating it amid constant digital distraction.",
      price: 2199,
      tags: ["productivity", "career", "non-fiction"],
      stock: 50,
    },
  ],
  Beauty: [
    {
      title: "Vitamin C Serum",
      shortDescription: "Brightening antioxidant serum for daily use.",
      description:
        "A lightweight, fast-absorbing serum with 15% vitamin C to brighten skin tone, fade dark spots, and defend against environmental damage.",
      price: 2899,
      tags: ["skincare", "serum", "vitamin-c"],
      stock: 60,
    },
    {
      title: "Hydrating Face Moisturizer",
      shortDescription: "Lightweight daily moisturizer with hyaluronic acid.",
      description:
        "A fast-absorbing daily moisturizer with hyaluronic acid and ceramides to lock in hydration without leaving a greasy residue.",
      price: 2299,
      tags: ["skincare", "moisturizer", "hydrating"],
      stock: 58,
    },
    {
      title: "Matte Liquid Lipstick",
      shortDescription: "Long-wear matte lipstick in a universal red.",
      description:
        "A weightless, transfer-resistant liquid lipstick that dries down to a soft matte finish and lasts through meals and coffee alike.",
      price: 1499,
      tags: ["makeup", "lipstick", "matte"],
      stock: 75,
    },
    {
      title: "Argan Oil Hair Mask",
      shortDescription: "Deep-conditioning mask for dry, damaged hair.",
      description:
        "A rich, deep-conditioning hair mask infused with argan oil to restore softness and shine to dry, damaged, or color-treated hair.",
      price: 1999,
      tags: ["haircare", "mask", "argan-oil"],
      stock: 48,
    },
    {
      title: "Mineral Sunscreen SPF50",
      shortDescription: "Broad-spectrum mineral sunscreen, no white cast.",
      description:
        "A broad-spectrum SPF50 mineral sunscreen formulated to blend in clear on every skin tone, with zinc oxide as the active ingredient.",
      price: 2599,
      tags: ["skincare", "sunscreen", "spf"],
      stock: 66,
    },
  ],
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seed() {
  await connectToDatabase();

  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    console.log(`Clearing ${existingCount} existing product(s)…`);
    await Product.deleteMany({});
  }

  const documents = Object.entries(CATALOG).flatMap(([category, items]) =>
    items.map((item) => ({
      ...item,
      category,
      images: [`https://picsum.photos/seed/${slugify(item.title)}/800/800`],
    })),
  );

  await Product.insertMany(documents);
  console.log(`Seeded ${documents.length} products across ${Object.keys(CATALOG).length} categories.`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

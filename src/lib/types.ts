export type Page =
  | "dashboard"
  | "order"
  | "detail"
  | "favorites"
  | "history"
  | "checkout"
  | "tracking"
  | "wallet"
  | "settings";

export type Food = {
  id: number;
  name: string;
  restaurant: string;
  category: string;
  price: number;
  originalPrice?: number;
  time: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  discount?: string;
  description: string;
  ingredients: string[];
};

export type CartItem = {
  food: Food;
  qty: number;
  size: string;
  extras: string[];
};

export const dishes: Food[] = [
  {
    id: 1,
    name: "Classic Truffle Burger",
    restaurant: "The Burger Joint",
    category: "American · Burgers · Fast Food",
    price: 12.99,
    originalPrice: 16.99,
    time: "20–30 min",
    rating: 4.8,
    reviews: 2840,
    image:
      "https://images.unsplash.com/photo-1585238341710-4d3ff484184d?w=600&h=400&fit=crop&auto=format",
    badge: "Best Seller",
    discount: "20%",
    description:
      "Indulge in our signature Wagyu beef patty, perfectly seared and topped with melted aged cheddar, crisp local greens, and house-made truffle aioli on a toasted brioche bun.",
    ingredients: ["Wagyu Beef", "Aged Cheddar", "Brioche Bun", "Truffle Oil", "Crisp Lettuce"],
  },
  {
    id: 2,
    name: "Bella Napoli Margherita",
    restaurant: "Bella Napoli Pizza",
    category: "Italian · Pizza · Authentic",
    price: 18.5,
    time: "35–45 min",
    rating: 4.9,
    reviews: 3120,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop&auto=format",
    badge: "Top Rated",
    description:
      "Authentic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella di bufala, and fragrant basil, baked in our wood-fired oven at 900°F.",
    ingredients: ["San Marzano Tomatoes", "Mozzarella di Bufala", "Fresh Basil", "Olive Oil", "Sea Salt"],
  },
  {
    id: 3,
    name: "Salmon Poke Bowl",
    restaurant: "Okinawa Sushi & Poke",
    category: "Japanese · Poke · Healthy",
    price: 15.2,
    time: "25–40 min",
    rating: 4.7,
    reviews: 1876,
    image:
      "https://images.unsplash.com/photo-1580442151529-343f2f6e0e27?w=600&h=400&fit=crop&auto=format",
    description:
      "Fresh Atlantic salmon over seasoned sushi rice, topped with edamame, cucumber, avocado, pickled ginger, and our signature yuzu ponzu sauce.",
    ingredients: ["Atlantic Salmon", "Sushi Rice", "Avocado", "Edamame", "Yuzu Ponzu"],
  },
  {
    id: 4,
    name: "Spicy Tonkotsu Ramen",
    restaurant: "Thai Spice Kitchen",
    category: "Japanese · Ramen · Comfort Food",
    price: 14.5,
    time: "30–45 min",
    rating: 4.6,
    reviews: 2103,
    image:
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=600&h=400&fit=crop&auto=format",
    badge: "Spicy 🌶",
    description:
      "Rich pork bone broth simmered for 18 hours, served with tender chashu pork, soft-boiled egg, nori, bamboo shoots, and green onion.",
    ingredients: ["Pork Broth", "Chashu Pork", "Ramen Noodles", "Soft-boiled Egg", "Nori"],
  },
  {
    id: 5,
    name: "Crispy Chicken Wings",
    restaurant: "Wing Master",
    category: "American · Chicken · Fast Food",
    price: 9.99,
    originalPrice: 12.99,
    time: "15–25 min",
    rating: 4.5,
    reviews: 1520,
    image:
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop&auto=format",
    badge: "Hot Deal",
    discount: "25%",
    description:
      "Double-fried crispy chicken wings tossed in your choice of signature sauces. Served with celery sticks and ranch dip.",
    ingredients: ["Chicken Wings", "Secret Spice Rub", "Ranch Dip", "Celery"],
  },
  {
    id: 6,
    name: "Avocado Toast Deluxe",
    restaurant: "Green Bowl Cafe",
    category: "Healthy · Breakfast · Vegetarian",
    price: 8.5,
    time: "10–20 min",
    rating: 4.7,
    reviews: 980,
    image:
      "https://images.unsplash.com/photo-1588137372308-15f75323ca8d?w=600&h=400&fit=crop&auto=format",
    badge: "Healthy",
    description:
      "Smashed avocado on artisan sourdough with poached egg, cherry tomatoes, feta, and a drizzle of chili oil.",
    ingredients: ["Avocado", "Sourdough", "Poached Egg", "Feta", "Chili Oil"],
  },
];

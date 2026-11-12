import { MenuItem, RestaurantInfo, Order } from '../types.js';

export const INITIAL_RESTAURANT_INFO: RestaurantInfo = {
  name: "The Rustic Table & Kitchen",
  tagline: "Artisanal Wood-Fired & Chef Curated Dining",
  currency: "$",
  taxRatePercent: 5,
  tables: [
    "Table 1",
    "Table 2",
    "Table 3",
    "Table 4",
    "Table 5",
    "Table 6",
    "Table 7",
    "Table 8",
    "Table 9",
    "Table 10",
    "VIP Booth A",
    "VIP Booth B",
    "Takeaway Counter"
  ]
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: "item-1",
    name: "Wood-Fired Neapolitan Margherita",
    description: "San Marzano tomatoes, fresh buffalo mozzarella, hand-picked garden basil, and extra virgin olive oil on fermented sourdough crust.",
    price: 14.50,
    category: "Main Course",
    dietary: "veg",
    isGlutenFree: false,
    inStock: true,
    image: "/src/assets/images/hero_margherita_pizza_1794475990752.jpg",
    prepTimeMinutes: 12,
    calories: 680,
    isChefSpecial: true
  },
  {
    id: "item-2",
    name: "Artisan Wagyu Smash Burger",
    description: "Double 100% Wagyu beef patties smashed crisp, double melted sharp cheddar, caramelized shallots, house secret sauce, toasted brioche.",
    price: 16.75,
    category: "Main Course",
    dietary: "non-veg",
    isGlutenFree: false,
    inStock: true,
    image: "/src/assets/images/food_gourmet_burger_1794475990605.jpg",
    prepTimeMinutes: 15,
    calories: 820,
    isChefSpecial: true
  },
  {
    id: "item-3",
    name: "Crispy Herb Garden Tempura",
    description: "Fluffy spiced cauliflower and seasonal garden vegetables flash-fried with fresh mint chutney, roasted cumin, and sea salt flakes.",
    price: 9.50,
    category: "Starters",
    dietary: "vegan",
    isGlutenFree: true,
    isSpicy: true,
    inStock: true,
    image: "/src/assets/images/food_crispy_appetizer_1794475991473.jpg",
    prepTimeMinutes: 8,
    calories: 340
  },
  {
    id: "item-4",
    name: "Molten Belgian Chocolate Lava",
    description: "Warm 70% dark chocolate cake with an oozing liquid center, accompanied by Madagascar vanilla bean gelato and fresh raspberries.",
    price: 8.50,
    category: "Desserts",
    dietary: "veg",
    isGlutenFree: false,
    inStock: true,
    image: "/src/assets/images/food_molten_dessert_1794475991251.jpg",
    prepTimeMinutes: 10,
    calories: 520,
    isChefSpecial: true
  },
  {
    id: "item-5",
    name: "Ruby Pomegranate & Mint Fizz",
    description: "Pressed pomegranate nectar, fresh crushed spearmint, Persian lime reduction, and effervescent soda over hand-carved ice.",
    price: 6.25,
    category: "Beverages",
    dietary: "vegan",
    isGlutenFree: true,
    inStock: true,
    image: "/src/assets/images/food_craft_beverage_1794475991823.jpg",
    prepTimeMinutes: 4,
    calories: 140
  },
  {
    id: "item-6",
    name: "Truffle Parmesan Hand-Cut Fries",
    description: "Crispy Idaho russet potatoes tossed in black winter truffle oil, aged Parmigiano Reggiano, and fresh thyme with roasted garlic aioli.",
    price: 7.75,
    category: "Starters",
    dietary: "veg",
    isGlutenFree: true,
    inStock: true,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 7,
    calories: 410
  },
  {
    id: "item-7",
    name: "Smoked Chicken Quesadilla",
    description: "Hickory-smoked pulled chicken breast, charred poblano peppers, Oaxaca cheese blend, served with guacamole and pico de gallo.",
    price: 13.50,
    category: "Starters",
    dietary: "non-veg",
    isGlutenFree: false,
    isSpicy: true,
    inStock: true,
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 12,
    calories: 620
  },
  {
    id: "item-8",
    name: "Creamy Wild Forest Mushroom Risotto",
    description: "Carnaroli rice slow-simmered in vegetable broth with cremini and chanterelle mushrooms, white truffle butter, and aged parmesan crisp.",
    price: 15.25,
    category: "Main Course",
    dietary: "veg",
    isGlutenFree: true,
    inStock: true,
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 18,
    calories: 590
  },
  {
    id: "item-9",
    name: "Slow-Cooked Butter Chicken Bowl",
    description: "Tender tandoori chicken tikka pieces in a velvety rich tomato-cashew butter sauce, served with fragrant basmati rice and warm garlic butter naan.",
    price: 17.50,
    category: "Main Course",
    dietary: "non-veg",
    isGlutenFree: false,
    inStock: true,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 16,
    calories: 780,
    isChefSpecial: true
  },
  {
    id: "item-10",
    name: "Cold Brew Espresso Vanilla Tonic",
    description: "18-hour single origin Ethiopian cold brew steeped smooth, infused with Madagascar vanilla syrup, tonic water, and orange peel oil.",
    price: 5.50,
    category: "Beverages",
    dietary: "vegan",
    isGlutenFree: true,
    inStock: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 3,
    calories: 85
  },
  {
    id: "item-11",
    name: "Classic Masala Chai & Spiced Cookies",
    description: "Slow-brewed Assam CTC black tea with crushed cardamom, fresh ginger, cinnamon, and whole milk, paired with traditional cumin butter cookies.",
    price: 4.75,
    category: "Beverages",
    dietary: "veg",
    isGlutenFree: false,
    inStock: true,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 5,
    calories: 120
  },
  {
    id: "item-12",
    name: "Mango Passionfruit Panna Cotta",
    description: "Silky vanilla bean panna cotta crowned with Alphonso mango compote, fresh passionfruit seeds, and micro mint garnish.",
    price: 7.95,
    category: "Desserts",
    dietary: "veg",
    isGlutenFree: true,
    inStock: true,
    image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80",
    prepTimeMinutes: 5,
    calories: 380
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-101",
    tableNumber: "Table 4",
    items: [
      {
        menuItemId: "item-1",
        name: "Wood-Fired Neapolitan Margherita",
        price: 14.50,
        quantity: 1,
        notes: "Well-done crust please",
        dietary: "veg"
      },
      {
        menuItemId: "item-5",
        name: "Ruby Pomegranate & Mint Fizz",
        price: 6.25,
        quantity: 2,
        notes: "Less ice",
        dietary: "vegan"
      }
    ],
    subtotal: 27.00,
    taxAmount: 1.35,
    totalAmount: 28.35,
    status: "preparing",
    specialInstructions: "Please serve beverages first",
    customerName: "Alex M.",
    paymentStatus: "paid_upi",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedTimeMinutes: 15
  },
  {
    id: "ord-102",
    orderNumber: "ORD-102",
    tableNumber: "Table 2",
    items: [
      {
        menuItemId: "item-2",
        name: "Artisan Wagyu Smash Burger",
        price: 16.75,
        quantity: 2,
        notes: "No onions on one burger",
        dietary: "non-veg"
      },
      {
        menuItemId: "item-6",
        name: "Truffle Parmesan Hand-Cut Fries",
        price: 7.75,
        quantity: 1,
        dietary: "veg"
      }
    ],
    subtotal: 41.25,
    taxAmount: 2.06,
    totalAmount: 43.31,
    status: "pending",
    specialInstructions: "Extra garlic aioli dip on the side",
    customerName: "Sophia",
    paymentStatus: "paid_counter",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedTimeMinutes: 18
  },
  {
    id: "ord-103",
    orderNumber: "ORD-103",
    tableNumber: "VIP Booth A",
    items: [
      {
        menuItemId: "item-9",
        name: "Slow-Cooked Butter Chicken Bowl",
        price: 17.50,
        quantity: 2,
        notes: "Mild spice level",
        dietary: "non-veg"
      },
      {
        menuItemId: "item-4",
        name: "Molten Belgian Chocolate Lava",
        price: 8.50,
        quantity: 2,
        dietary: "veg"
      }
    ],
    subtotal: 52.00,
    taxAmount: 2.60,
    totalAmount: 54.60,
    status: "ready",
    customerName: "David",
    paymentStatus: "paid_card",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    estimatedTimeMinutes: 20
  }
];

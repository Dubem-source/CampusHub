export interface MarketplaceItem {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  title: string;
  price: number;
  category: 'Electronics' | 'Furniture' | 'Kitchen' | 'Books' | 'Other';
  area: string;
  condition: 'New' | 'Gently Used' | 'Fair';
  description?: string;
  photos: string[];
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
  views?: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  service_type: 'Cleaning' | 'Electrical' | 'Plumbing' | 'Laundry' | 'Solar Installation' | 'Tutoring' | 'Other';
  phone: string;
  whatsapp?: string;
  area: string;
  description: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
}

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: "item-1",
    seller_id: "stu2",
    seller_name: "Kelechi Nwachukwu",
    seller_phone: "08034567890",
    title: "MacBook Pro 13-inch (2019)",
    price: 350000,
    category: "Electronics",
    condition: "Gently Used",
    area: "Eziobodo",
    description: "Good working condition, 8GB RAM, 256GB SSD. Battery cycle count 320. Includes original charger.",
    photos: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"],
    status: "active",
    created_at: "2026-07-01T10:00:00Z",
    views: 45
  },
  {
    id: "item-2",
    seller_id: "stu3",
    seller_name: "Favour Benson",
    seller_phone: "08122334455",
    title: "Wooden Study Desk & Ergonomic Chair",
    price: 25000,
    category: "Furniture",
    condition: "New",
    area: "Ihiagwa",
    description: "Brand new solid wood study table and comfortable black mesh office chair. Perfect for study sessions.",
    photos: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80"],
    status: "active",
    created_at: "2026-07-02T14:30:00Z",
    views: 12
  },
  {
    id: "item-3",
    seller_id: "stu1", // Current student (Chiamaka Okafor)
    seller_name: "Chiamaka Okafor",
    seller_phone: "08012345678",
    title: "Rechargeable Standing Fan",
    price: 18000,
    category: "Electronics",
    condition: "Fair",
    area: "FUTO Back Gate",
    description: "Lontor rechargeable fan. Working perfectly on electricity, battery lasts around 3 hours on high speed.",
    photos: ["https://images.unsplash.com/photo-1618944847023-38aa001235f0?auto=format&fit=crop&w=400&q=80"],
    status: "active",
    created_at: "2026-07-03T09:15:00Z",
    views: 28
  },
  {
    id: "item-4",
    seller_id: "stu4",
    seller_name: "Emeka Obi",
    seller_phone: "09012345678",
    title: "Essential Physics & Calculus textbooks",
    price: 6000,
    category: "Books",
    condition: "Gently Used",
    area: "Umuchima",
    description: "Standard FUTO year 1 & 2 engineering textbooks. Clean pages, no drawings/markings.",
    photos: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80"],
    status: "active",
    created_at: "2026-07-04T11:00:00Z",
    views: 9
  }
];

export const MOCK_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: "provider-1",
    name: "Chinedu Plumbing Services",
    service_type: "Plumbing",
    phone: "08034567891",
    whatsapp: "08034567891",
    area: "Eziobodo & Ihiagwa",
    description: "Expert plumbing repairs, piping, water pump installation, and soakaway maintenance. 24/7 emergency student response.",
    photo_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: "2026-06-20T08:00:00Z"
  },
  {
    id: "provider-2",
    name: "FUTO Laundry Hub",
    service_type: "Laundry",
    phone: "08122334455",
    whatsapp: "08122334455",
    area: "All areas (Ihiagwa, Eziobodo, Umuchima)",
    description: "Wash, starch, dry, and iron clothes. Free pick-up and delivery inside and around FUTO lodges.",
    photo_url: "https://images.unsplash.com/photo-1545173168-9f1947eebd01?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: "2026-06-22T09:00:00Z"
  },
  {
    id: "provider-3",
    name: "Amara Cleaning Agency",
    service_type: "Cleaning",
    phone: "09087654321",
    whatsapp: "09087654321",
    area: "All areas served",
    description: "Deep lodge cleaning, post-construction cleanup, move-in/move-out lodge disinfection. Standard and premium packages available.",
    photo_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: "2026-06-25T11:00:00Z"
  },
  {
    id: "provider-4",
    name: "Oluwaseun Solar & Electricals",
    service_type: "Electrical",
    phone: "08055544433",
    whatsapp: "08055544433",
    area: "Eziobodo",
    description: "Lodge wiring, inverter setups, prepaid meter issues, solar panel installation, and generator servicing.",
    photo_url: "https://images.unsplash.com/photo-1620038634444-2428512217c4?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: "2026-06-28T14:00:00Z"
  }
];

// Helper Functions
export function getMarketplaceItems(): MarketplaceItem[] {
  if (typeof window === "undefined") return MOCK_MARKETPLACE_ITEMS;
  const saved = localStorage.getItem("marketplace_items");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse marketplace_items", e);
    }
  }
  // Initialize if not present
  localStorage.setItem("marketplace_items", JSON.stringify(MOCK_MARKETPLACE_ITEMS));
  return MOCK_MARKETPLACE_ITEMS;
}

export function saveMarketplaceItems(items: MarketplaceItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("marketplace_items", JSON.stringify(items));
  window.dispatchEvent(new Event("marketplace-items-updated"));
}

export function getServiceProviders(): ServiceProvider[] {
  if (typeof window === "undefined") return MOCK_SERVICE_PROVIDERS;
  const saved = localStorage.getItem("service_providers");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse service_providers", e);
    }
  }
  // Initialize if not present
  localStorage.setItem("service_providers", JSON.stringify(MOCK_SERVICE_PROVIDERS));
  return MOCK_SERVICE_PROVIDERS;
}

export function saveServiceProviders(providers: ServiceProvider[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("service_providers", JSON.stringify(providers));
  window.dispatchEvent(new Event("service-providers-updated"));
}

export interface ServiceApplication {
  id: string;
  name: string;
  service_type: 'Cleaning' | 'Electrical' | 'Plumbing' | 'Laundry' | 'Solar Installation' | 'Tutoring' | 'Other';
  phone: string;
  whatsapp?: string;
  area: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const MOCK_SERVICE_APPLICATIONS: ServiceApplication[] = [
  {
    id: "app-1",
    name: "Emeka AC Repairs",
    service_type: "Electrical",
    phone: "08012345678",
    whatsapp: "08012345678",
    area: "Ihiagwa",
    description: "I fix air conditioners and cooling units for student lodges.",
    status: "pending",
    created_at: "2026-07-04T12:00:00Z"
  }
];

export function getServiceApplications(): ServiceApplication[] {
  if (typeof window === "undefined") return MOCK_SERVICE_APPLICATIONS;
  const saved = localStorage.getItem("service_applications");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse service_applications", e);
    }
  }
  localStorage.setItem("service_applications", JSON.stringify(MOCK_SERVICE_APPLICATIONS));
  return MOCK_SERVICE_APPLICATIONS;
}

export function saveServiceApplications(apps: ServiceApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("service_applications", JSON.stringify(apps));
  window.dispatchEvent(new Event("service-applications-updated"));
}


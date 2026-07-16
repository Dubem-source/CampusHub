// ─── Types ────────────────────────────────────────────────────────────────────
// These are shared across the app. All data is fetched from Firestore — no
// hardcoded arrays live in this file.

export type Agent = {
  id: string;
  name: string;
  photo: string;
  phone: string;
  verified: boolean;
  responseTime: string;
  joinedDate?: string;
};

export type RoomUnit = {
  id: string;
  lodgeSlug: string;
  agentId: string;
  roomType: string;
  price: number;
  entryPrice: number;
  availability: "available" | "pending" | "rented";
  area: string;
  rating: number;
  photos: string[];
  amenities: string[];
  viewsCount?: number;
  dateListed?: string;
  description?: string;
};

export type Lodge = {
  slug: string;
  name: string;
  area: string;
  landmark: string;
  agentId: string;
  agentName: string;
  agentPhoto: string;
  agentPhone: string;
  rating: number;
  roomsCount: number;
  buildingAmenities: string[];
  isOfficial?: boolean;
};

export type Review = {
  studentName: string;
  date: string;
  water: number;
  electricity: number;
  security: number;
  text: string;
  tenantType: "verified_tenant" | "prospective_tenant";
};

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppLink(agentPhone: string, lodgeName: string, roomType: string) {
  const message = `Hello, I saw ${roomType} at ${lodgeName} on CampusHub and I want to book an inspection.`;
  return `https://wa.me/${agentPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function getReviewSummary(reviews: Review[]) {
  if (!reviews.length) {
    return { average: 0, water: 0, electricity: 0, security: 0, count: 0 };
  }

  const totals = reviews.reduce(
    (acc, r) => {
      acc.water += r.water;
      acc.electricity += r.electricity;
      acc.security += r.security;
      return acc;
    },
    { water: 0, electricity: 0, security: 0 },
  );

  return {
    average: Number(
      ((totals.water + totals.electricity + totals.security) / (reviews.length * 3)).toFixed(1),
    ),
    water: Number((totals.water / reviews.length).toFixed(1)),
    electricity: Number((totals.electricity / reviews.length).toFixed(1)),
    security: Number((totals.security / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}

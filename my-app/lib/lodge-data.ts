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

export const areas = ["All", "Ihiagwa", "Eziobodo", "FUTO", "Umuchima"] as const;

export const agents: Agent[] = [
  {
    id: "agent-official",
    name: "CampusHub Official",
    photo: "/image/Campus-Hub.png",
    phone: "+2348000000000",
    verified: true,
    responseTime: "Replies instantly",
    joinedDate: "Dec 2025",
  },
  {
    id: "daniel",
    name: "Daniel Peters",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel",
    phone: "+2348055566677",
    verified: true,
    responseTime: "Replies within 5 mins",
    joinedDate: "Feb 2026",
  },
  {
    id: "agent-chiagozie",
    name: "Chiagozie Nwosu",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "+2348012345678",
    verified: true,
    responseTime: "Replies within 10 mins",
    joinedDate: "May 2026",
  },
  {
    id: "agent-adaeze",
    name: "Adaeze Okafor",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    phone: "+2348023456789",
    verified: true,
    responseTime: "Replies within 30 mins",
    joinedDate: "Apr 2026",
  },
  {
    id: "agent-emeka",
    name: "Emeka Uche",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    phone: "+2348034567890",
    verified: true,
    responseTime: "Replies within 1 hour",
    joinedDate: "Mar 2026",
  },
];

export const lodges: Lodge[] = [
  {
    slug: "ihiagwa-gardens",
    name: "Ihiagwa Gardens",
    area: "Ihiagwa",
    landmark: "Behind the new student gate",
    agentId: "agent-official",
    agentName: "CampusHub Official",
    agentPhoto: agents[0].photo,
    agentPhone: agents[0].phone,
    rating: 4.9,
    roomsCount: 2,
    buildingAmenities: ["Solar power", "Water", "Security", "Good road access"],
    isOfficial: true,
  },
  {
    slug: "eziobodo-suites",
    name: "Eziobodo Suites",
    area: "Eziobodo",
    landmark: "Close to the tarred road",
    agentId: "agent-adaeze",
    agentName: "Adaeze Okafor",
    agentPhoto: agents[3].photo,
    agentPhone: agents[3].phone,
    rating: 4.8,
    roomsCount: 2,
    buildingAmenities: ["Water", "Generator", "Parking", "Security"],
  },
  {
    slug: "campus-view",
    name: "Campus View",
    area: "FUTO",
    landmark: "Opposite the student center",
    agentId: "agent-emeka",
    agentName: "Emeka Uche",
    agentPhoto: agents[4].photo,
    agentPhone: agents[4].phone,
    rating: 4.7,
    roomsCount: 2,
    buildingAmenities: ["Solar power", "Water", "Lounge", "CCTV"],
  },
  {
    slug: "aladinma-terrace",
    name: "Aladinma Terrace",
    area: "Aladinma",
    landmark: "Near the junction after the market",
    agentId: "agent-chiagozie",
    agentName: "Chiagozie Nwosu",
    agentPhoto: agents[2].photo,
    agentPhone: agents[2].phone,
    rating: 4.6,
    roomsCount: 1,
    buildingAmenities: ["Water", "Security", "Parking", "Solar light"],
  },
];

export const roomUnits: RoomUnit[] = [
  {
    id: "room-ig-1",
    lodgeSlug: "ihiagwa-gardens",
    agentId: "agent-official",
    roomType: "Self-contain",
    price: 280000,
    entryPrice: 120000,
    availability: "available",
    area: "Ihiagwa",
    rating: 4.8,
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Pop ceiling", "Tiled floor"],
    viewsCount: 142,
    dateListed: "2026-06-18T10:00:00Z", // 1 day ago (assuming June 19, 2026)
  },
  {
    id: "room-ig-2",
    lodgeSlug: "ihiagwa-gardens",
    agentId: "agent-official",
    roomType: "Mini flat",
    price: 340000,
    entryPrice: 150000,
    availability: "available",
    area: "Ihiagwa",
    rating: 4.6,
    photos: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Kitchen space"],
    viewsCount: 89,
    dateListed: "2026-06-12T10:00:00Z", // 7 days ago (June 12, 2026) -> 1wk ago
  },
  {
    id: "room-es-1",
    lodgeSlug: "eziobodo-suites",
    agentId: "agent-adaeze",
    roomType: "Self-contain",
    price: 320000,
    entryPrice: 130000,
    availability: "available",
    area: "Eziobodo",
    rating: 4.9,
    photos: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Wardrobe"],
    viewsCount: 230,
    dateListed: "2026-06-15T10:00:00Z", // 4 days ago
  },
  {
    id: "room-es-2",
    lodgeSlug: "eziobodo-suites",
    agentId: "agent-adaeze",
    roomType: "Single room",
    price: 210000,
    entryPrice: 95000,
    availability: "available",
    area: "Eziobodo",
    rating: 4.7,
    photos: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Shared bathroom"],
    viewsCount: 64,
    dateListed: "2026-06-10T10:00:00Z", // 9 days ago -> Day & Month (e.g. 10 Jun)
  },
  {
    id: "room-cv-1",
    lodgeSlug: "campus-view",
    agentId: "agent-emeka",
    roomType: "Self-contain",
    price: 250000,
    entryPrice: 115000,
    availability: "available",
    area: "FUTO",
    rating: 4.7,
    photos: [
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Study desk"],
    viewsCount: 185,
    dateListed: "2026-06-19T08:00:00Z", // today
  },
  {
    id: "room-cv-2",
    lodgeSlug: "campus-view",
    agentId: "agent-emeka",
    roomType: "One-bedroom",
    price: 360000,
    entryPrice: 160000,
    availability: "available",
    area: "FUTO",
    rating: 4.5,
    photos: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Kitchen"],
    viewsCount: 110,
    dateListed: "2026-06-17T10:00:00Z", // 2 days ago
  },
  {
    id: "room-at-1",
    lodgeSlug: "aladinma-terrace",
    agentId: "agent-chiagozie",
    roomType: "Self-contain",
    price: 240000,
    entryPrice: 110000,
    availability: "available",
    area: "Aladinma",
    rating: 4.6,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
    ],
    amenities: ["Tiled room"],
    viewsCount: 95,
    dateListed: "2026-06-11T10:00:00Z", // 8 days ago -> 11 Jun
  },
];

export const lodgeReviews: Record<string, Review[]> = {
  "ihiagwa-gardens": [
    {
      studentName: "Blessing U.",
      date: "May 18, 2026",
      water: 5,
      electricity: 4,
      security: 5,
      text: "Very clean compound and the agent was transparent about the inspection. Water was steady.",
      tenantType: "verified_tenant",
    },
    {
      studentName: "Chukwuemeka A.",
      date: "May 10, 2026",
      water: 4,
      electricity: 4,
      security: 5,
      text: "Good option for students who want a calm environment close to campus.",
      tenantType: "prospective_tenant",
    },
  ],
  "eziobodo-suites": [
    {
      studentName: "Adaeze N.",
      date: "May 11, 2026",
      water: 4,
      electricity: 5,
      security: 4,
      text: "Solid build and the photos matched the actual room. Pricing was fair.",
      tenantType: "verified_tenant",
    },
  ],
  "campus-view": [
    {
      studentName: "Ifeanyi K.",
      date: "May 14, 2026",
      water: 4,
      electricity: 4,
      security: 4,
      text: "Nice for a quiet student lifestyle, especially if you want to stay very close to FUTO.",
      tenantType: "verified_tenant",
    },
  ],
  "aladinma-terrace": [
    {
      studentName: "Ngozi P.",
      date: "May 8, 2026",
      water: 4,
      electricity: 3,
      security: 5,
      text: "Security is strong and the agent responded quickly, but the power supply was average.",
      tenantType: "prospective_tenant",
    },
  ],
};

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getMergedData() {
  let mergedRoomUnits = [...roomUnits];
  let mergedLodges = [...lodges];
  let mergedAgents = [...agents];

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("agent_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const agentId = parsed.id || "agent1";
        const isSuspended = parsed.suspended === true;
        const isApproved = parsed.approved && parsed.verified;

        // Update agent details in merged list
        const agentIdx = mergedAgents.findIndex(a => a.id === agentId);
        const updatedAgent = {
          id: agentId,
          name: parsed.full_name || "Johnson Okonkwo",
          photo: parsed.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          phone: parsed.phone || "08012345678",
          verified: parsed.verified ?? false,
          responseTime: parsed.responseTime || "Replies within 5 mins",
          joinedDate: parsed.joinedDate || "Oct 2025",
          suspended: isSuspended,
        };

        if (agentIdx > -1) {
          mergedAgents[agentIdx] = updatedAgent;
        } else {
          mergedAgents.push(updatedAgent);
        }

        // Merge listings if approved and not suspended
        if (isApproved && !isSuspended) {
          const listings = parsed.listings || [];
          listings.forEach((listing: any) => {
            const slug = listing.building_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            
            // Check if roomUnit already exists in mock list to avoid duplicates
            if (!mergedRoomUnits.some(r => r.id === listing.id)) {
              mergedRoomUnits.push({
                id: listing.id,
                lodgeSlug: slug,
                agentId: agentId,
                roomType: listing.room_type,
                price: Number(listing.price),
                entryPrice: Number(listing.entryPrice),
                availability: listing.availability,
                area: listing.area,
                rating: 4.5,
                photos: listing.photos,
                amenities: listing.amenities,
                viewsCount: listing.viewsCount || 0,
                dateListed: listing.created_at ? `${listing.created_at}T10:00:00Z` : new Date().toISOString(),
                description: listing.description || "",
              });
            }

            // Check if lodge already exists
            if (!mergedLodges.some(l => l.slug === slug)) {
              mergedLodges.push({
                slug: slug,
                name: listing.building_name,
                area: listing.area,
                landmark: listing.landmark,
                agentId: agentId,
                agentName: parsed.full_name || "Johnson Okonkwo",
                agentPhoto: parsed.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                agentPhone: parsed.phone || "08012345678",
                rating: 4.5,
                roomsCount: 1,
                buildingAmenities: listing.amenities,
                isOfficial: agentId === 'agent-official',
              });
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse agent_data in getMergedData:", e);
      }
    }
  }

  return { roomUnits: mergedRoomUnits, lodges: mergedLodges, agents: mergedAgents };
}

export function getAllRoomUnits() {
  return getMergedData().roomUnits;
}

export function getLodgeBySlug(slug: string) {
  const { lodges } = getMergedData();
  return lodges.find((lodge) => lodge.slug === slug) ?? null;
}

export function getAgentById(id: string) {
  const { agents } = getMergedData();
  return agents.find((agent) => agent.id === id) ?? null;
}

export function getAgentLodges(agentId: string) {
  const { lodges } = getMergedData();
  return lodges.filter((lodge) => lodge.agentId === agentId);
}

export function getLodgeRooms(slug: string) {
  const { roomUnits } = getMergedData();
  return roomUnits
    .filter((room) => room.lodgeSlug === slug)
    .sort((left, right) => left.price - right.price);
}

export function getRoomBySlugAndRoomId(slug: string, roomId: string) {
  const lodge = getLodgeBySlug(slug);
  if (!lodge) {
    return null;
  }

  const { roomUnits } = getMergedData();
  const room = roomUnits.find((unit) => unit.lodgeSlug === slug && unit.id === roomId) ?? null;
  return room ? { room, lodge } : null;
}

export function getRoomById(roomId: string) {
  const { roomUnits } = getMergedData();
  const room = roomUnits.find((unit) => unit.id === roomId) ?? null;
  if (!room) {
    return null;
  }

  const lodge = getLodgeBySlug(room.lodgeSlug);
  return lodge ? { room, lodge } : null;
}

export function getPrimaryRoomForLodge(slug: string) {
  return getLodgeRooms(slug)[0] ?? null;
}

export function getBrowseLodges() {
  const { roomUnits } = getMergedData();
  return roomUnits
    .map((room) => {
      const lodge = getLodgeBySlug(room.lodgeSlug);
      if (!lodge) return null;
      return {
        ...lodge,
        room, // Keep the full room object
        startingPrice: room.price,
      };
    })
    .filter((item): item is (Lodge & { room: RoomUnit; startingPrice: number }) => item !== null)
    .sort((left, right) => {
      if (left.isOfficial && !right.isOfficial) return -1;
      if (!left.isOfficial && right.isOfficial) return 1;
      return right.rating - left.rating;
    });
}

export function getOtherRooms(currentAgentId: string, currentRoomId: string, limit = 6) {
  const { roomUnits } = getMergedData();
  const currentRoom = roomUnits.find(r => r.id === currentRoomId);
  if (!currentRoom) return [];

  // Pool of available rooms from OTHER agents
  const pool = roomUnits.filter(
    (room) =>
      room.agentId !== currentAgentId &&
      room.availability === "available" &&
      room.id !== currentRoomId,
  );

  // Scoring based on similarity
  const scoredRooms = pool.map(room => {
    let score = 0;
    
    // 1. Same area (Priority 1)
    if (room.area === currentRoom.area) score += 100;
    
    // 2. Same room type (Priority 2)
    if (room.roomType === currentRoom.roomType) score += 50;
    
    // 3. Similar price range (+/- 30%) (Priority 3)
    const priceDiff = Math.abs(room.price - currentRoom.price);
    const priceThreshold = currentRoom.price * 0.3;
    if (priceDiff <= priceThreshold) score += 25;

    // Bonus for rating
    score += room.rating;

    return { room, score };
  });

  return scoredRooms
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ room }) => ({
      room,
      lodge: getLodgeBySlug(room.lodgeSlug),
    }))
    .filter((item): item is { room: RoomUnit; lodge: Lodge } => Boolean(item.lodge));
}

export function getAgentRooms(agentId: string) {
  const { roomUnits } = getMergedData();
  return roomUnits
    .filter((room) => room.agentId === agentId)
    .map((room) => ({
      room,
      lodge: getLodgeBySlug(room.lodgeSlug),
    }))
    .filter((item): item is { room: RoomUnit; lodge: Lodge } => Boolean(item.lodge));
}

export function getReviewSummary(slug: string) {
  const reviews = lodgeReviews[slug] ?? [];
  if (!reviews.length) {
    return { average: 0, water: 0, electricity: 0, security: 0, count: 0 };
  }

  const totals = reviews.reduce(
    (accumulator, review) => {
      accumulator.water += review.water;
      accumulator.electricity += review.electricity;
      accumulator.security += review.security;
      return accumulator;
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

export function buildWhatsAppLink(agentPhone: string, lodgeName: string, roomType: string) {
  const message = `Hello, I saw ${roomType} at ${lodgeName} on CampusHub and I want to book an inspection.`;
  return `https://wa.me/${agentPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

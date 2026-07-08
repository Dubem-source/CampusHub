import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { lodges as mockLodges, roomUnits as mockRooms } from "@/lib/lodge-data";
import { MOCK_MARKETPLACE_ITEMS as mockMarketplace } from "@/lib/marketplace-services-data";

// Define Mock Roommate data locally to prevent import issues
const mockRoommates = [
  {
    id: "post1",
    student_id: "stu2",
    student_name: "Emeka Uche",
    phone: "08034567890",
    department: "Civil Engineering",
    level: "400",
    budget_range: "₦150,000 – ₦200,000",
    area_preference: "Ihiagwa",
    gender_preference: "Male only",
    extra_info: "Looking for a quiet and clean roommate. I spend most of my time in the studio.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "active",
    student_gender: "Male",
  },
  {
    id: "post2",
    student_id: "stu3",
    student_name: "Chiamaka Okafor",
    phone: "08012345678",
    department: "Computer Science",
    level: "300",
    budget_range: "₦80,000 – ₦120,000",
    area_preference: "Eziobodo",
    gender_preference: "Female only",
    extra_info: "Need someone who is okay with late night coding sessions and early morning classes.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: "active",
    student_gender: "Female",
  },
  {
    id: "post3",
    student_id: "stu4",
    student_name: "Daniel Peters",
    phone: "08055566677",
    department: "Biological Sciences",
    level: "100",
    budget_range: "₦50,000 – ₦80,000",
    area_preference: "Umuchima",
    gender_preference: "Any",
    extra_info: "Freshman looking for a friendly roommate to navigate FUTO life with.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: "active",
    student_gender: "Male",
  }
];

// Mock services
const mockServices = [
  {
    id: "srv-1",
    name: "Express FUTO Plumbers",
    service_type: "Plumbing",
    phone: "08066778899",
    whatsapp: "2348066778899",
    area: "Ihiagwa",
    description: "Emergency leaks repair, tap replacement, bathroom fittings repair around Ihiagwa & Eziobodo.",
    photo_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "srv-2",
    name: "CampHub Solar Services",
    service_type: "Solar Installation",
    phone: "08155443322",
    whatsapp: "2348155443322",
    area: "Eziobodo",
    description: "Affordable solar power system installations for student lodges. Charge phones and power bulbs 24/7.",
    photo_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80",
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

export async function GET() {
  try {
    const batch = writeBatch(db);

    // 1. Seed Lodges
    mockLodges.forEach((lodge) => {
      const docRef = doc(db, "lodges", lodge.slug);
      batch.set(docRef, {
        slug: lodge.slug,
        name: lodge.name,
        area: lodge.area,
        landmark: lodge.landmark,
        agentId: lodge.agentId,
        agentName: lodge.agentName,
        agentPhoto: lodge.agentPhoto,
        agentPhone: lodge.agentPhone,
        rating: lodge.rating,
        roomsCount: lodge.roomsCount,
        buildingAmenities: lodge.buildingAmenities,
        isOfficial: lodge.isOfficial || false,
        createdAt: new Date().toISOString(),
      });
    });

    // 2. Seed Room units
    mockRooms.forEach((room) => {
      const docRef = doc(db, "rooms", room.id);
      batch.set(docRef, {
        id: room.id,
        lodgeSlug: room.lodgeSlug,
        agentId: room.agentId,
        roomType: room.roomType,
        price: room.price,
        entryPrice: room.entryPrice,
        availability: room.availability,
        area: room.area,
        rating: room.rating,
        photos: room.photos,
        amenities: room.amenities,
        viewsCount: room.viewsCount || 0,
        dateListed: room.dateListed || new Date().toISOString(),
        description: room.description || "Beautiful and spacious apartment close to FUTO campus.",
      });
    });

    // 3. Seed Roommates noticeboard posts
    mockRoommates.forEach((rm) => {
      const docRef = doc(db, "roommates", rm.id);
      batch.set(docRef, rm);
    });

    // 4. Seed Vetted Marketplace items
    mockMarketplace.forEach((item) => {
      const docRef = doc(db, "marketplace", item.id);
      batch.set(docRef, {
        ...item,
        created_at: new Date().toISOString(),
      });
    });

    // 5. Seed Vetted Services
    mockServices.forEach((srv) => {
      const docRef = doc(db, "services", srv.id);
      batch.set(docRef, srv);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      seeded: {
        lodges: mockLodges.length,
        rooms: mockRooms.length,
        roommates: mockRoommates.length,
        marketplace: mockMarketplace.length,
        services: mockServices.length,
      }
    });
  } catch (err: any) {
    console.error("Seeding error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Failed to seed database.",
    }, { status: 500 });
  }
}

"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Filter, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import LodgeCard from "../../components/LodgeCard";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  formatNaira,
  RoomUnit,
  Lodge,
} from "../../lib/lodge-data";

const sortOptions = [
  { value: "rating", label: "Top rated" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
] as const;

function LodgesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("rating");
  const [lodgesLoading, setLodgesLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLodgesLoading(true);
    const timer = setTimeout(() => setLodgesLoading(false), 450);
    return () => clearTimeout(timer);
  }, [query, selectedArea, sortBy]);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const [dbListings, setDbListings] = useState<(Lodge & { room: RoomUnit; startingPrice: number })[]>([]);
  const [dbListingsLoading, setDbListingsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setDbListingsLoading(true);
      try {
        const lodgesSnap = await getDocs(collection(db, "lodges"));
        const roomsSnap = await getDocs(collection(db, "rooms"));

        const lodgesMap = new Map<string, any>();
        lodgesSnap.forEach((doc) => {
          lodgesMap.set(doc.id, doc.data());
        });

        const activeListings: any[] = [];
        roomsSnap.forEach((doc) => {
          const room = doc.data() as RoomUnit;
          const lodge = lodgesMap.get(room.lodgeSlug);
          if (lodge) {
            activeListings.push({
              ...lodge,
              room,
              startingPrice: room.price,
            });
          }
        });

        setDbListings(activeListings);
      } catch (err) {
        console.error("Error fetching lodges:", err);
      } finally {
        setDbListingsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const dynamicAreas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(dbListings.map((item) => item.area)));
    return ["All", ...uniqueAreas];
  }, [dbListings]);

  const listings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return dbListings
      .filter((item) => {
        const { room, ...lodge } = item;
        const matchesArea = selectedArea === "All" || lodge.area === selectedArea;
        const matchesRoomType = room.roomType.toLowerCase().includes(normalizedQuery);
        const matchesQuery =
          !normalizedQuery ||
          lodge.name.toLowerCase().includes(normalizedQuery) ||
          lodge.area.toLowerCase().includes(normalizedQuery) ||
          lodge.landmark.toLowerCase().includes(normalizedQuery) ||
          matchesRoomType;

        return matchesArea && matchesQuery;
      })
      .sort((left, right) => {
        if (sortBy === "price-low") {
          return left.startingPrice - right.startingPrice;
        }
        if (sortBy === "price-high") {
          return right.startingPrice - left.startingPrice;
        }
        return right.rating - left.rating;
      });
  }, [query, selectedArea, sortBy, dbListings]);

  if (pageLoading || dbListingsLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#08131e] transition-colors duration-300">
        <div className="relative flex flex-col items-center space-y-4">
          <div className="relative h-32 w-32 flex items-center justify-center animate-pulse">
            <Image
              src="/image/Campus-Hub2.png"
              alt="CampusHub Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-navy dark:text-white animate-pulse">
              Campus<span className="text-gold">Hub</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-bounce animate-duration-500" style={{ animationDelay: '300ms' }} />
              <span>Loading Lodges...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_30%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_52%)] text-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-0 sm:px-6 md:px-8 lg:px-10">
        <section className="-mx-4 border-x border-b border-[#0f274f] bg-[#071226] px-6 py-8 text-white shadow-[0_12px_36px_rgba(7,18,38,0.18)] sm:-mx-6 sm:px-8 sm:py-10 md:-mx-8 lg:-mx-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Browse lodges
            </p>
          
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              Search by area, filter fast, sort by what matters, and tap a card to go directly to the room detail page.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <label className="flex items-center gap-3 rounded-md bg-white px-4 py-3 text-gray-500 shadow-sm">
              <Search className="h-4 w-4 shrink-0 text-gold" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by lodge name, area, or room type"
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-gray-400"
              />
            </label>

            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as (typeof sortOptions)[number]["value"])
              }
            >
              <SelectTrigger className="h-full w-full justify-start gap-3 rounded-md border-none bg-white px-4 py-3 text-sm text-gray-500 shadow-sm focus-visible:ring-0">
                <Filter className="h-4 w-4 shrink-0 text-gold" />
                <SelectValue placeholder="Sort by" className="text-navy" />
              </SelectTrigger>
              <SelectContent className="lg:w-56">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {dynamicAreas.map((area) => {
              const active = selectedArea === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition ${active ? "border-gold bg-gold text-navy" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {area}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-navy sm:text-2xl">
              Available lodges
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {listings.length} result{listings.length === 1 ? "" : "s"} found
              {selectedArea !== "All" ? ` in ${selectedArea}` : ""}.
            </p>
          </div>
        </section>

        {lodgesLoading ? (
          <section className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[360px] animate-pulse rounded-[2rem] bg-gray-200 dark:bg-white/5"
              />
            ))}
          </section>
        ) : (
          <section className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => {
              const { room, ...lodge } = item;
              return (
                <LodgeCard
                  key={room.id}
                  name={lodge.name}
                  area={`${lodge.area} · ${lodge.landmark}`}
                  price={formatNaira(room.price)}
                  badge={room?.availability === "available" ? "Available" : room?.availability === "pending" ? "Pending" : "Rented"}
                  rating={lodge.rating}
                  href={`/lodges/${lodge.slug}/rooms/${room.id}`}
                  photo={room.photos[0]}
                  availability={room.availability === "available" ? "Available now" : room.availability === "pending" ? "Pending" : "Rented"}
                  roomType={room.roomType}
                  isOfficial={lodge.isOfficial}
                  roomId={room.id}
                  room={room}
                  lodge={lodge as any}
                />
              );
            })}
          </section>
        )}

        {!lodgesLoading && listings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-600">
            No lodges match your search yet. Try another area or search term.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function LodgesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Loading...</div>}>
      <LodgesContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { RoomUnit, Lodge } from "@/lib/lodge-data";
import { toast } from "react-hot-toast";

type LodgeCardProps = {
  name: string;
  area?: string;
  price?: string;
  badge?: string;
  rating?: number;
  href?: string;
  photo?: string;
  availability?: string;
  roomType?: string;
  isOfficial?: boolean;
  hideHeart?: boolean;
  roomId?: string;
  room?: RoomUnit;
  lodge?: Lodge;
};

export default function LodgeCard({
  name,
  area,
  price = "₦300k/year",
  badge,
  rating = 4.8,
  href = "#",
  photo,
  availability = "Available now",
  roomType,
  isOfficial,
  hideHeart,
  roomId,
  room,
  lodge,
}: LodgeCardProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saveDocId, setSaveDocId] = useState<string | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!user && href && href !== "#") {
      e.preventDefault();
      toast.error("Please sign in to view room details.");
      router.push(`/auth?mode=login&returnTo=${encodeURIComponent(href)}`);
    }
  };


  // Subscribe to the saved state of this room for the logged-in student
  React.useEffect(() => {
    if (!user || !roomId || profile?.role !== "student") {
      setIsSaved(false);
      setSaveDocId(null);
      return;
    }

    const q = query(
      collection(db, "savedRooms"),
      where("studentId", "==", user.uid),
      where("room.id", "==", roomId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setIsSaved(true);
        setSaveDocId(snapshot.docs[0].id);
      } else {
        setIsSaved(false);
        setSaveDocId(null);
      }
    });

    return () => unsubscribe();
  }, [user, roomId, profile]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please log in to save rooms.");
      return;
    }

    if (profile?.role !== "student") {
      toast.error("Only students can save rooms.");
      return;
    }

    try {
      if (isSaved && saveDocId) {
        // Unsave
        await deleteDoc(doc(db, "savedRooms", saveDocId));
        toast.success("Removed from saved rooms");
      } else if (room) {
        // Save
        await addDoc(collection(db, "savedRooms"), {
          studentId: user.uid,
          room: room,
          lodge: lodge || {
            slug: room.lodgeSlug || "",
            name: name,
            area: room.area || "",
            landmark: "",
            agentId: room.agentId || "",
            agentName: "Agent",
            agentPhoto: "",
            agentPhone: "",
            rating: rating,
            roomsCount: 1,
            buildingAmenities: [],
            isOfficial: isOfficial,
          },
          savedAt: new Date().toISOString(),
        });
        toast.success("Saved to your dashboard!");
      }
    } catch (err) {
      console.error("Error saving room:", err);
      toast.error("Failed to save. Please try again.");
    }
  };

  const displayBadge = isOfficial ? (
    <span className="flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy backdrop-blur-md">
      CampusHub Official <BadgeCheck className="h-3 w-3" />
    </span>
  ) : (
    <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
      Verified ID <BadgeCheck className="h-3 w-3" />
    </span>
  );

  const cardContent = (
    <article className="group overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_14px_42px_rgba(15,30,45,0.07)] transition hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(15,30,45,0.12)] h-full">
      <div
        className="relative h-48 overflow-hidden p-4 sm:h-52 lg:h-56 lg:p-5"
        style={{
          backgroundImage: photo
            ? `linear-gradient(180deg, rgba(7, 18, 38, 0.05), rgba(7, 18, 38, 0.78)), url(${photo})`
            : "linear-gradient(135deg,rgba(15,30,45,0.96),rgba(201,149,42,0.50))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-start justify-between">
          {displayBadge}
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/12 p-3 text-white backdrop-blur-md lg:inset-x-5 lg:bottom-5 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/65">Price</p>
              <p className="text-lg font-semibold lg:text-xl">{price}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-current text-gold" />
              {rating}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 lg:p-6">
        <h3 className="text-lg font-semibold text-navy lg:text-[1.15rem]">{name}</h3>
        <p className="mt-1 text-sm text-gray-500">{area}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="rounded-full bg-[#f5f6f7] px-3 py-1.5 text-xs font-medium text-gray-600">
            {availability}
          </span>
          <span className="text-sm font-semibold text-navy transition group-hover:text-gold">
            View room
          </span>
        </div>
        {roomType && (
          <p className="mt-2 text-xs text-gray-500 lg:text-[0.8rem] font-medium">{roomType}</p>
        )}
      </div>
    </article>
  );

  return (
    <div className="relative">
      {/* Heart Button: Physically outside the Link for zero bubbling */}
      {!hideHeart && (
        <button 
          onClick={handleToggleSave}
          className="absolute right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5"
        >
          <Heart className={cn(
            "h-4 w-4 transition-all duration-300",
            isSaved ? "fill-red-500 text-red-500" : "fill-none text-white"
          )} />
        </button>
      )}

      {href === "#" ? (
        cardContent
      ) : (
        <Link href={href} onClick={handleCardClick} className="block h-full">
          {cardContent}
        </Link>
      )}
    </div>
  );
}

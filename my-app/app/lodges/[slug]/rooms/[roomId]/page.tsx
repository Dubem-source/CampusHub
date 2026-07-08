"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flag,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Share2,
  Star,
} from "lucide-react";
import Header from "../../../../../components/Header";
import Footer from "../../../../../components/Footer";
import LodgeCard from "../../../../../components/LodgeCard";
import {
  buildWhatsAppLink,
  formatNaira,
  getAgentById,
  getOtherRooms,
  getRoomById,
  getRoomBySlugAndRoomId,
  lodgeReviews,
  type Review,
} from "../../../../../lib/lodge-data";

type ReportState = {
  reason: string;
  details: string;
};

type ReviewFormState = {
  water: number;
  electricity: number;
  security: number;
  text: string;
  tenantConfirmed: boolean;
};

const reportReasons = [
  "Scam / fake listing",
  "Wrong pricing",
  "Bad photos / misleading info",
  "Agent behavior",
  "Other",
];

const starLabels = [1, 2, 3, 4, 5] as const;

function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-medium text-navy">{label}</div>
      <div className="flex flex-wrap gap-2">
        {starLabels.map((rating) => {
          const active = rating <= value;
          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${active ? "border-[#C9952A] bg-[#f7efe0] text-navy" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
            >
              <Star className={`h-4 w-4 ${active ? "fill-current text-gold" : "text-gray-300"}`} />
              {rating}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatListedDate(dateInput?: string) {
  if (!dateInput) return "1 day ago";
  const date = new Date(dateInput);
  const now = new Date();
  
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return "today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays === 7) {
    return "1wk ago";
  }
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function RoomDetailPage() {
  const router = useRouter();
  const routeParams = useParams<{ slug?: string; roomId?: string }>();
  const slug = Array.isArray(routeParams?.slug) ? routeParams.slug[0] : routeParams?.slug;
  const roomId = Array.isArray(routeParams?.roomId) ? routeParams.roomId[0] : routeParams?.roomId;
  const roomData = slug && roomId ? getRoomBySlugAndRoomId(slug, roomId) ?? getRoomById(roomId) : null;

  const roomContext = useMemo(() => {
    return roomData
      ? {
          room: roomData.room,
          lodge: roomData.lodge,
          agent: getAgentById(roomData.room.agentId),
        }
      : null;
  }, [roomData]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, photosLength: number) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swipe left -> Next photo
      setActivePhotoIndex((prev) => (prev === photosLength - 1 ? 0 : prev + 1));
    } else if (diff < -50) {
      // Swipe right -> Previous photo
      setActivePhotoIndex((prev) => (prev === 0 ? photosLength - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reportState, setReportState] = useState<ReportState>({
    reason: reportReasons[0],
    details: "",
  });
  const [reviewState, setReviewState] = useState<ReviewFormState>({
    water: 5,
    electricity: 5,
    security: 5,
    text: "",
    tenantConfirmed: false,
  });

  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (roomContext) {
      // Use setTimeout to ensure the update happens in the next tick,
      // resolving the 'setState in effect' lint error.
      const timer = setTimeout(() => {
        setLocalReviews(lodgeReviews[roomContext.lodge.slug] ?? []);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [roomContext]);

  const isLoggedIn = false;

  useEffect(() => {
    if (roomContext && slug && roomContext.lodge.slug !== slug) {
      router.replace(`/lodges/${roomContext.lodge.slug}/rooms/${roomContext.room.id}`);
    }
  }, [roomContext, router, slug]);

  const reviewSummary = useMemo(() => {
    if (!roomContext) {
      return null;
    }
    if (!localReviews.length) {
      return { average: 0, water: 0, electricity: 0, security: 0, count: 0 };
    }
    const totals = localReviews.reduce(
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
        ((totals.water + totals.electricity + totals.security) / (localReviews.length * 3)).toFixed(1),
      ),
      water: Number((totals.water / localReviews.length).toFixed(1)),
      electricity: Number((totals.electricity / localReviews.length).toFixed(1)),
      security: Number((totals.security / localReviews.length).toFixed(1)),
      count: localReviews.length,
    };
  }, [roomContext, localReviews]);

  const relatedRooms = useMemo(() => {
    if (!roomContext) {
      return [];
    }
    return getOtherRooms(roomContext.room.agentId, roomContext.room.id);
  }, [roomContext]);

  const handleShare = async () => {
    if (!roomContext) {
      return;
    }

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${roomContext.lodge.name} - ${roomContext.room.roomType}`,
          text: `Check out ${roomContext.room.roomType} at ${roomContext.lodge.name} on CampusHub.`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    }
  };

  const handleReportSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Report submitted. We will review it soon.");
    setIsReportOpen(false);
    setReportState({ reason: reportReasons[0], details: "" });
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newReview: Review = {
      studentName: "Anonymous Student",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      water: reviewState.water,
      electricity: reviewState.electricity,
      security: reviewState.security,
      text: reviewState.text,
      tenantType: reviewState.tenantConfirmed ? "verified_tenant" : "prospective_tenant",
    };
    setLocalReviews((prev) => [newReview, ...prev]);
    toast.success("Review saved.");
    setIsReviewOpen(false);
    setReviewState({ water: 5, electricity: 5, security: 5, text: "", tenantConfirmed: false });
  };

  if (!slug || !roomId) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_28%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_50%)] text-black">
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6 py-16 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Loading room</p>
            <h1 className="mt-3 text-3xl font-semibold text-navy">Reading route details...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!roomContext) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_28%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_50%)] text-black">
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6 py-16 text-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
              Room not found
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-navy">
              We could not find this room.
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              The room may have been removed or the link may be outdated.
            </p>
            <button
              type="button"
              onClick={() => router.push("/lodges")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#071226] px-5 py-3 text-sm font-semibold text-white"
            >
              Back to browse <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { room, lodge, agent } = roomContext;
  const toPayPrice = room.entryPrice;
  const whatsappLink = buildWhatsAppLink(agent?.phone ?? lodge.agentPhone, lodge.name, room.roomType);
  const bookLink = isLoggedIn ? whatsappLink : `/auth?returnTo=${encodeURIComponent(`/lodges/${lodge.slug}/rooms/${room.id}`)}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(201,149,42,0.08),transparent_28%),linear-gradient(180deg,#f8f9fa_0%,#ffffff_50%)] text-black">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8 lg:px-10 lg:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/lodges")}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to browse
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9952A]/15 bg-[#C9952A]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6d18]">
            <ImageIcon className="h-4 w-4" />
            Room detail
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[70%_30%] lg:items-start">
          <div className="space-y-6 min-w-0">
            <div className="rounded-4xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-3 px-1 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                    {room.roomType}
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                    {lodge.name}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">{lodge.area} · {lodge.landmark}</p>
                </div>
                <div className="hidden rounded-2xl bg-[#f7efe0] px-4 py-3 text-right sm:block">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-500">First Payment</p>
                  <p className="mt-1 text-lg font-semibold text-navy">{formatNaira(room.price)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Main Photo Display */}
                <div
                  className="relative h-64 sm:h-105 w-full overflow-hidden rounded-3xl border border-black/5 bg-gray-100 group cursor-pointer"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(e, room.photos.length)}
                >
                  <img
                    src={room.photos[activePhotoIndex]}
                    alt={`${lodge.name} photo ${activePhotoIndex + 1}`}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  
                  {/* Overlay indicators */}
                  <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    Photo {activePhotoIndex + 1} of {room.photos.length}
                  </span>

                  {/* Left Arrow */}
                  {room.photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === 0 ? room.photos.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}

                  {/* Right Arrow */}
                  {room.photos.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev === room.photos.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto py-1 w-full max-w-full">
                  {room.photos.map((photo, index) => (
                    <button
                      key={photo}
                      type="button"
                      onClick={() => setActivePhotoIndex(index)}
                      className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${activePhotoIndex === index ? "border-gold shadow-md" : "border-gray-200 opacity-60 hover:opacity-100"}`}
                    >
                      <img src={photo} alt="Thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-2xl border border-black/5 bg-white p-6 lg:p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#f7efe0] px-4 py-2 text-sm font-semibold text-navy">
                    {room.roomType}
                  </span>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${room.availability === "available" ? "bg-emerald-100 text-emerald-700" : room.availability === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {room.availability.charAt(0).toUpperCase() + room.availability.slice(1)}
                  </span>
                  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    First Payment {formatNaira(room.price)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    <Eye className="h-4 w-4 text-gray-500" />
                    {room.viewsCount ?? 124} views
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                    <Clock3 className="h-4 w-4 text-gray-500" />
                    {formatListedDate(room.dateListed)}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="mt-1 text-base font-medium text-gray-700">{lodge.area} · {lodge.landmark}</p>
                  </div>

                  <div className="mt-3 lg:mt-0 text-right">
                    <p className="text-sm text-gray-500">To Pay</p>
                    <p className="mt-1 text-3xl font-extrabold text-navy lg:text-4xl">{formatNaira(toPayPrice)}/yr</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-navy">Highlights & amenities</h2>
                  <div className="mt-3 grid auto-rows-auto grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {room.amenities.map((amenity) => (
                      <span key={amenity} className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-[#fcfcfc] px-3 py-2 text-sm text-gray-700">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-navy">About This Apartment</h2>
                  <p className="mt-3 text-sm leading-relaxed text-navy/70 whitespace-pre-line bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    {room.description || "A standard premium room listed on CampusHub with essential FUTO amenities, proximity to campus gates, and high security."}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl border border-black/5 bg-[#fcfcfc] p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-navy mb-4">Lodge & Building Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                      <p className="text-sm font-medium text-navy">{lodge.name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Location / Landmark</p>
                      <p className="text-sm font-medium text-navy">{lodge.area} · {lodge.landmark}</p>
                    </div>
                  </div>
                  
                  {lodge.buildingAmenities && lodge.buildingAmenities.length > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Building Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {lodge.buildingAmenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe0] px-3 py-1.5 text-xs font-semibold text-navy"
                          >
                            <Star className="h-3 w-3 text-gold fill-current" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Agent profile card */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img src={agent?.photo ?? lodge.agentPhoto} alt={lodge.agentName} className="h-20 w-20 rounded-xl object-cover bg-gray-50" />
                <div className="flex-1 text-left">
                  <p className="text-sm text-gray-500">Listed by</p>
                  <div className="flex items-center gap-2">
                    <Link href={`/agents/${agent?.id ?? lodge.agentId}`} className="text-lg font-semibold text-navy hover:text-gold">
                      {agent?.name ?? lodge.agentName}
                    </Link>
                    {agent?.verified && <BadgeCheck className="h-4 w-4 text-gold shrink-0" />}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-1.5">
                    <span>{agent?.responseTime ?? "Replies quickly"}</span>
                    <span className="text-gray-300">•</span>
                    <span>Joined {agent?.joinedDate || "Oct 2025"}</span>
                  </div>
                  {agent?.verified && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-500/20">
                        Verified ID <BadgeCheck className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={bookLink}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1fb457] sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Agent
                </Link>

                <Link
                  href={bookLink}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-navy transition hover:shadow-sm sm:w-auto"
                >
                  <Clock3 className="h-4 w-4 text-gold" />
                  Book Inspection
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link href={`/agents/${lodge.agentId}`} className="text-sm font-medium text-navy transition hover:text-gold">
                  View all listings by this agent
                </Link>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy"
                  >
                    <Share2 className="h-4 w-4 text-gold" />
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500/80 hover:text-red-700"
                  >
                    <Flag className="h-4 w-4" />
                    Report
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-navy">Reviews</h2>
                  <p className="text-xs text-gray-500">Lodge level</p>
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(true)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold/10 px-3 py-1 text-xs font-semibold text-gold transition hover:bg-gold hover:text-navy"
                  >
                    Write a Review
                  </button>
                </div>
                {reviewSummary && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Overall score</p>
                    <p className="text-2xl font-extrabold text-navy">{reviewSummary.average.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">{reviewSummary.count} reviews</p>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {localReviews.map((review) => (
                  <article key={`${review.studentName}-${review.date}`} className="rounded-lg border border-gray-100 bg-[#fcfcfc] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-navy">{review.studentName}</h3>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.tenantType === "verified_tenant" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {review.tenantType === "verified_tenant" ? "Verified tenant" : "Prospective tenant"}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2 text-sm text-gray-600">
                      <span className="rounded-full bg-white px-3 py-1">Water {review.water}/5</span>
                      <span className="rounded-full bg-white px-3 py-1">Electricity {review.electricity}/5</span>
                      <span className="rounded-full bg-white px-3 py-1">Security {review.security}/5</span>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-gray-700">{review.text}</p>
                  </article>
                ))}

                {localReviews.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    No reviews yet for this lodge.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 lg:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Related listings</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                Other Properties You Might Like
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                More options from other agents, laid out for easier desktop browsing and comparison.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#f7efe0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-navy">
              {relatedRooms.length} options
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {relatedRooms.map(({ lodge: relatedLodge, room: relatedRoom }) => (
              <div key={relatedRoom.id} className="h-full">
                <LodgeCard
                  name={relatedLodge.name}
                  area={`${relatedLodge.area} · ${relatedLodge.landmark}`}
                  price={formatNaira(relatedRoom.price)}
                  badge={relatedRoom.availability === "available" ? "Available" : relatedRoom.availability}
                  rating={relatedRoom.rating}
                  photo={relatedRoom.photos[0]}
                  href={`/lodges/${relatedLodge.slug}/rooms/${relatedRoom.id}`}
                  availability={relatedRoom.availability === "available" ? "Available now" : relatedRoom.availability}
                  roomType={relatedRoom.roomType}
                />
              </div>
            ))}

            {relatedRooms.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-10 text-sm text-gray-500 shadow-sm">
                No other agent listings are available right now.
              </div>
            )}
          </div>
        </section>

        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-3 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
            <div className="w-full max-w-xl overflow-hidden rounded-t-4xl bg-white shadow-2xl sm:rounded-4xl">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[#071226] px-5 py-5 text-white sm:px-7 sm:py-6">
                <div className="max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6d26a]">
                    Report listing
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                    Tell us what went wrong
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    Choose a reason and add the details so we can review the issue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  Close
                </button>
              </div>

              <form className="space-y-5 px-5 py-6 sm:px-7" onSubmit={handleReportSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-navy">Reason</span>
                  <select
                    value={reportState.reason}
                    onChange={(event) => setReportState((current) => ({ ...current, reason: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  >
                    {reportReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-navy">Details</span>
                  <textarea
                    value={reportState.details}
                    onChange={(event) => setReportState((current) => ({ ...current, details: event.target.value }))}
                    required
                    rows={5}
                    placeholder="Explain the issue and include anything that helps verify it."
                    className="h-36 w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7a0608] focus:ring-4 focus:ring-[#7a0608]/10"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071226] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1c35]"
                  >
                    Submit report
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isReviewOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-3 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
            <div className="w-full max-w-2xl overflow-hidden rounded-t-4xl bg-white shadow-2xl sm:rounded-4xl">
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[#071226] px-5 py-5 text-white sm:px-7 sm:py-6">
                <div className="max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f6d26a]">
                    Write a review
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                    Rate this lodge
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    Share what it was like living here so other students can decide faster.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="rounded-full border border-white/15 px-3 py-2 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  Close
                </button>
              </div>

              <form className="space-y-5 px-5 py-6 sm:px-7" onSubmit={handleReviewSubmit}>
                <div className="grid gap-4 md:grid-cols-3">
                  <StarInput label="Water" value={reviewState.water} onChange={(value) => setReviewState((current) => ({ ...current, water: value }))} />
                  <StarInput label="Electricity" value={reviewState.electricity} onChange={(value) => setReviewState((current) => ({ ...current, electricity: value }))} />
                  <StarInput label="Security" value={reviewState.security} onChange={(value) => setReviewState((current) => ({ ...current, security: value }))} />
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-navy">Review</span>
                  <textarea
                    value={reviewState.text}
                    onChange={(event) => setReviewState((current) => ({ ...current, text: event.target.value }))}
                    required
                    rows={5}
                    placeholder="Write your review..."
                    className="h-36 w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gold focus:ring-4 focus:ring-gold/10"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-[#fcfcfc] p-4 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={reviewState.tenantConfirmed}
                    onChange={(event) => setReviewState((current) => ({ ...current, tenantConfirmed: event.target.checked }))}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span>I confirm I am a tenant or prospective tenant for this lodge.</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReviewOpen(false)}
                    className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewState.tenantConfirmed}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071226] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1c35] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Submit review
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

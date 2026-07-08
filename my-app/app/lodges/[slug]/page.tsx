import { redirect } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

type Props = { params: Promise<{ slug: string }> };

export default async function LodgeDetailPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const q = query(
      collection(db, "rooms"),
      where("lodgeSlug", "==", slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const firstRoomId = querySnapshot.docs[0].id;
      redirect(`/lodges/${slug}/rooms/${firstRoomId}`);
    }
  } catch (err) {
    console.error("Error redirecting to lodge room:", err);
  }

  redirect("/lodges");
}

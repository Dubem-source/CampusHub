import { redirect } from "next/navigation";
import { getLodgeRooms } from "../../../lib/lodge-data";

type Props = { params: Promise<{ slug: string }> };

export default async function LodgeDetailPage({ params }: Props) {
  const { slug } = await params;
  const rooms = getLodgeRooms(slug);
  
  if (rooms.length > 0) {
    redirect(`/lodges/${slug}/rooms/${rooms[0].id}`);
  } else {
    redirect("/lodges");
  }
}

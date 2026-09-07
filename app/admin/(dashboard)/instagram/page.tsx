import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InstagramManagerClient } from "./InstagramManagerClient";

export const revalidate = 0;

export default async function AdminInstagramPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  let posts: any[] = [];
  try {
    posts = await db.instagramPost.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
  } catch (error) {
    console.error("Error loading admin instagram posts:", error);
  }

  return <InstagramManagerClient initialPosts={posts} />;
}

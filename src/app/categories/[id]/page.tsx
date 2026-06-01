import CategoryProductsClient from "./CategoryProductsClient";
import { getSupabaseCategories } from "@/lib/supabase";

export async function generateStaticParams() {
  try {
    const cats = await getSupabaseCategories();
    return cats.map((c: any) => ({ id: c.id }));
  } catch (err) {
    return [
      { id: "gowns" },
      { id: "caps" },
      { id: "sashes" },
      { id: "pins" }
    ];
  }
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryProductsClient params={resolvedParams} />;
}

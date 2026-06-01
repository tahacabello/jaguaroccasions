import CategoryProductsClient from "./CategoryProductsClient";

export async function generateStaticParams() {
  return [
    { id: "gowns" },
    { id: "caps" },
    { id: "sashes" },
    { id: "pins" }
  ];
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryProductsClient params={resolvedParams} />;
}

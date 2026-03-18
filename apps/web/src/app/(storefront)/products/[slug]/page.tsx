import { ProductDetail } from "./product-detail";

const ProductDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: productId } = await params;

  return <ProductDetail productId={productId} />;
};

export default ProductDetailPage;

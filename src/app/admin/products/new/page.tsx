import { PageHeader } from "../../_components/PageHeader";
// _components tells next that this folder isn't a route
import { ProductForm } from "../_components/ProductForm";


export default function NewProductPage() {
  return (
    <>
      <PageHeader>Add Product</PageHeader>
      <ProductForm />
    </>
  );
}

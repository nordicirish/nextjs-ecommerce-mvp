"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { useState } from "react";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormState, useFormStatus } from "react-dom";
import { Product } from "@prisma/client";
import Image from "next/image";
// Change action depending on if product is null or not to addProduct or updateProduct
export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useFormState(product == null ? addProduct : updateProduct.bind(null, product.id), {});
  const [
    priceInCents,
    //for editing return priceInCents from product
    setPriceInCents,
  ] = useState<number | undefined>(product?.priceInCents);
  console.log(priceInCents);
  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        {/* htmlFor is used to associate the label with the input */}
        <Label htmlFor="name">Name</Label>
        {/* for editing return name from product */}
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error?.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        {/* htmlFor is used to associate the label with the input */}
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        {error?.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>
      <div className="text-muted-foreground">
        {formatCurrency((priceInCents || 0) / 100)}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description || ""}
        />
        {error?.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        {/* htmlFor is used to associate the label with the input */}
        <Label htmlFor="file">File</Label>
        <Input
          type="file"
          id="file"
          name="file"
          // only required if adding a new product
          required={product === null}
        />
        {/* for editing return filePath from product */}
        {product != null && (
          <div className="text-muted-foreground">{product.filePath}</div>
        )}
        {error?.file && <div className="text-destructive">{error.file}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          type="file"
          id="image"
          name="image"
          // only required if adding a new product
          required={product === null}
        />
        {product != null && (
          <Image
            src={product.imagePath}
            width={200}
            height={200}
            alt={`${product.name} image`}
          />
        )}
        {error?.image && <div className="text-destructive">{error.image}</div>}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {" "}
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

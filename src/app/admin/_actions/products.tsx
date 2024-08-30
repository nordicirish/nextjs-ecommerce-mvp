"use server";
// server actions
import { z } from "zod";
import db from "@/db/db";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "File is required" });

// file size === 0, if no file is provided don't validate the image type
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);

// schema is more specific file and image schemas so they can be reused for editing
const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  // form returns a string so coerce to number
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine((file) => file.size > 0, "File is required"),
  image: imageSchema.refine((file) => file.size > 0, "Image is required"),
});
export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  console.log(result);
  // return errors for each field that fails validation to the user
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }
  const data = result.data;
  await fs.mkdir("products", { recursive: true });
  //create a unique file name to acoid overwrite conflicts
  const filePath = `products/${crypto.randomUUID()} - ${data.file.name}`;

  // write the file in a format that can be read by node
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  await fs.mkdir("public/products", { recursive: true });
  //create a unique image name to avoid overwrite conflicts
  const imagePath = `/products/${crypto.randomUUID()} - ${data.image.name}`;

  // write the image in a format that can be read by node
  // image path already starts with a /
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );
  try {
    await db.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        filePath,
        imagePath,
      },
    });
  } catch (error) {
    console.error("Db error creating product:", error);
  }
  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}
const editSchema = addSchema.extend({
  // file and image are optional so they can be left blank when editing
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});
export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  console.log(result);
  // return errors for each field that fails validation to the user
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }
  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });
  if (product === null) return notFound();
  let filePath = product.filePath;
  // delete the old file if a new one is uploaded
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath);
    filePath = `products/${crypto.randomUUID()} - ${data.file.name}`;

    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }
  let imagePath = product.imagePath;
  // delete the old image if a new one is uploaded
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`);
    imagePath = `/products/${crypto.randomUUID()} - ${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }
  try {
    await db.product.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        filePath,
        imagePath,
      },
    });
  } catch (error) {
    console.error("Db error creating product:", error);
  }
  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  try {
    const product = await db.product.delete({ where: { id } });
    if (product === null) return notFound();
    //unlink deletes the file and image from server storage
    await fs.unlink(product.filePath);
    await fs.unlink(`public${product.imagePath}`);
  } catch (error) {
    console.error("Db error deleting product:", error);
  }
}
export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: {
      id,
    },
    data: {
      isAvailableForPurchase,
    },
  });
}

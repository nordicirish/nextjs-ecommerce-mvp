"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";

import { deleteProduct, toggleProductAvailability } from "../../_actions/products";
import { useRouter } from "next/navigation";

export function ActiveToggleDropDownItem({
  id,
  isAvailableForPurchase,
}: {
  id: string;
  isAvailableForPurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenuItem
      // disable if pending
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(id, !isAvailableForPurchase);
        });
      }}
    >
      {isAvailableForPurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}


export function DeleteDropDownItem({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      // disable if pending
      disabled={disabled || isPending}
      variant="destructive"
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}

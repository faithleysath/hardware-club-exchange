import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/lib/actions/engagement";
import { buttonVariants } from "@/components/ui/button";

export function FavoriteToggleButton({
  listingId,
  isFavorited,
}: {
  listingId: string;
  isFavorited: boolean;
}) {
  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className={buttonVariants({
          variant: isFavorited ? "primary" : "secondary",
          size: "sm",
        })}
      >
        <span className="flex items-center gap-2">
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          {isFavorited ? "已收藏" : "加入收藏"}
        </span>
      </button>
    </form>
  );
}

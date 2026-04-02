import { Badge } from "@/components/ui/badge";
import {
  memberStatusLabels,
  memberStatusTone,
  type MemberStatus,
  listingStatusLabels,
  listingStatusTone,
  type ListingStatus,
} from "@/lib/constants";

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge tone={listingStatusTone[status]}>{listingStatusLabels[status]}</Badge>;
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <Badge tone={memberStatusTone[status]}>{memberStatusLabels[status]}</Badge>;
}

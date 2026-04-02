import { Badge } from "@/components/ui/badge";
import {
  memberStatusLabels,
  memberStatusTone,
  type MemberStatus,
  listingStatusLabels,
  listingStatusTone,
  type ListingStatus,
  reportStatusLabels,
  reportStatusTone,
  type ReportStatus,
  reservationStatusLabels,
  reservationStatusTone,
  type ReservationStatus,
} from "@/lib/constants";

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge tone={listingStatusTone[status]}>{listingStatusLabels[status]}</Badge>;
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return <Badge tone={memberStatusTone[status]}>{memberStatusLabels[status]}</Badge>;
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={reservationStatusTone[status]}>{reservationStatusLabels[status]}</Badge>;
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge tone={reportStatusTone[status]}>{reportStatusLabels[status]}</Badge>;
}

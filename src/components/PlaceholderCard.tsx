import type { FC } from "react";

type Props = {
  title?: string;
  subtitle?: string;
};

const PlaceholderCard: FC<Props> = ({ title = "", subtitle = "" }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {title ? (
        <div className="mb-1 h-5 w-48 animate-pulse rounded bg-gray-100" />
      ) : null}
      {subtitle ? (
        <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
      ) : null}
    </div>
  );
};

export default PlaceholderCard;


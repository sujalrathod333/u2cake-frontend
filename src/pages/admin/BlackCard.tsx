import type { FC } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

const BlackCard: FC<Props> = ({ className = "", children }) => {
  return (
    <div
      className={`rounded-3xl border border-slate-800/80 bg-[#0b1220]/60 shadow-2xl backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
};

export default BlackCard;


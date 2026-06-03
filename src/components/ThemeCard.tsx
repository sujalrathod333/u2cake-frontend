import type { FC } from "react";

type ThemeCardProps = {
  className?: string;
  children: React.ReactNode;
};

const ThemeCard: FC<ThemeCardProps> = ({ className = "", children }) => {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/20 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] ${className}`}
    >
      {children}
    </div>
  );
};

export default ThemeCard;


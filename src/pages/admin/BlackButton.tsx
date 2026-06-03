import type { FC } from "react";

type Props = {
  variant?: "primary" | "danger" | "ghost";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

const BlackButton: FC<Props> = ({
  variant = "primary",
  className = "",
  children,
  onClick,
  disabled,
  type = "button",
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-95",
    ghost: "bg-[#0f172a] border border-slate-700 text-slate-200 hover:bg-slate-800",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default BlackButton;


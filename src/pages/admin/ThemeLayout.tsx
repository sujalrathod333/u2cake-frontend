import type { FC } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

const ThemeLayout: FC<Props> = ({ title, subtitle, right, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{title}</h1>
            {subtitle ? <p className="text-slate-400 mt-2">{subtitle}</p> : null}
          </div>
          {right}
        </div>
        {children}
      </div>
    </div>
  );
};

export default ThemeLayout;


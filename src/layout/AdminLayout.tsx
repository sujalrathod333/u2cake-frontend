import { Outlet, NavLink } from "react-router-dom";
import type { FC } from "react";
import { useState } from "react";

const AdminLayout: FC = () => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white flex">


      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 text-white flex items-center justify-between px-4 z-50 shadow">
        <h2 className="font-semibold">Admin Panel</h2>
        <button onClick={() => setOpen(true)} className="text-2xl">
          ☰
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-14 flex items-center px-5 border-b border-gray-800">
          <h2 className="text-lg font-bold">Cake Admin</h2>

          <button
            onClick={() => setOpen(false)}
            className="ml-auto md:hidden text-gray-300"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-2 text-sm">

          <NavLink
            to="/admin"
            end
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/cakes"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Cakes
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Categories
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Orders
          </NavLink>

          <NavLink
            to="/admin/users"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Users
          </NavLink>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
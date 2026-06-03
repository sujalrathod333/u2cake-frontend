import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../hook/redux";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Cakes", path: "/cake" },
    { name: "My Orders", path: "/orders" },
    { name: "Cart", path: "/cart" },
  ];


  return (
    <nav className="bg-red-600 text-white sticky top-0 z-50 shadow-lg">

      <div className="flex items-center justify-between px-4 md:px-10 py-4">

        {/* LOGO */}
        <h1 className="text-2xl font-extrabold cursor-pointer" onClick={() => window.location.href = '/'}>
          Cake Palace 🍰
        </h1>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-6 font-medium items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`px-3 py-1 rounded-full transition ${isActive
                      ? "bg-white text-red-600 font-bold"
                      : "hover:bg-red-700"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}

          {isAuthenticated ? (
            <>
              <li className="px-3 py-1 rounded-full text-white/90">
                Hi, {user?.name?.split(" ")[0] ?? "User"}
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(logout());
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    navigate("/");
                  }}
                  className="px-3 py-1 rounded-full bg-white text-red-600 font-bold hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                className="px-3 py-1 rounded-full bg-white text-red-600 font-bold hover:bg-red-50 transition"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden border border-white px-3 py-1 rounded-md"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-red-700 px-4 py-4 space-y-3">

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md ${isActive
                    ? "bg-white text-red-600 font-bold"
                    : "hover:bg-red-800"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <>
              <div className="block px-3 py-2 rounded-md text-white/90">
                Hi, {user?.name?.split(" ")[0] ?? "User"}
              </div>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  localStorage.removeItem("token");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("user");
                  navigate("/");
                  setOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md bg-white text-red-600 font-bold hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md bg-white text-red-600 font-bold hover:bg-red-50"
            >
              Login
            </Link>
          )}

        </div>
      )}

    </nav>
  );
};

export default Navbar;
import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAppDispatch } from "../hook/redux.ts";

import { loginUser } from "../api/auth.ts";

import { setCredentials } from "../store/authSlice";

const Login = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      const user = response.user ?? response.data;
      dispatch(
        setCredentials({
          user,
          token: response.accessToken,
        }),
      );

      localStorage.setItem("token", response.accessToken);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      const userName = response.user?.name ?? response.data?.name ?? "🍰";
      toast.success(`Welcome back ${userName} 🍰`, {

        style: {
          borderRadius: "14px",
          background: "#14532d",
          color: "#fff",
          padding: "14px",
          fontWeight: "600",
        },

        iconTheme: {
          primary: "#22c55e",
          secondary: "#fff",
        },
      });

      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed ❌", {
        style: {
          borderRadius: "14px",
          background: "#7f1d1d",
          color: "#fff",
          padding: "14px",
          fontWeight: "600",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-red-700 border border-white/30 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-white">
          Welcome Back 🍰
        </h1>

        <p className="text-center text-sm text-white/90 mb-6">
          Login to order your favorite cakes
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 placeholder-gray-400 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm space-y-2 text-white">
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className="underline font-semibold">
              Register
            </Link>
          </p>

          <Link to="/" className="block opacity-80 hover:opacity-100">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

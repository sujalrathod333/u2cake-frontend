import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { registerUser } from "../api/auth";

import { useAppDispatch } from "../hook/redux.ts";

import { setCredentials } from "../store/authSlice";

const Register = () => {
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌", {
        style: {
          borderRadius: "14px",
          background: "#7f1d1d",
          color: "#fff",
          padding: "14px",
          fontWeight: "600",
        },
      });

      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
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
      toast.success(`Welcome ${userName} 🍰`, {

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
      toast.error(err.response?.data?.message || "Registration failed ❌", {
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
          Create Account 🍰
        </h1>

        <p className="text-center text-sm text-white/90 mb-6">
          Join Cake Palace & enjoy fresh cakes daily
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white text-red-600 font-medium outline-none focus:ring-2 focus:ring-white"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm space-y-2 text-white">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="underline font-semibold">
              Login
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

export default Register;

import { useEffect, useState } from "react";
import CakeCard from "../components/CakeCard";
import api from "../api/axios";

type HomeCakeCard = {
  id: string;
  name: string;
  price: number;
  image: string;
};

const Home = () => {
  const [cakes, setCakes] = useState<HomeCakeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularCakes = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/cake", {
          params: {
            limit: 3,
            sort: "newest",
          },
        });

        const serverCakes = res.data?.cakes ?? [];

        const mapped: HomeCakeCard[] = serverCakes.map((c: any) => ({
          id: String(c._id ?? c.id),
          name: String(c.name ?? ""),
          price: Number(c.price ?? 0),
          image: c?.images?.[0]?.url ?? "",
        }));

        setCakes(mapped);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load cakes");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCakes();
  }, []);

  return (
    <div className="bg-red-600 text-white min-h-screen">

      {/* HERO */}
      <section className="px-6 md:px-16 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">

          <div className="space-y-6 max-w-xl">
            <h1 className="text-5xl md:text-7xl font-extrabold">
              Cake Palace 🍰
            </h1>

            <p className="text-xl font-semibold">
              Fresh Cakes. Pure Happiness.
            </p>

            <p className="text-sm opacity-90">
              City Center’s trusted home bakery delivering fresh handmade cakes daily. Order custom cakes, same-day delivery in nearby areas, and track your orders.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition">
                Order Now
              </button>

              <button className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-red-600 transition">
                View Menu
              </button>
            </div>

            <p className="text-sm font-medium">
              🔥 Buy 1 Get 2 Offer on Selected Cakes • Custom cakes • Secure payments • Order tracking
            </p>
          </div>

          <img
            src="/pngwing.com.png"
            className="w-72 md:w-[380px] drop-shadow-2xl hover:scale-105 transition"
          />
        </div>
      </section>

      {/* INFO STRIP */}
      <div className="border-t border-b border-white/30 py-3 text-center text-sm font-medium">
        Fresh • Homemade • Delivered across City Center 🚚 • Cake Palace - Order, customize, celebrate
      </div>

      {/* FEATURES */}
      <section className="px-6 md:px-16 py-12 grid md:grid-cols-3 gap-6">

        {[
          { title: "Fresh Daily", desc: "Baked every morning with love" },
          { title: "Custom Cakes", desc: "Design your cake for any occasion" },
          { title: "Fast Delivery", desc: "Quick delivery across City Center and nearby" },
        ].map((item, i) => (
          <div
            key={i}
            className="border border-white/40 rounded-2xl p-6 hover:bg-red-700 transition"
          >
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm opacity-90 mt-2">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* POPULAR CAKES */}
      <section className="px-6 md:px-16 py-10">
        <h2 className="text-3xl font-bold mb-8">
          Popular Cakes 🍰
        </h2>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-200">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <div
                key={cake.id}
                className="border border-white/40 rounded-2xl p-4 hover:bg-red-700 transition"
              >
                <CakeCard cake={cake} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="px-6 md:px-16 py-14 border-t border-white/30">
        <div className="flex flex-col md:flex-row items-center gap-10">

          <img
            src="/pngwing.com (1).png"
            className="w-64 md:w-80 rounded-2xl border border-white/40"
          />

          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-bold">
              About Cake Palace
            </h2>

            <p className="text-sm opacity-90 leading-relaxed">
              Cake Palace is a home bakery based in City Center specializing in freshly baked, custom-designed cakes for birthdays, weddings, and corporate events. We offer online ordering, customization, and reliable delivery.
            </p>

            <p className="font-semibold">
              Made with ❤️ in City Center
            </p>
          </div>
        </div>
      </section>

    
    </div>
  );
};

export default Home;
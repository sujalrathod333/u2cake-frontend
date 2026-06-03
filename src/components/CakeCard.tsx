import { Link } from "react-router-dom";

const CakeCard = ({ cake }: any) => {
  return (
    <div className="bg-red-700 border border-white/30 rounded-2xl overflow-hidden hover:bg-red-800 transition duration-300 shadow-lg">

      {/* IMAGE */}
      <div className="relative">
        <img
          src={cake.image}
          alt={cake.name}
          className="h-52 w-full object-cover hover:scale-105 transition duration-300"
        />

        {/* PRICE BADGE */}
        <div className="absolute top-3 right-3 bg-white text-red-600 text-sm font-bold px-3 py-1 rounded-full">
          ₹{cake.price}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3 text-white">

        <h3 className="font-bold text-xl">
          {cake.name}
        </h3>

        {/* OFFER BADGE */}
        <span className="inline-block border border-white/50 text-xs px-3 py-1 rounded-full">
          🔥 Buy 1 Get 2 Offer
        </span>

        {/* BUTTON */}
        <Link
          to={`/cakes/${cake.id}`}
          className="block mt-4 text-center bg-white text-red-600 font-bold py-2 rounded-xl hover:scale-105 transition"
        >
          View Details
        </Link>

      </div>
    </div>
  );
};

export default CakeCard;
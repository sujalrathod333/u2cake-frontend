import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-red-600 text-white mt-10 border-t border-white/20">

      <div className="px-4 md:px-10 lg:px-20 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* BRAND */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold">Cake Palace 🍰</h2>

          <p className="text-sm opacity-90 leading-relaxed">
            Fresh handmade cakes delivered across City Center.
            We make every celebration sweeter with love and quality ingredients.
          </p>

          <p className="text-sm font-semibold">
            🔥 Offer: Buy 1 Get 2 on selected cakes
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Quick Links</h3>

          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/cart" className="hover:underline">Cart</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
            <li><Link to="/checkout" className="hover:underline">CheckOut</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Contact Us</h3>

          <p className="text-sm">
            📍 City Center, Central District
          </p>

          <p className="text-sm">
            📞 +91 00000 00000
          </p>

          <p className="text-sm">
            📧 hello@cakepalace.com
          </p>

          <p className="text-sm">
            🚚 Delivery available in nearby areas
          </p>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/20 py-4 text-center text-sm">
        © {new Date().getFullYear()} Cake Palace. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;
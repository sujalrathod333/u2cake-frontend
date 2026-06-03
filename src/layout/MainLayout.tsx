import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-red-600 text-white">

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 px-4 md:px-10 lg:px-20 py-6">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default MainLayout;
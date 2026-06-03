import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import CakeDetail from "./pages/CakeDetail";
import OrderPage from "./pages/Order";
import OrderById from "./components/OrderById";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Users from "./pages/admin/Users";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import CakePage from "./pages/Cake";
import Checkout from "./pages/Checkout";
import Cake from "./pages/admin/Cake";
import Category from "./pages/admin/Category";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cake" element={<CakePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/cakes/:id" element={<CakeDetail />} />
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
          <Route path="/order/:id" element={<PrivateRoute><OrderById /></PrivateRoute>} />

          {/* Redirect /order to /orders to prevent blank page */}
          <Route path="/order" element={<Navigate to="/orders" replace />} />

          {/* Catch-all route to prevent blank screens */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>



        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/cakes" element={<Cake />} />
          <Route path="/admin/categories" element={<Category />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

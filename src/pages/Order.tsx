import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../hook/redux";
import { getMyOrders } from "../api/order";
import { setOrders, setLoading, setError } from "../store/orderSlice";

const OrderPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { orders, loading, error } = useAppSelector((state) => state.order);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        dispatch(setLoading(true));
        const response = await getMyOrders();

        if (response?.success) {
          dispatch(setOrders(response.orders || []));
        }
      } catch (err: any) {
        console.error("[Order] fetch orders error:", err);
        dispatch(setError(err.response?.data?.message || "Failed to fetch orders"));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, dispatch]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLACED: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10 flex items-center justify-center">
        <p className="text-xl font-bold">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10">
      {/* HEADER */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">My Orders 🍰</h1>
      <p className="text-sm opacity-90 mb-8">View and track your cake orders</p>

      {error && (
        <div className="mb-6 bg-red-700 border border-red-400 text-white px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {(!orders || orders.length === 0) ? (
        /* EMPTY STATE */
        <div className="text-center mt-20">
          <p className="text-xl font-bold mb-6">No orders yet!</p>
          <button
            onClick={() => navigate("/cake")}
            className="bg-white text-red-600 font-bold py-3 px-8 rounded-xl hover:scale-105 transition"
          >
            Start Shopping 🛍️
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.filter(Boolean).map((order) => (

            <div key={order?._id} className="bg-red-700 border border-white/30 rounded-2xl p-6">
              {/* ORDER HEADER */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-white/30">
                <div>
                  <h2 className="text-xl font-bold">Order #{order?._id?.slice?.(-6)?.toUpperCase() || "N/A"}</h2>
                  <p className="text-sm opacity-80">

                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "N/A"}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order?.orderStatus || "")}`}>
                    {order?.orderStatus}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order?.paymentStatus || "")}`}>
                    {order?.paymentStatus}
                  </span>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div className="space-y-3 mb-4">
                {order?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-red-600/50 p-3 rounded-xl">
                    <div>
                      <p className="font-semibold">{item?.cake?.name || "Cake Deleted"}</p>
                      <p className="text-sm opacity-80">
                        Qty: {item?.quantity} × ₹{item?.price}
                      </p>
                    </div>
                    <p className="font-bold">₹{((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* ORDER SUMMARY */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/30">
                <div className="space-y-2 text-sm">
                  <h3 className="font-bold text-base">Delivery Address</h3>
                  <p className="opacity-90">{order?.shippingAddress?.address}</p>
                  <p className="opacity-90">{order?.shippingAddress?.city}, {order?.shippingAddress?.postalCode}</p>
                  <p className="opacity-90">{order?.shippingAddress?.country}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <h3 className="font-bold text-base">Order Details</h3>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order?.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-white/30 pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{order?.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-4 pt-4 border-t border-white/30">
                <button
                  onClick={() => navigate(`/order/${order?._id}`)}
                  className="text-sm opacity-80 hover:opacity-100 transition flex items-center gap-1"
                >
                  View Details & Track Status →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPage;

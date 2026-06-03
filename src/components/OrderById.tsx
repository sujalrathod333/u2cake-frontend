import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

type OrderDetailResponse = {
  success: boolean;
  order: any;
};

const OrderById = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramOrderId } = useParams<{ id: string }>();
  const orderId = paramOrderId || (location.state as any)?.orderId as string | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      if (!orderId) {
        setError("Order not found (missing orderId). Redirecting...");
        setTimeout(() => navigate("/orders"), 1200);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await api.get<OrderDetailResponse>(`/orders/${orderId}`);
        if (res.data?.success) {
          setOrder(res.data.order);
        } else {
          setError("Order not found");
        }
      } catch (e: any) {
        console.error("[OrderById] load order error:", e);
        setError(e?.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-600 text-white">
        <p className="text-xl font-bold">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-600 text-white px-4">
        <div className="bg-red-700/70 border border-white/20 rounded-2xl p-6 max-w-xl w-full">
          <h2 className="text-2xl font-extrabold mb-2 text-yellow-400">Order Loading Error</h2>
          <p className="opacity-90">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-5 bg-white text-red-600 font-bold py-2 px-4 rounded-xl hover:scale-105 transition w-full"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-red-600 text-white px-4 md:px-16 py-10">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Order Details</h1>
      <p className="text-sm opacity-90 mb-8">#{order?._id?.slice?.(-6)?.toUpperCase() || "N/A"}</p>


      <div className="bg-red-700 border border-white/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/20 border border-white/20">
            {order?.orderStatus || "N/A"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/20 border border-white/20">
            {order?.paymentStatus || "N/A"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/20 border border-white/20">
            {order?.paymentMethod || "N/A"}
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3 border-b border-white/20 pb-2">Items</h2>
          <div className="space-y-3">
            {order?.items?.map((it: any, idx: number) => (
              <div key={idx} className="bg-red-600/40 border border-white/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{it?.cake?.name || "Cake Deleted"}</p>
                  <p className="opacity-90 text-sm">Qty: {it?.quantity || 0} × ₹{it?.price || 0}</p>
                </div>
                <p className="font-bold text-lg">₹{((it?.price || 0) * (it?.quantity || 0)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 pt-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg opacity-90">Total Amount</span>
            <span className="font-extrabold text-2xl text-yellow-400">₹{order?.totalPrice?.toFixed(2) || "0.00"}</span>
          </div>

          <div className="bg-black/10 rounded-2xl p-4 border border-white/10">
            <h3 className="font-bold mb-2 text-lg">Shipping Information</h3>
            <p className="opacity-90 text-sm leading-relaxed">
              {order?.shippingAddress?.address}<br />
              {order?.shippingAddress?.city}, {order?.shippingAddress?.postalCode}<br />
              {order?.shippingAddress?.country}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/orders")}
          className="w-full mt-6 bg-white text-red-600 font-bold py-3 rounded-xl hover:scale-105 transition shadow-lg"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderById;

import { useEffect, useState } from "react";
import type { FC } from "react";
import { getDashboardData, updateOrderStatus } from "../../api/order";

interface DashboardData {
  totalUsers: number;
  totalCakes: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    items: Array<{ cake: { name: string }; quantity: number }>;
    totalPrice: number;
    orderStatus: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
  }>;
}

const Dashboard: FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardData();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PLACED: "bg-yellow-100 text-yellow-700",
      PROCESSING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-purple-100 text-purple-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6 overflow-hidden space-y-6">

        <div className="text-center py-20">
          <p className="text-xl font-bold text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 overflow-x-hidden">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error}
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders", value: data?.totalOrders || 0 },
    { label: "Pending Orders", value: data?.pendingOrders || 0 },
    { label: "Delivered Orders", value: data?.deliveredOrders || 0 },
    { label: "Total Cakes", value: data?.totalCakes || 0 },
    { label: "Total Users", value: data?.totalUsers || 0 },
    { label: "Revenue", value: `₹${(data?.totalRevenue || 0).toFixed(0)}` },
  ];

  // small inline donut chart for order status breakdown (no external lib)
  const renderStatusDonut = () => {
    const placed = data?.pendingOrders || 0;
    const delivered = data?.deliveredOrders || 0;
    const cancelled = data?.cancelledOrders || 0;
    const total = Math.max(placed + delivered + cancelled, 1);

    const ratio = (v: number) => (v / total) * 100;
    const p = ratio(placed);
    const d = ratio(delivered);
    const c = ratio(cancelled);

    // calculate stroke dasharray positions for 36px radius circle (circumference = 2πr)
    const r = 36;
    const cLen = 2 * Math.PI * r;
    const pLen = (p / 100) * cLen;
    const dLen = (d / 100) * cLen;
    const cSeg = (c / 100) * cLen;

    return (
      <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto">
        <g transform="translate(50,50)">
          <circle r={r} fill="none" stroke="#0b1220" strokeWidth="18" />
          <circle r={r} fill="none" stroke="#FBBF24" strokeWidth="18" strokeDasharray={`${pLen} ${cLen - pLen}`} strokeDashoffset={0} transform="rotate(-90)" />
          <circle r={r} fill="none" stroke="#34D399" strokeWidth="18" strokeDasharray={`${dLen} ${cLen - dLen}`} strokeDashoffset={-pLen} transform="rotate(-90)" />
          <circle r={r} fill="none" stroke="#F87171" strokeWidth="18" strokeDasharray={`${cSeg} ${cLen - cSeg}`} strokeDashoffset={-(pLen + dLen)} transform="rotate(-90)" />
          <text x="0" y="6" textAnchor="middle" className="text-xs font-semibold fill-white" style={{fontSize:10}}>{Math.round((delivered/total)*100)}%</text>
        </g>
      </svg>
    );
  };

  return (
    <div className="space-y-6 overflow-x-hidden">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-2">Welcome back, manage your cake store easily 🍰</p>
        </div>
      </div>


      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-800/80 bg-[#0b1220]/60 shadow-2xl backdrop-blur hover:bg-[#0b1220]/80 transition p-5"
          >
            <p className="text-slate-400 text-sm">{item.label}</p>
            <h2 className="text-2xl font-bold text-white mt-1">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-[#0b1220]/60 rounded-2xl shadow p-5 border border-slate-800">

          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Orders
          </h2>

          <div className="lg:hidden space-y-4">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <div key={order._id} className="rounded-3xl border border-slate-800 bg-[#0b1220]/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Order</p>
                      <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="font-semibold">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-400">Customer:</span> {order.user.name}
                    </div>
                    <div>
                      <span className="text-slate-400">Payment:</span> {order.paymentStatus}
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span> {order.orderStatus}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-[#0b1220]/80 p-6 text-center text-slate-400">
                No orders yet
              </div>
            )}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">

              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="py-3">Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody className="text-slate-300">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-[#0b1220]/40 transition">
                      <td className="py-3 font-medium">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs opacity-70">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.cake.name} (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          disabled={updatingOrderId === order._id}
                          className={`px-2 py-1 rounded text-xs font-semibold border-none cursor-pointer ${getStatusColor(
                            order.orderStatus
                          )} disabled:opacity-50`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* ORDER STATUS SUMMARY */}
        <div className="bg-[#0b1220]/60 rounded-2xl shadow p-5 border border-slate-800">

          <h2 className="text-lg font-semibold text-white mb-4">
            Order Status Summary
          </h2>

          <div className="flex items-start gap-4">
            <div className="w-24 h-24 flex items-center justify-center">
              {renderStatusDonut()}
            </div>
            <div className="flex-1 space-y-3 text-slate-300">
              <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Placed</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-yellow-400 rounded-full" style={{ width: "40px" }} />
                <span className="text-sm font-semibold">
                  {data?.pendingOrders || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processing</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-blue-400 rounded-full" style={{ width: "30px" }} />
                <span className="text-sm font-semibold">
                  {Math.floor((data?.totalOrders || 0) * 0.25)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Delivered</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-green-400 rounded-full" style={{ width: "60px" }} />
                <span className="text-sm font-semibold">
                  {data?.deliveredOrders || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-red-400 rounded-full" style={{ width: "20px" }} />
                <span className="text-sm font-semibold">
                  {data?.cancelledOrders || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-2">
              <span className="font-semibold">Total Revenue:</span>
            </p>
            <p className="text-2xl font-bold text-green-400">
              ₹{(data?.totalRevenue || 0).toFixed(0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              From {data?.totalOrders || 0} total orders
            </p>
          </div>

        </div>

      </div>

    </div>
    </div>
  );
};

export default Dashboard;

          
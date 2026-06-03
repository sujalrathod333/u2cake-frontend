import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/order";

type Order = {
  _id: string;
  user?: { name?: string; email?: string };
  items: Array<{ cake: { name: string }; quantity: number; price: number }>;
  totalPrice: number;
  orderStatus: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt?: string;
};


type OrdersResponse = {
  success: boolean;
  data: {
    orders: Order[];
    page: number;
    limit: number;
    totalPages: number;
    totalOrders: number;
  };
};

const AdminOrders: FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = (await getAllOrders(page, limit)) as OrdersResponse;
      if (!res?.success) throw new Error("Failed to load orders");

      let incoming = res.data.orders || [];

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        incoming = incoming.filter((o) => {
          const id = o._id?.toLowerCase() || "";
          const email = o.user?.email?.toLowerCase() || "";
          const name = o.user?.name?.toLowerCase() || "";
          return (
            id.includes(q) ||
            email.includes(q) ||
            name.includes(q) ||
            (o.items || []).some((it) => it?.cake?.name?.toLowerCase()?.includes(q))
          );
        });
      }


      setOrders(incoming);
      setTotalPages(res.data.totalPages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLACED: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20",
      PROCESSING: "bg-blue-500/20 text-blue-300 border border-blue-500/20",
      SHIPPED: "bg-purple-500/20 text-purple-300 border border-purple-500/20",
      DELIVERED: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20",
      CANCELLED: "bg-red-500/20 text-red-300 border border-red-500/20",
    };
    return colors[status] || "bg-white/10 text-white/70 border border-white/10";
  };

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20",
      PAID: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20",
      FAILED: "bg-red-500/20 text-red-300 border border-red-500/20",
    };
    return colors[status] || "bg-white/10 text-white/70 border border-white/10";
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (e) {
      console.error("updateOrderStatus error", e);
      setError("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const header = useMemo(() => {
    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Orders</h1>
          <p className="text-slate-400 mt-2">Track order status + payment</p>
        </div>

        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111827] border border-slate-700 rounded-2xl pl-4 pr-4 py-3 outline-none focus:border-indigo-500 transition text-white"
          />
        </div>
      </div>
    );
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6">
        <div className="py-16 text-center text-slate-300">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6">
        <div className="max-w-3xl mx-auto mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-2xl font-bold mb-2">Orders Error</h2>
          <p className="text-slate-200/90">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-5 w-full md:w-auto px-5 py-3 rounded-2xl bg-white text-red-600 font-bold hover:opacity-90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6 overflow-hidden">
      {header}

      {/* Mobile Order Cards */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-[#0b1220]/50 p-6 text-center text-slate-400">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-slate-800 bg-[#0b1220]/60 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Order</p>
                  <p className="font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="font-semibold">₹{order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400">Customer: </span>{order.user?.name || "N/A"}
                </div>
                <div>
                  <span className="text-slate-400">Payment: </span>{order.paymentStatus}
                </div>
                <div>
                  <span className="text-slate-400">Status: </span>{order.orderStatus}
                </div>
                <div className="text-slate-400">Items: {order.items.length}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block w-full bg-[#111827]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#0b1220] border-b border-slate-800">
              <tr className="text-left text-slate-400 text-sm">
                <th className="p-5">Order</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Items</th>
                <th className="p-5">Total</th>
                <th className="p-5">Order Status</th>
                <th className="p-5">Payment</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-800 hover:bg-slate-800/70 transition-all duration-200"
                  >
                    <td className="p-5 font-semibold">#{o?._id?.slice?.(-6)?.toUpperCase() || "N/A"}</td>
                    <td className="p-5">
                      <div>
                        <div className="font-semibold text-slate-100">{o.user?.name || "N/A"}</div>
                        <div className="text-sm text-slate-500">{o.user?.email || ""}</div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-slate-300">
                      <div className="space-y-1">
                        {o?.items?.map((it, idx) => (
                          <div key={idx} className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px]">
                            {it?.cake?.name || "Deleted Cake"} (x{it?.quantity || 0})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-5 font-bold">₹{o.totalPrice?.toFixed?.(2) ?? o.totalPrice}</td>
                    <td className="p-5">
                      <select
                        value={o.orderStatus}
                        disabled={updatingOrderId === o._id}
                        onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer outline-none ${getStatusColor(
                          o.orderStatus
                        )} disabled:opacity-50`}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-2 rounded-xl text-xs font-bold inline-block ${getPaymentColor(
                          o.paymentStatus
                        )}`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setError(null);
                        }}
                        className="text-indigo-300 hover:text-indigo-100 text-sm font-semibold"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-[#111827] border border-slate-700/50 p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between gap-3 mb-8">
              <div>
                <h2 className="text-3xl font-black">
                  Order Details
                </h2>
                <p className="mt-2 text-slate-400 font-medium text-xs">
                  #{selectedOrder?._id?.toUpperCase() || "N/A"}
                </p>
              </div>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition"
                onClick={() => setSelectedOrder(null)}
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0b1220] p-4 rounded-3xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</span>
                <p className={`mt-1 font-bold ${getStatusColor(selectedOrder?.orderStatus || "") || ""} inline-block px-2 py-0.5 rounded-lg text-[10px]`}>
                  {selectedOrder?.orderStatus}
                </p>
              </div>
              <div className="bg-[#0b1220] p-4 rounded-3xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Payment</span>
                <p className={`mt-1 font-bold ${getPaymentColor(selectedOrder?.paymentStatus || "") || ""} inline-block px-2 py-0.5 rounded-lg text-[10px]`}>
                  {selectedOrder?.paymentStatus}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder?.items?.map((it, idx) => (
                    <div key={idx} className="bg-[#0b1220] p-4 rounded-3xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-100">{it?.cake?.name || "Deleted Cake"}</p>
                        <p className="text-sm text-slate-500">Quantity: {it?.quantity || 0}</p>
                      </div>
                      <p className="font-black text-indigo-400">
                        ₹{(it?.price || 0) * (it?.quantity || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>


              <div className="bg-[#0b1220] p-6 rounded-[2rem] border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-400 font-bold">Total Price</span>
                  <span className="text-2xl font-black text-indigo-400">₹{selectedOrder.totalPrice}</span>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-slate-300">Customer Details</h4>
                  <p className="text-sm text-slate-400">{selectedOrder.user?.name} ({selectedOrder.user?.email})</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-[1.5rem] transition shadow-xl shadow-indigo-500/20"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-slate-400 text-sm">
          Page <span className="font-bold text-slate-200">{page}</span> of{" "}
          <span className="font-bold text-slate-200">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm outline-none text-slate-200"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;


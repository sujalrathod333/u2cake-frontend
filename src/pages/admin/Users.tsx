import type { FC } from "react";
import { useEffect, useState } from "react";

import api from "../../api/axios";

import {
  Search,
  ShieldCheck,
  ShieldX,
  Users as UsersIcon,
  Mail,
  CalendarDays,
  MoreVertical,
  Eye,
} from "lucide-react";

type UserRole = "admin" | "user";

type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
};

type UsersResponse = {
  success: boolean;

  data: {
    users: User[];
    page: number;
    limit: number;
    totalPages: number;
    totalUsers: number;
  };
};

const Users: FC = () => {
  const [users, setUsers] = useState<
    User[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    verified: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get<UsersResponse>("/admin/users");
      console.log("[Admin/Users] API Response:", response);
      console.log("[Admin/Users] response.data:", response.data);
      console.log("[Admin/Users] response.data.data:", response.data.data);

      const usersData = response.data?.data?.users || [];
      console.log("[Admin/Users] usersData:", usersData);
      
      setUsers(usersData);

      setStats({
        total: response.data?.data?.totalUsers || usersData.length,
        admins: usersData.filter((u) => u.role === "admin").length,
        users: usersData.filter((u) => u.role === "user").length,
        verified: usersData.filter((u) => u.isVerified).length,
      });
    } catch (error: any) {
      console.error("[Admin/Users] Fetch error:", error);
      console.error("[Admin/Users] Error response:", error?.response);
      console.error("[Admin/Users] Error message:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      user.email
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const handleBanUser = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.patch(`/admin/users/${id}/ban`);
      console.log("[Admin/Users] Ban response:", res);

      const updatedUser = res.data?.user;
      console.log("[Admin/Users] Updated user:", updatedUser);
      
      if (updatedUser) {
        setUsers((prev) => prev.map((u) => (u._id === id ? updatedUser : u)));
        setSelectedUser(updatedUser);
      }
    } catch (err: any) {
      console.error("[Admin/Users] Ban error:", err);
      console.error("[Admin/Users] Ban error response:", err?.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0b1120] via-[#111827] to-[#0f172a] text-white px-4 md:px-6 py-6 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Users Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Manage all platform users
            with analytics 🚀
          </p>
        </div>

        <div className="relative w-full lg:w-80">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-[#111827] border border-slate-700 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-indigo-500 transition"
          />

        </div>

      </div>
      {/* MOBILE: simple cards for small screens */}
      <div className="md:hidden grid gap-4 mt-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-slate-400 text-sm">{user.email}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold">{user.role}</div>
                <div className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)} className="px-3 py-1 rounded-xl bg-slate-800">Actions</button>
              <button onClick={() => handleBanUser(user._id)} className="px-3 py-1 rounded-xl bg-amber-500 text-black">{user.isBlocked ? 'Unban' : 'Ban'}</button>
            </div>
          </div>
        ))}
      </div>
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-indigo-100 text-sm">
                Total Users
              </p>

              <h2 className="text-4xl font-black mt-2">
                {stats.total}
              </h2>
            </div>

            <UsersIcon size={40} />

          </div>

        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-6 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-pink-100 text-sm">
                Admins
              </p>

              <h2 className="text-4xl font-black mt-2">
                {stats.admins}
              </h2>
            </div>

            <ShieldCheck size={40} />

          </div>

        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-cyan-100 text-sm">
                Customers
              </p>

              <h2 className="text-4xl font-black mt-2">
                {stats.users}
              </h2>
            </div>

            <UsersIcon size={40} />

          </div>

        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-6 shadow-2xl">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-emerald-100 text-sm">
                Verified
              </p>

              <h2 className="text-4xl font-black mt-2">
                {stats.verified}
              </h2>
            </div>

            <ShieldCheck size={40} />

          </div>

        </div>

      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block w-full bg-[#111827]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-[#0b1220] border-b border-slate-800">

              <tr className="text-left text-slate-400 text-sm">

                <th className="p-5">
                  User
                </th>

                <th className="p-5">
                  Email
                </th>

                <th className="p-5">
                  Role
                </th>

                <th className="p-5">
                  Status
                </th>

                <th className="p-5">
                  Joined
                </th>

                <th className="p-5">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-20 text-slate-400"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-20 text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(
                  (user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-800 hover:bg-slate-800/70 transition-all duration-200"
                    >

                      {/* USER */}
                      <td className="p-5">

                        <div className="flex items-center gap-4">

                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg shadow-lg">
                            {user.name
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>

                            <h2 className="font-semibold text-slate-100">
                              {
                                user.name
                              }
                            </h2>

                            <p className="text-sm text-slate-500">
                              ID:{" "}
                              {user._id.slice(
                                -6
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}
                      <td className="p-5">

                        <div className="flex items-center gap-2 text-slate-300">

                          <Mail size={16} />

                          {user.email}

                        </div>

                      </td>

                      {/* ROLE */}
                      <td className="p-5">

                        <span
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide ${
                            user.role ===
                            "admin"
                              ? "bg-pink-500/20 text-pink-400 border border-pink-500/20"
                              : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                          }`}
                        >
                          {
                            user.role
                          }
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="p-5">

                        {user.isVerified ? (
                          <span className="flex items-center gap-2 text-emerald-400 font-medium">
                            <ShieldCheck
                              size={18}
                            />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-400 font-medium">
                            <ShieldX
                              size={18}
                            />
                            Unverified
                          </span>
                        )}

                      </td>

                      {/* DATE */}
                      <td className="p-5 text-slate-400">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={16}
                          />

                          {new Date(
                            user.createdAt
                          ).toLocaleDateString()}

                        </div>

                      </td>

                      {/* ACTIONS */}
                      <td className="p-5 relative">

                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu ===
                                user._id
                                ? null
                                : user._id
                            )
                          }
                          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                        >
                          <MoreVertical
                            size={18}
                          />
                        </button>

                        {openMenu ===
                          user._id && (
                          <div className="absolute right-10 top-16 z-50 w-56 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

                            <button onClick={() => setSelectedUser(user)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-sm">
                              <Eye size={16} />
                              View Profile
                            </button>

                            <button
                              onClick={() => handleBanUser(user._id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-sm text-amber-400"
                            >
                              <ShieldX size={16} />
                              {user.isBlocked ? "Unban User" : "Ban User"}
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#0b1220] rounded-2xl border border-slate-800 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-300">Close</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{selectedUser.name}</div>
                  <div className="text-sm text-slate-400">{selectedUser.email}</div>
                  <div className="text-sm text-slate-400">Role: {selectedUser.role}</div>
                  <div className="text-sm text-slate-400">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                  <div className="text-sm text-slate-400">Status: {selectedUser.isBlocked ? 'Blocked' : (selectedUser.isVerified ? 'Verified' : 'Unverified')}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleBanUser(selectedUser._id)} className="px-4 py-2 rounded bg-amber-500 text-black">{selectedUser.isBlocked ? 'Unban' : 'Ban'}</button>
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 rounded bg-slate-700">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
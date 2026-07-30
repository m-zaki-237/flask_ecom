import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Users as UsersIcon, Search, Trash2, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error loading users",
        description: "Failed to load user directory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/user/delete/${deleteId}`);
      toast({
        title: "User Deleted",
        description: `User #${deleteId} removed`,
        variant: "success",
      });
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast({
        title: "Deletion Failed",
        description: "Could not remove user account",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName[0] : "U";
    const l = lastName ? lastName[0] : "";
    return (f + l).toUpperCase();
  };

  const getRoleChip = (role) => {
    const r = role?.toLowerCase();
    switch (r) {
      case "admin": return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-full uppercase">Super Admin</span>;
      case "seller": return <span className="px-3 py-1 bg-[#F4EFEA] text-[#B8865B] border border-[#E8E5DF] text-xs font-bold rounded-full uppercase">Merchant / Seller</span>;
      default: return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">Client / Buyer</span>;
    }
  };

  const filteredUsers = users.filter((u) =>
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id?.toString().includes(searchQuery)
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8865B]">USER MANAGEMENT</span>
            <h1 className="text-3xl font-serif-editorial font-bold text-[#1A1A1A] mt-1">
              Platform User Directory
            </h1>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, or user ID..."
              className="w-full bg-white border border-[#E8E5DF] rounded-xl pl-10 pr-4 py-3 text-xs text-[#1A1A1A] placeholder-[#71717A] focus:outline-none focus:border-[#B8865B] shadow-sm"
            />
          </div>
          <span className="text-xs font-semibold text-[#52525B]">
            Registered Accounts: <strong className="text-[#1A1A1A]">{filteredUsers.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#71717A] animate-pulse">Loading user directory...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <UsersIcon className="h-12 w-12 text-[#B8865B] mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-[#1A1A1A]">No Users Found</h3>
              <p className="text-xs text-[#6B6B6B]">No accounts match your current search parameter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E5DF] text-[#71717A] uppercase bg-[#F8F7F4]">
                    <th className="p-4 font-bold">User ID</th>
                    <th className="p-4 font-bold">Name</th>
                    <th className="p-4 font-bold">Email Address</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#F8F7F4] text-[#1A1A1A] transition-colors">
                      <td className="p-4 font-bold text-[#B8865B]">#{u.user_id}</td>
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-[#F4EFEA] border border-[#E8E5DF] text-[#B8865B] font-bold text-xs flex items-center justify-center rounded-xl">
                            {getInitials(u.first_name, u.last_name)}
                          </div>
                          <span>{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#52525B]">{u.email}</td>
                      <td className="p-4">{getRoleChip(u.role)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteId(u.user_id)}
                          className="p-2 border border-[#E8E5DF] bg-[#F8F7F4] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete User Modal */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white border border-[#E8E5DF] rounded-2xl text-[#1A1A1A] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
          <DialogHeader className="pb-3 border-b border-[#E8E5DF] flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold font-serif-editorial text-[#1A1A1A]">Confirm Account Removal</DialogTitle>
            <button onClick={() => setDeleteId(null)} className="p-2 text-gray-400 hover:text-[#1A1A1A] hover:bg-[#F8F7F4] rounded-xl">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <p className="text-xs text-[#6B6B6B]">
            Are you sure you want to delete User Account #{deleteId}? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 border border-[#E8E5DF] bg-[#F8F7F4] text-xs font-semibold text-[#1A1A1A] rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 shadow-md"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;

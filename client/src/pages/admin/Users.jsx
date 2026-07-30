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
      case "admin": return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] uppercase font-bold">SUPER ADMIN</span>;
      case "seller": return <span className="px-2.5 py-1 bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/40 text-[10px] uppercase font-bold">MERCHANT / SELLER</span>;
      default: return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold">CLIENT / BUYER</span>;
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
      <div className="space-y-8 pb-16 font-mono-tech">
        {/* Header */}
        <div className="border border-[#282630] bg-[#16151a] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono-tech uppercase tracking-widest text-[#d4a373]">USER DIRECTORY</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mt-1">
              PLATFORM USER ACCOUNTS
            </h1>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#282630] pb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#6c697b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH NAME, EMAIL, OR USER ID..."
              className="w-full bg-[#0f0e13] border border-[#282630] pl-9 pr-4 py-2.5 text-xs font-mono-tech text-white placeholder-[#6c697b] focus:outline-none focus:border-[#d4a373]"
            />
          </div>
          <span className="text-xs font-mono-tech text-[#6c697b] uppercase">
            REGISTERED ACCOUNTS: <strong className="text-white">{filteredUsers.length}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="border border-[#282630] bg-[#16151a] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#6c697b] animate-pulse">LOADING USER DIRECTORY...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <UsersIcon className="h-10 w-10 text-[#6c697b] mx-auto" />
              <h3 className="text-base font-bold uppercase text-white">NO USERS FOUND</h3>
              <p className="text-xs text-[#6c697b]">No user accounts match your search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#282630] text-[#6c697b] uppercase bg-[#0f0e13]">
                    <th className="p-4 font-bold">USER ID</th>
                    <th className="p-4 font-bold">NAME</th>
                    <th className="p-4 font-bold">EMAIL ADDRESS</th>
                    <th className="p-4 font-bold">ROLE</th>
                    <th className="p-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282630]">
                  {filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-[#1c1b22] text-white">
                      <td className="p-4 font-bold text-[#d4a373]">#{u.user_id}</td>
                      <td className="p-4 font-bold uppercase">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 bg-[#282630] border border-[#d4a373] text-[#d4a373] font-bold text-[10px] flex items-center justify-center">
                            {getInitials(u.first_name, u.last_name)}
                          </div>
                          <span>{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#a19fad]">{u.email}</td>
                      <td className="p-4">{getRoleChip(u.role)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteId(u.user_id)}
                          className="p-2 border border-[#282630] bg-[#0f0e13] text-[#6c697b] hover:text-red-400 hover:border-red-400"
                          title="Delete User"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
        <div className="bg-[#16151a] border border-[#282630] text-white p-6 max-w-md w-full font-mono-tech text-xs space-y-4">
          <DialogHeader className="pb-2 border-b border-[#282630] flex flex-row items-center justify-between">
            <DialogTitle className="text-base uppercase font-bold text-white">CONFIRM ACCOUNT REMOVAL</DialogTitle>
            <button onClick={() => setDeleteId(null)} className="p-1 text-[#6c697b] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <p className="text-xs text-[#a19fad]">
            Are you sure you want to delete User Account #{deleteId}? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2 border border-[#282630] bg-[#0f0e13] text-white uppercase"
            >
              CANCEL
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 bg-red-500 text-white font-bold uppercase hover:bg-red-600"
            >
              DELETE ACCOUNT
            </button>
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;

import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/axios";
import { Users as UsersIcon, Search, Trash2, AlertCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
      await api.delete(`/users/${deleteId}`);
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

  const getRoleBadge = (role) => {
    const r = role?.toLowerCase();
    switch (r) {
      case "admin": return <Badge variant="destructive">Admin</Badge>;
      case "seller": return <Badge variant="info">Seller</Badge>;
      default: return <Badge variant="success">Customer</Badge>;
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">User Accounts</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Directory of registered customers, sellers, and system administrators</p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or user ID..."
              className="pl-9 border-none shadow-none focus-visible:ring-0 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-[#64748B] pr-2 hidden sm:inline">
            Total {filteredUsers.length} accounts
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <UsersIcon className="h-10 w-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="font-semibold text-[#0F172A] text-sm">No Users Found</h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                No user accounts match your search parameters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-xs font-bold text-[#0F172A]">
                      #{user.user_id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#E0F2FE] text-[#0369A1] font-bold text-xs flex items-center justify-center border border-[#BAE6FD] shrink-0">
                          {getInitials(user.first_name, user.last_name)}
                        </div>
                        <span className="font-semibold text-[#0F172A] text-sm">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-[#475569]">
                      {user.email}
                    </TableCell>

                    <TableCell>{getRoleBadge(user.role)}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#475569]">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownMenuItem destructive onClick={() => setDeleteId(user.user_id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#DC2626] font-semibold text-sm">
            <AlertCircle className="h-5 w-5" />
            <span>Confirm Account Removal</span>
          </div>
          <DialogTitle className="mt-1">Delete User Account #{deleteId}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The user account will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete User Account
          </Button>
        </div>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;

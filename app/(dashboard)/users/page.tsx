"use client";

import React, { useEffect, useState } from "react";
import { useAuth, hasPermission, PERMISSIONS, ROLES } from "@/app/contexts/AuthContext";
import { getUsers, getUserStats, updateUserStatus, type AdminUser, type UserStats } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Search, Filter, Eye, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check permissions
  const canManageUsers = hasPermission(user?.roles || [], PERMISSIONS.MANAGE_USERS);
  const canUpdateUserRoles = hasPermission(user?.roles || [], PERMISSIONS.UPDATE_USER_ROLES);
  const canActivateDeactivateUsers = hasPermission(user?.roles || [], PERMISSIONS.ACTIVATE_DEACTIVATE_USERS);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, statsResponse] = await Promise.all([
        getUsers({
          page: currentPage,
          per_page: 20,
          search: searchTerm || undefined,
          role_filter: roleFilter === "all" ? undefined : roleFilter || undefined,
          status_filter: statusFilter === "all" ? undefined : statusFilter || undefined,
        }),
        getUserStats()
      ]);

      setUsers(usersResponse.users);
      setStats(statsResponse);
      setTotalPages(usersResponse.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      loadUsers();
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, canManageUsers]);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, { is_active: !currentStatus });
      await loadUsers(); // Reload the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user status");
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const primaryRole = roles[0] || ROLES.VISITOR;
    const variant = primaryRole === ROLES.ADMIN ? "destructive" :
                   primaryRole === ROLES.ORGANIZER ? "default" :
                   primaryRole === ROLES.PARTICIPANT ? "secondary" : "outline";

    return <Badge variant={variant}>{primaryRole}</Badge>;
  };

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage users.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage user accounts and permissions</p>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Users Table Skeleton */}
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
              <p className="text-sm text-gray-600">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.admin_users + stats.organizer_users}</div>
              <p className="text-sm text-gray-600">Staff Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.participant_users}</div>
              <p className="text-sm text-gray-600">Participants</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Organizer">Organizer</SelectItem>
            <SelectItem value="Participant">Participant</SelectItem>
            <SelectItem value="Visitor">Visitor</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 && !loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                        {user.firstname && user.lastname
                          ? `${user.firstname} ${user.lastname}`
                        : user.username || "N/A"
                        }
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.roles)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.date_joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                    <Link href={`/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {canActivateDeactivateUsers && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        className={user.is_active ? "text-red-600" : "text-green-600"}
                      >
                        {user.is_active ? (
                              <UserX className="h-4 w-4" />
                        ) : (
                              <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
              size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
              <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

          <Button
            variant="outline"
              size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
              <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { getUserDetails, updateUserStatus, updateUserRoles, type AdminUser } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Edit, UserCheck, UserX, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";
import { showToast } from "@/lib/utils/toast";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const userId = params.id as string;

  const canActivateDeactivateUsers = hasPermission(user?.roles || [], PERMISSIONS.ACTIVATE_DEACTIVATE_USERS);
  const canUpdateUserRoles = hasPermission(user?.roles || [], PERMISSIONS.UPDATE_USER_ROLES);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setError(null);
        const userDetails = await getUserDetails(userId);
        setUserData(userDetails);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load user";
        console.error("User details error:", err);
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  const handleStatusToggle = async () => {
    if (!userData) return;

    try {
      setActionLoading(true);
      await updateUserStatus(userData.id, { is_active: !userData.is_active });
      setUserData({ ...userData, is_active: !userData.is_active });
      showToast.success(`User ${!userData.is_active ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user status";
      console.error("Update user status error:", err);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (roles: string[]) => {
    const roleColors = {
      Admin: "destructive",
      Organizer: "default",
      Participant: "secondary",
      Visitor: "outline"
    } as const;

    return (
      <div className="flex gap-1">
        {roles.map((role) => (
          <Badge key={role} variant={roleColors[role as keyof typeof roleColors] || "outline"}>
            {role}
          </Badge>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">{error || "User not found"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/users")}
            >
              Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {userData.firstname && userData.lastname
              ? `${userData.firstname} ${userData.lastname}`
              : userData.username || "User"
            }
          </h1>
          <p className="text-gray-600">User Details</p>
        </div>

        <div className="flex gap-2">
          {canActivateDeactivateUsers && (
            <Button
              variant="outline"
              onClick={handleStatusToggle}
              disabled={actionLoading}
              className={userData.is_active ? "text-red-600" : "text-green-600"}
            >
              {userData.is_active ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          )}

          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </div>
      </div>

      {/* Status and Roles */}
      <div className="flex items-center gap-4">
        <Badge variant={userData.is_active ? "default" : "secondary"}>
          {userData.is_active ? "Active" : "Inactive"}
        </Badge>
        {getRoleBadge(userData.roles)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Username</label>
              <p className="text-sm font-mono">{userData.username || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-sm">{userData.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-sm">
                {userData.firstname && userData.lastname
                  ? `${userData.firstname} ${userData.lastname}`
                  : "N/A"
                }
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Joined
              </label>
              <p className="text-sm">{new Date(userData.date_joined).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData.profile ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <p className="text-sm">{userData.profile.phone || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-sm">{userData.profile.gender || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Enrollment No</label>
                  <p className="text-sm font-mono">{userData.profile.enrollment_no || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-sm">{userData.profile.department || "N/A"}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No profile information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      {userData.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="text-sm">{userData.address.country || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <p className="text-sm">{userData.address.state || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-sm text-gray-600">Events Attended</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-sm text-gray-600">Certificates</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-sm text-gray-600">Feedback Given</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">Events Created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

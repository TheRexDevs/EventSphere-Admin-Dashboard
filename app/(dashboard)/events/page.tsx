"use client";

import React, { useEffect, useState } from "react";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { getEvents, type Event } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check permissions
  const canCreateEvent = hasPermission(user?.roles || [], PERMISSIONS.CREATE_EVENT);
  const canEditEvent = hasPermission(user?.roles || [], PERMISSIONS.EDIT_EVENT);
  const canDeleteEvent = hasPermission(user?.roles || [], PERMISSIONS.DELETE_EVENT);
  const canApproveEvent = hasPermission(user?.roles || [], PERMISSIONS.APPROVE_EVENT);
  const canPublishEvent = hasPermission(user?.roles || [], PERMISSIONS.PUBLISH_EVENT);

  // Helpers to determine ownership (speculative: compare organizer_id to user?.id if available)
  const isOwner = (event: Event) => {
    // If user has an id on auth user object
    // Fallback to false if not available
    // @ts-expect-error User type may not include id explicitly
    return user?.id ? event.organizer_id === user.id : false;
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getEvents({
        page: currentPage,
        per_page: 20,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter || undefined,
      });

      setEvents(response.events);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentPage, searchTerm, statusFilter]);

  const getStatusBadge = (status: string, isPublished?: boolean) => {
    const published = !!isPublished;
    switch (status) {
      case "approved":
        return <Badge variant={published ? "default" : "secondary"}>
          {published ? "Published" : "Approved"}
        </Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Events Management</h1>
            <p className="text-gray-600">Manage and oversee all events</p>
          </div>
          {canCreateEvent && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-gray-600">Manage and oversee all events</p>
        </div>
        {canCreateEvent && (
          <Link href="/events/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
        {events.length === 0 && !loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No events found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <Link href={`/events/${event.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.category_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-gray-500">{event.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.capacity}/{event.max_participants}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(event.status, Boolean(event.is_published))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Admin: Approve/Decline on pending */}
                    {canApproveEvent && event.status === "pending" ? (
                      <>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </>
                    ) : null}

                    {/* Organizer: Edit/Delete own events only (actions moved to details page generally) */}
                    {isOwner(event) && canEditEvent && (
                      <Link href={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {isOwner(event) && canDeleteEvent && (
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Link>
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

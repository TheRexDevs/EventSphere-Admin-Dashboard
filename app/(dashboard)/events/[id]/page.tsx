"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { getEventDetails, approveEvent, declineEvent, publishEvent, deleteEvent, type Event, type EventImage } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Edit, Trash2, CheckCircle, XCircle, Calendar, MapPin, Users, Clock, Image as ImageIcon, User, Mail, Globe, Eye } from "lucide-react";
import { Skeleton } from "@/app/components/ui/skeleton";
import Link from "next/link";
import { showToast } from "@/lib/utils/toast";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const eventId = (params as { id?: string }).id ?? (Array.isArray((params as any).id) ? (params as any).id[0] : (params as any).id);

  const canEditEvent = hasPermission(user?.roles || [], PERMISSIONS.EDIT_EVENT);
  const canApproveEvent = hasPermission(user?.roles || [], PERMISSIONS.APPROVE_EVENT);
  const canPublishEvent = hasPermission(user?.roles || [], PERMISSIONS.PUBLISH_EVENT);
  const canDeleteEvent = hasPermission(user?.roles || [], PERMISSIONS.DELETE_EVENT);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setError(null);
        const eventData = await getEventDetails(eventId);
        setEvent(eventData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load event";
        console.error("Event details error:", err);
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleApproveEvent = async () => {
    if (!event) return;

    try {
      setActionLoading(true);
      await approveEvent(event.id);
      setEvent({ ...event, status: "approved" });
      showToast.success("Event approved successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve event";
      console.error("Approve event error:", err);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineEvent = async () => {
    if (!event) return;

    if (!confirm("Are you sure you want to decline this event? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      await declineEvent(event.id);
      setEvent({ ...event, status: "cancelled" });
      showToast.success("Event declined successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decline event";
      console.error("Decline event error:", err);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!event) return;

    try {
      setActionLoading(true);
      await publishEvent(event.id);
              setEvent({ ...event, is_published: !(event.is_published ?? false) });
      showToast.success(`Event ${!event.is_published ? "published" : "unpublished"} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update publish status";
      console.error("Publish event error:", err);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;

    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteEvent(event.id);
      showToast.success("Event deleted successfully");
      router.push("/events");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event";
      console.error("Delete event error:", err);
      showToast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, isPublished?: boolean) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      approved: { variant: "default" as const, label: "Approved", color: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { variant: "destructive" as const, label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };

    return (
      <div className="flex items-center gap-2">
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
          {config.label}
        </div>
        {status === "approved" && isPublished !== undefined && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
            isPublished 
              ? "bg-blue-100 text-blue-800 border-blue-200" 
              : "bg-gray-100 text-gray-600 border-gray-200"
          }`}>
            {isPublished ? "Published" : "Draft"}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return 'Time not specified';
    
    const timeParts = timeStr.split(':');
    if (timeParts.length < 2) return timeStr;
    
    const [hours, minutes] = timeParts;
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Event Details</h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">{error || "Event not found"}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/events")}
            >
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        {event.featured_image && (
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <img
              src={event.featured_image.url}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        
        <div className={`relative ${event.featured_image ? 'text-white p-8' : 'p-0'}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <p className={`text-lg ${event.featured_image ? 'text-gray-200' : 'text-gray-600'}`}>
                  {formatDate(event.date)} at {formatTime(event.time)}
                </p>
              </div>
              
              {getStatusBadge(event.status, event.is_published)}
            </div>

            <div className="flex gap-2 ml-6">
              {canEditEvent && event && (
                <Link href={`/events/${event.id}/edit`}>
                  <Button variant={event.featured_image ? "secondary" : "outline"}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Event
                  </Button>
                </Link>
              )}

              {canApproveEvent && event.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    onClick={handleApproveEvent}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleDeclineEvent}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}

              {canPublishEvent && event.status === "approved" && (
                <Button
                  variant={event.featured_image ? "secondary" : "outline"}
                  onClick={handlePublishToggle}
                  disabled={actionLoading}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {event.is_published ? "Unpublish" : "Publish"}
                </Button>
              )}

              {canDeleteEvent && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={actionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                About This Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Gallery Images */}
          {event.gallery_images && event.gallery_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Event Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery_images.map((image) => (
                    <div key={image.id} className="relative group cursor-pointer">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-32 object-cover rounded-lg border transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        
          {/* Organizer & Timeline */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Organizer Information */}
            {event.organizer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Event Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {event.organizer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{event.organizer.full_name}</p>
                      <p className="text-sm text-gray-600">@{event.organizer.username}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {event.organizer.email}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm">{new Date(event.created_at).toLocaleString()}</p>
                </div>
                {event.updated_at && event.updated_at !== event.created_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm">{new Date(event.updated_at).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Event ID</p>
                  <p className="text-xs font-mono text-gray-500 break-all">{event.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                  <p className="text-sm text-gray-600">{formatTime(event.time)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-gray-600">
                    {event.capacity} total capacity
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.max_participants} max participants
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Category</p>
                <Badge variant="outline" className="text-sm">
                  {event.category || event.category_id}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Organizer and Timeline moved to left column */}
        </div>
      </div>
    </div>
  );
}
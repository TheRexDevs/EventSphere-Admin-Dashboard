"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { getEventDetails, updateEventWithFiles, type Event, type UpdateEventFormData } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Save, Calendar, MapPin } from "lucide-react";
import { showToast } from "@/lib/utils/toast";
import FieldWrapper from "@/app/components/common/field-wrapper";
import { Form } from "@/app/components/ui/form";
import { FileUpload } from "@/app/components/ui/file-upload";
import Image from "next/image";

// Validation schema for event form (text fields only)
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  venue: z.string().min(1, "Venue is required").max(200, "Venue must be less than 200 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(10000, "Capacity must be less than 10,000"),
  max_participants: z.number().min(1, "Max participants must be at least 1").max(10000, "Max participants must be less than 10,000"),
  category_id: z.string().min(1, "Category is required"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredImage, setFeaturedImage] = useState<File | undefined>(undefined);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  const eventId = params.id as string;

  const canEditEvent = hasPermission(user?.roles || [], PERMISSIONS.EDIT_EVENT);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      capacity: 0,
      max_participants: 0,
      category_id: "",
    },
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setError(null);
        const eventData = await getEventDetails(eventId);
        setEvent(eventData);

        // Pre-fill form with event data
        form.reset({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          venue: eventData.venue,
          capacity: eventData.capacity,
          max_participants: eventData.max_participants,
          category_id: eventData.category_id,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load event";
        console.error("Load event error:", err);
        setError(errorMessage);
        showToast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && canEditEvent) {
      loadEvent();
    }
  }, [eventId, canEditEvent, form]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setSaving(true);
      setError(null);

      // Prepare data for API with files
      const updateData: UpdateEventFormData = {
        ...data,
        featured_image: featuredImage,
        gallery_images: galleryImages.length > 0 ? galleryImages : undefined,
      };

      await updateEventWithFiles(eventId, updateData);
      showToast.success("Event updated successfully");

      // Redirect back to event details
      router.push(`/events/${eventId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update event";
      console.error("Update event error:", err);
      showToast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  if (!canEditEvent) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">You can&apos;t edit events.</p>
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
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-gray-600">Update event details</p>
        </div>

        <Button
          type="submit"
          form="event-form"
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Form {...form}>
        <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldWrapper
                    control={form.control}
                    name="title"
                    label="Event Title"
                    type="text"
                    placeholder="Enter event title"
                  />

                  <FieldWrapper
                    control={form.control}
                    name="description"
                    label="Description"
                    type="textarea"
                    placeholder="Enter event description"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FieldWrapper
                      control={form.control}
                      name="date"
                      label="Date"
                      type="date"
                    />

                    <FieldWrapper
                      control={form.control}
                      name="time"
                      label="Time"
                      type="time"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Venue & Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venue & Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FieldWrapper
                    control={form.control}
                    name="venue"
                    label="Venue"
                    type="text"
                    placeholder="Enter venue location"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FieldWrapper
                      control={form.control}
                      name="capacity"
                      label="Capacity"
                      type="number"
                      placeholder="Max attendees"
                    />

                    <FieldWrapper
                      control={form.control}
                      name="max_participants"
                      label="Max Participants"
                      type="number"
                      placeholder="Max registrations"
                    />
                  </div>

                  <FieldWrapper
                    control={form.control}
                    name="category_id"
                    label="Category"
                    type="text"
                    placeholder="Enter category"
                  />
                </CardContent>
              </Card>

              {/* Gallery Images (Optional) */}
              <Card>
                <CardHeader>
                  <CardTitle>Gallery Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Gallery Images */}
                  {event?.gallery_images && event.gallery_images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Current Gallery Images</label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {event.gallery_images.map((image) => (
                          <Image
                            key={image.id}
                            src={image.url}
                            alt={image.filename}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery Images Upload */}
                  <div>
                    <label className="text-sm font-medium">Gallery Images</label>
                    <div className="mt-2">
                      <FileUpload
                        accept="image/*"
                        multiple={true}
                        maxSize={10}
                        files={galleryImages}
                        onFilesChange={setGalleryImages}
                        label="Upload Gallery Images"
                        helperText="Upload multiple images for the event gallery, max 10MB each"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery moved to left column */}
            </div>

            {/* Right column - Images */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Event Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Featured Image */}
                  {event?.featured_image && (
                    <div>
                      <label className="text-sm font-medium">Current Featured Image</label>
                      <div className="mt-2">
                        <Image
                          src={event.featured_image.url}
                          alt="Current featured image"
                          width={400}
                          height={192}
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                      </div>
                    </div>
                  )}

                  {/* Featured Image Upload */}
                  <div>
                    <label className="text-sm font-medium">
                      {event?.featured_image ? "Replace Featured Image" : "Featured Image"}
                    </label>
                    <div className="mt-2">
                      <FileUpload
                        accept="image/*"
                        multiple={false}
                        maxSize={10}
                        files={featuredImage ? [featuredImage] : []}
                        onFilesChange={(files) => setFeaturedImage(files[0] || undefined)}
                        label="Upload Featured Image"
                        helperText="Recommended: 1920x1080px, max 10MB (JPEG, PNG, WebP)"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

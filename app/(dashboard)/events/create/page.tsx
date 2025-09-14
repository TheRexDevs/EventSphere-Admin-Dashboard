"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, hasPermission, PERMISSIONS } from "@/app/contexts/AuthContext";
import { createEventWithFiles, type CreateEventFormData } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { FileUpload } from "@/app/components/ui/file-upload";
import { Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/lib/utils/toast";

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check permissions
  const canCreateEvent = hasPermission(user?.roles || [], PERMISSIONS.CREATE_EVENT);

  const [formData, setFormData] = useState<CreateEventFormData>({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: 0,
    max_participants: 0,
    category_id: "",
    featured_image: undefined,
    gallery_images: [],
  });

  if (!canCreateEvent) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">You can&apos;t create events.</p>
            <Link href="/events">
              <Button className="mt-4">
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // reset transient state

      // Basic validation
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.description.trim()) throw new Error("Description is required");
      if (!formData.date) throw new Error("Date is required");
      if (!formData.time) throw new Error("Time is required");
      if (!formData.venue.trim()) throw new Error("Venue is required");
      if (formData.capacity <= 0) throw new Error("Capacity must be greater than 0");
      if (formData.max_participants <= 0) throw new Error("Max participants must be greater than 0");
      if (formData.max_participants > formData.capacity) {
        throw new Error("Max participants cannot exceed capacity");
      }

      await createEventWithFiles(formData);
      showToast.success("Event created successfully!");
      router.push("/events");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create event";
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = <K extends keyof CreateEventFormData>(field: K, value: CreateEventFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-gray-600">Fill in the details to create a new event</p>
      </div>

      {/* Error Message */}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => handleInputChange("venue", e.target.value)}
                      placeholder="Enter venue location"
                      required
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Venue Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity || ""}
                      onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                      placeholder="Enter venue capacity"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants *</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      min="1"
                      value={formData.max_participants || ""}
                      onChange={(e) => handleInputChange("max_participants", parseInt(e.target.value) || 0)}
                      placeholder="Enter max participants"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Event Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange("category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter event description"
                    rows={6}
                    required
                  />
                </div>

                {/* Gallery Images (Optional) */}
                <div className="space-y-4">
                  <Label>Gallery Images (Optional)</Label>
                  <FileUpload
                    accept="image/*"
                    multiple={true}
                    maxSize={10}
                    files={formData.gallery_images || []}
                    onFilesChange={(files) => handleInputChange("gallery_images", files)}
                    label="Upload Gallery Images"
                    helperText="Upload multiple images for the event gallery, max 10MB each"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Right column - Images */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Featured Image (Optional) */}
                    <div className="space-y-4">
                      <Label>Featured Image (Optional)</Label>
                      <FileUpload
                        accept="image/*"
                        multiple={false}
                        maxSize={10}
                        files={formData.featured_image ? [formData.featured_image] : []}
                        onFilesChange={(files) => handleInputChange("featured_image", files[0] || undefined)}
                        label="Upload Featured Image"
                        helperText="Recommended: 1920x1080px, max 10MB (JPEG, PNG, WebP)"
                        disabled={loading}
                      />
                    </div>

                    {/* Gallery moved to left column */}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-2">
              <Link href="/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

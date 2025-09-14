/**
 * Event management API functions
 */

import {
  ApiResponse,
  BasicResponse,
} from "@/types/auth";
import { apiPost, apiGet, apiPut, apiDelete, tokenManager, apiPostForm, apiPutForm } from "@/lib/utils/api";

// Event types based on API documentation
export interface EventImage {
  id: string;
  url: string;
  thumbnail_url: string;
  filename: string;
  width: number;
  height: number;
  file_type?: string;
  created_at: string;
}

export interface EventOrganizer {
  id: string;
  username: string;
  email: string;
  full_name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  max_participants: number;
  category: string;
  category_id: string;
  organizer_id: string;
  organizer?: EventOrganizer;
  status: 'pending' | 'approved' | 'cancelled';
  is_published?: boolean;
  featured_image_url?: string;
  gallery_image_urls?: string[];
  featured_image?: EventImage;
  gallery_images?: EventImage[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  max_participants: number;
  category_id: string;
  featured_image_url?: string;
  gallery_image_urls?: string[];
}

export interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  max_participants: number;
  category_id: string;
  featured_image?: File;
  gallery_images?: File[];
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: 'pending' | 'approved' | 'cancelled';
  is_published?: boolean;
}

export interface UpdateEventFormData extends Partial<CreateEventFormData> {
  status?: 'pending' | 'approved' | 'cancelled';
  is_published?: boolean;
}

export interface EventsListResponse {
  events: Event[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface EventStats {
  total_events: number;
  pending_events: number;
  approved_events: number;
  published_events: number;
  cancelled_events: number;
}

/**
 * Create a new event with JSON data (URLs only)
 */
export async function createEvent(eventData: CreateEventRequest): Promise<Event> {
  const response = await apiPost<ApiResponse<Event>>("/api/v1/admin/events", eventData, tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Create a new event with FormData (file uploads)
 */
export async function createEventWithFiles(eventData: CreateEventFormData): Promise<Event> {
  const formData = new FormData();
  
  // Add text fields
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('date', eventData.date);
  formData.append('time', eventData.time);
  formData.append('venue', eventData.venue);
  formData.append('capacity', eventData.capacity.toString());
  formData.append('max_participants', eventData.max_participants.toString());
  formData.append('category_id', eventData.category_id);
  
  // Add featured image if provided
  if (eventData.featured_image) {
    formData.append('featured_image', eventData.featured_image);
  }
  
  // Add gallery images if provided
  if (eventData.gallery_images && eventData.gallery_images.length > 0) {
    eventData.gallery_images.forEach((file) => {
      formData.append('gallery_images[]', file);
    });
  }
  
  const result = await apiPostForm<ApiResponse<{ event: Event } | Event>>(
    '/api/v1/admin/events',
    formData,
    tokenManager.getAuthHeader()
  );
  // Support both shapes { data: { event } } and { data: event }
  const r: any = result as any;
  return r?.data?.event ?? r?.data ?? r?.event ?? r;
}

/**
 * Get list of events with pagination and filtering
 */
export async function getEvents(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  organizer_id?: string;
  search?: string;
}): Promise<EventsListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.organizer_id) queryParams.append('organizer_id', params.organizer_id);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `/api/v1/admin/events${queryString ? `?${queryString}` : ''}`;

  const response = await apiGet<ApiResponse<EventsListResponse>>(url, tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Get event details by ID
 */
export async function getEventDetails(eventId: string): Promise<Event> {
  const response = await apiGet<ApiResponse<{ event: Event }>>(`/api/v1/admin/events/${eventId}`, tokenManager.getAuthHeader());
  return response.data.event;
}

/**
 * Update an existing event with JSON data (URLs only)
 */
export async function updateEvent(eventId: string, eventData: UpdateEventRequest): Promise<Event> {
  const response = await apiPut<ApiResponse<Event>>(`/api/v1/admin/events/${eventId}`, eventData, tokenManager.getAuthHeader());
  return response.data;
}

/**
 * Update an existing event with FormData (file uploads)
 */
export async function updateEventWithFiles(eventId: string, eventData: UpdateEventFormData): Promise<Event> {
  const formData = new FormData();
  
  // Add text fields (only if provided)
  if (eventData.title !== undefined) formData.append('title', eventData.title);
  if (eventData.description !== undefined) formData.append('description', eventData.description);
  if (eventData.date !== undefined) formData.append('date', eventData.date);
  if (eventData.time !== undefined) formData.append('time', eventData.time);
  if (eventData.venue !== undefined) formData.append('venue', eventData.venue);
  if (eventData.capacity !== undefined) formData.append('capacity', eventData.capacity.toString());
  if (eventData.max_participants !== undefined) formData.append('max_participants', eventData.max_participants.toString());
  if (eventData.category_id !== undefined) formData.append('category_id', eventData.category_id);
  
  // Add featured image if provided
  if (eventData.featured_image) {
    formData.append('featured_image', eventData.featured_image);
  }
  
  // Add gallery images if provided
  if (eventData.gallery_images && eventData.gallery_images.length > 0) {
    eventData.gallery_images.forEach((file) => {
      formData.append('gallery_images[]', file);
    });
  }
  
  const result = await apiPutForm<ApiResponse<{ event: Event } | Event>>(
    `/api/v1/admin/events/${eventId}`,
    formData,
    tokenManager.getAuthHeader()
  );
  // Support both shapes
  const r: any = result as any;
  return r?.data?.event ?? r?.data ?? r?.event ?? r;
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await apiDelete<BasicResponse>(`/api/v1/admin/events/${eventId}`, tokenManager.getAuthHeader());
}

/**
 * Approve an event (Admin only)
 */
export async function approveEvent(eventId: string): Promise<void> {
  await apiPost<BasicResponse>(`/api/v1/admin/events/${eventId}/approve`, undefined, tokenManager.getAuthHeader());
}

/**
 * Publish/Unpublish an event
 */
export async function publishEvent(eventId: string): Promise<void> {
  await apiPost<BasicResponse>(`/api/v1/admin/events/${eventId}/publish`, undefined, tokenManager.getAuthHeader());
}

/**
 * Decline/Reject an event (Admin only)
 */
export async function declineEvent(eventId: string): Promise<void> {
  await updateEvent(eventId, { status: "cancelled" });
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<EventStats> {
  const response = await apiGet<ApiResponse<EventStats>>("/api/v1/admin/events/stats", tokenManager.getAuthHeader());
  return response.data;
}

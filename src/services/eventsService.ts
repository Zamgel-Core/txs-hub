// 📍 Ruta del archivo: src/services/eventsService.ts

import { supabase } from "@/src/lib/supabase";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  maps_url: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventFormPayload = {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  mapsUrl: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
};

export async function getAdminEvents() {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, event_time, location, maps_url, image_url, is_featured, is_active, created_at, updated_at",
    )
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as EventItem[];
}

export async function getActiveEvents() {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, description, event_date, event_time, location, maps_url, image_url, is_featured, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .gte("event_date", today)
    .order("is_featured", { ascending: false })
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as EventItem[];
}

export async function createEvent(payload: EventFormPayload) {
  const { error } = await supabase.from("events").insert({
    title: payload.title,
    description: payload.description,
    event_date: payload.eventDate,
    event_time: payload.eventTime || null,
    location: payload.location || null,
    maps_url: payload.mapsUrl || null,
    image_url: payload.imageUrl || null,
    is_featured: payload.isFeatured,
    is_active: payload.isActive,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEvent(id: string, payload: EventFormPayload) {
  const { error } = await supabase
    .from("events")
    .update({
      title: payload.title,
      description: payload.description,
      event_date: payload.eventDate,
      event_time: payload.eventTime || null,
      location: payload.location || null,
      maps_url: payload.mapsUrl || null,
      image_url: payload.imageUrl || null,
      is_featured: payload.isFeatured,
      is_active: payload.isActive,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadEventImage(file: File) {
  const fileExtension = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `events/${fileName}`;

  const { error } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

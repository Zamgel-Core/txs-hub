// 📍 Ruta del archivo: src/services/announcementsService.ts

import { supabase } from "@/src/lib/supabase";

export type AnnouncementPriority = "normal" | "importante" | "urgente";
export type AnnouncementTargetType = "todos" | "grupo";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  target_type: AnnouncementTargetType;
  group_id: string | null;
  publish_date: string;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AnnouncementWithRead = Announcement & {
  read_at: string | null;
};

export type AnnouncementGroup = {
  id: string;
  name: string;
  schedule: string;
  level: string;
  days: string | null;
  is_active: boolean;
};

export type SaveAnnouncementPayload = {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  targetType: AnnouncementTargetType;
  groupId: string | null;
  publishDate: string;
  expiresAt: string | null;
  isActive: boolean;
};

export async function getAnnouncementGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, schedule, level, days, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as AnnouncementGroup[];
}

export async function getAdminAnnouncements() {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Announcement[];
}

export async function createAnnouncement(payload: SaveAnnouncementPayload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("announcements").insert({
    title: payload.title,
    body: payload.body,
    priority: payload.priority,
    target_type: payload.targetType,
    group_id: payload.targetType === "grupo" ? payload.groupId : null,
    publish_date: payload.publishDate,
    expires_at: payload.expiresAt || null,
    is_active: payload.isActive,
    created_by: user?.id || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAnnouncement(
  announcementId: string,
  payload: SaveAnnouncementPayload,
) {
  const { error } = await supabase
    .from("announcements")
    .update({
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      target_type: payload.targetType,
      group_id: payload.targetType === "grupo" ? payload.groupId : null,
      publish_date: payload.publishDate,
      expires_at: payload.expiresAt || null,
      is_active: payload.isActive,
    })
    .eq("id", announcementId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAnnouncement(announcementId: string) {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getStudentAnnouncements(studentId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data: announcementsData, error: announcementsError } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .lte("publish_date", today)
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order("publish_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (announcementsError) {
    throw new Error(announcementsError.message);
  }

  const announcements = (announcementsData || []) as Announcement[];

  const { data: readsData, error: readsError } = await supabase
    .from("announcement_reads")
    .select("announcement_id, read_at")
    .eq("student_id", studentId);

  if (readsError) {
    throw new Error(readsError.message);
  }

  const readMap = new Map(
    (readsData || []).map((item) => [item.announcement_id, item.read_at]),
  );

  return announcements.map((announcement) => ({
    ...announcement,
    read_at: readMap.get(announcement.id) || null,
  })) as AnnouncementWithRead[];
}

export async function markAnnouncementAsRead(
  announcementId: string,
  studentId: string,
) {
  const { error } = await supabase.from("announcement_reads").upsert(
    {
      announcement_id: announcementId,
      student_id: studentId,
      read_at: new Date().toISOString(),
    },
    {
      onConflict: "announcement_id,student_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

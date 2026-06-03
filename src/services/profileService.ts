// 📍 Ruta: src/services/profileService.ts

import { supabase } from "@/src/lib/supabase";

export type UserRole = "admin" | "alumno" | string;

export type BaseProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  is_active: boolean | null;
};

export type StudentSummary = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  group_level: string | null;
  membership_status: string | null;
  membership_type: string | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  qr_token: string | null;
};

export type ExtendedProfile = {
  id?: string;
  profile_id: string;
  student_id: string | null;
  profile_photo_url: string | null;
  birth_date: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string | null;
  medications: string | null;
  medical_conditions: string | null;
  emergency_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  qr_code_value: string | null;
  public_show_level: boolean;
  public_show_points: boolean;
  public_show_photo: boolean;
  level: number;
  points: number;
  created_at?: string;
  updated_at?: string;
};

export type ProfileBundle = {
  authUserId: string;
  baseProfile: BaseProfile | null;
  student: StudentSummary | null;
  extendedProfile: ExtendedProfile;
};

export function buildDefaultExtendedProfile(params: {
  profileId: string;
  studentId?: string | null;
  role?: UserRole | null;
}): ExtendedProfile {
  const qrTargetId = params.studentId || params.profileId;
  const prefix = params.role === "admin" ? "TXS-ADMIN" : "TXS-STUDENT";

  return {
    profile_id: params.profileId,
    student_id: params.studentId || null,
    profile_photo_url: null,
    birth_date: null,
    address: null,
    blood_type: null,
    allergies: null,
    medications: null,
    medical_conditions: null,
    emergency_notes: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
    qr_code_value: `${prefix}:${qrTargetId}`,
    public_show_level: true,
    public_show_points: true,
    public_show_photo: true,
    level: 1,
    points: 0,
  };
}

export async function getMyProfileBundle(): Promise<ProfileBundle> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No hay sesión activa.");

  const { data: baseProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, avatar_url, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  const profileEmail = baseProfile?.email || user.email || null;

  let student: StudentSummary | null = null;

  if (profileEmail) {
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select(
        "id, full_name, email, phone, group_level, membership_status, membership_type, membership_start_date, membership_end_date, qr_token",
      )
      .ilike("email", profileEmail)
      .maybeSingle();

    if (studentError) throw studentError;
    student = studentData as StudentSummary | null;
  }

  const { data: extendedData, error: extendedError } = await supabase
    .from("user_extended_profiles")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (extendedError) throw extendedError;

  const fallback = buildDefaultExtendedProfile({
    profileId: user.id,
    studentId: student?.id || null,
    role: baseProfile?.role || null,
  });

  return {
    authUserId: user.id,
    baseProfile: (baseProfile as BaseProfile | null) || null,
    student,
    extendedProfile: extendedData
      ? ({
          ...fallback,
          ...(extendedData as ExtendedProfile),
        } as ExtendedProfile)
      : fallback,
  };
}

export async function saveMyExtendedProfile(
  profile: ExtendedProfile,
): Promise<ExtendedProfile> {
  const payload: ExtendedProfile = {
    ...profile,
    qr_code_value:
      profile.qr_code_value ||
      `TXS-STUDENT:${profile.student_id || profile.profile_id}`,
  };

  const { data, error } = await supabase
    .from("user_extended_profiles")
    .upsert(payload, { onConflict: "profile_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as ExtendedProfile;
}

export async function updateMyBaseProfile(params: {
  profileId: string;
  fullName: string;
  phone: string;
  avatarUrl?: string | null;
}) {
  const updatePayload: {
    full_name: string;
    phone: string;
    avatar_url?: string | null;
  } = {
    full_name: params.fullName,
    phone: params.phone,
  };

  if (typeof params.avatarUrl !== "undefined") {
    updatePayload.avatar_url = params.avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", params.profileId);

  if (error) throw error;
}

export async function uploadProfilePhoto(params: {
  profileId: string;
  file: File;
}): Promise<string> {
  const extension = params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
    ? extension
    : "jpg";

  const filePath = `${params.profileId}/avatar-${Date.now()}.${safeExtension}`;

  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, params.file, {
      cacheControl: "3600",
      upsert: true,
      contentType: params.file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

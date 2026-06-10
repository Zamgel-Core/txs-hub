// 📍 Ruta del archivo: src/services/socialService.ts

import { supabase } from "@/src/lib/supabase";

export type SocialPostType =
  | "student_post"
  | "achievement"
  | "event"
  | "recognition"
  | "level_up"
  | "birthday"
  | "student_of_month"
  | "system";

export type SocialPostStatus =
  | "published"
  | "hidden"
  | "pending_review"
  | "deleted";
export type SocialVisibility = "academy" | "group" | "admins";
export type SocialReactionType = "like" | "fire" | "clap" | "trophy";
export type SocialFeedFilter =
  | "todos"
  | "mi_grupo"
  | "eventos"
  | "reconocimientos"
  | "txs"
  | "destacados";
export type SocialReportStatus =
  | "open"
  | "reviewing"
  | "resolved"
  | "dismissed";

export type SocialReactionSummary = Record<SocialReactionType, number>;

export type SocialAuthor = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  group_id: string | null;
  group_name: string | null;
  total_points: number;
  current_level: number;
  current_level_name: string;
  badge_label: string | null;
  is_official?: boolean;
};

export type SocialPost = {
  id: string;
  author_student_id: string | null;
  author_profile_id: string | null;
  post_type: SocialPostType;
  content: string;
  media_url: string | null;
  media_type: string | null;
  visibility: SocialVisibility;
  group_id: string | null;
  txs_source_type: string | null;
  txs_source_id: string | null;
  status: SocialPostStatus;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  hidden_at: string | null;
  hidden_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  metadata: Record<string, unknown>;
  author: SocialAuthor | null;
  reactions_count: number;
  reaction_summary: SocialReactionSummary;
  comments_count: number;
  reports_count: number;
  my_reaction: SocialReactionType | null;
};

export type SocialComment = {
  id: string;
  post_id: string;
  student_id: string | null;
  content: string;
  status: SocialPostStatus;
  created_at: string;
  updated_at: string;
  hidden_at: string | null;
  hidden_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  author_name: string;
};

export type SocialReport = {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reported_by_student_id: string | null;
  reason: string;
  details: string | null;
  status: SocialReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
  post_content: string | null;
  reporter_name: string | null;
};

export type CurrentSocialStudent = {
  id: string;
  full_name: string;
  email: string | null;
  group_id: string | null;
  avatar_url?: string | null;
};

export type SocialCreatePostPayload = {
  content: string;
  visibility: SocialVisibility;
  groupId?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
};

export type AdminSocialStats = {
  posts_today: number;
  posts_week: number;
  reports_open: number;
  posts_hidden: number;
  users_suspended: number;
  featured: number;
};

const emptyReactionSummary: SocialReactionSummary = {
  like: 0,
  fire: 0,
  clap: 0,
  trophy: 0,
};

function normalizeMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  return {};
}

function mapAuthor(
  raw: any,
  progressMap?: Map<string, any>,
  avatarMap?: Map<string, string | null>,
): SocialAuthor | null {
  const metadata = normalizeMetadata(raw?.metadata);
  const student = Array.isArray(raw?.students)
    ? raw.students[0]
    : raw?.students;
  const progress = raw?.author_student_id
    ? progressMap?.get(raw.author_student_id)
    : null;

  if (metadata?.is_official || raw?.post_type === "system") {
    return {
      id: raw?.author_profile_id || "txs-academia",
      full_name: String(metadata?.display_name || "TXS Academia"),
      email: null,
      avatar_url: String(metadata?.avatar_url || "") || null,
      group_id: null,
      group_name: "Cuenta oficial",
      total_points: 0,
      current_level: 0,
      current_level_name: "Cuenta oficial",
      badge_label: "Oficial",
      is_official: true,
    };
  }

  if (!student && !progress && raw?.author_profile_id) {
    return {
      id: raw.author_profile_id,
      full_name: String(metadata?.display_name || "Admin TXS"),
      email: null,
      avatar_url: String(metadata?.avatar_url || "") || null,
      group_id: null,
      group_name: "Equipo TXS",
      total_points: 0,
      current_level: 0,
      current_level_name: "Equipo TXS",
      badge_label: "Staff",
      is_official: false,
    };
  }

  if (!student && !progress) return null;

  return {
    id: student?.id || progress?.student_id || raw?.author_student_id,
    full_name: student?.full_name || progress?.full_name || "Alumno TXS",
    email: student?.email || progress?.email || null,
    avatar_url: avatarMap?.get(student?.id || progress?.student_id || raw?.author_student_id) || null,
    group_id: student?.group_id || progress?.group_id || null,
    group_name: student?.groups?.name || null,
    total_points: Number(progress?.total_points || 0),
    current_level: Number(progress?.current_level || 1),
    current_level_name: progress?.current_level_name || "Nivel 1",
    badge_label: progress?.badge_label || null,
  };
}

export async function getCurrentSocialStudent() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user?.email) return null;

  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, email, group_id")
    .ilike("email", user.email)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const avatarMap = await getStudentAvatarMap([data as any]);

  return {
    ...(data as CurrentSocialStudent),
    avatar_url: avatarMap.get((data as any).id) || null,
  };
}

export async function getSocialFeed(filter: SocialFeedFilter = "todos") {
  const currentStudent = await getCurrentSocialStudent();

  let query = supabase
    .from("social_posts")
    .select(
      `
      *,
      students:author_student_id(id, full_name, email, group_id, groups:group_id(name))
    `,
    )
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (filter === "mi_grupo" && currentStudent?.group_id) {
    query = query.or(
      `visibility.eq.academy,group_id.eq.${currentStudent.group_id}`,
    );
  }

  if (filter === "eventos") {
    query = query.eq("post_type", "event");
  }

  if (filter === "reconocimientos") {
    query = query.eq("post_type", "recognition");
  }

  if (filter === "txs") {
    query = query.in("post_type", [
      "achievement",
      "recognition",
      "level_up",
      "student_of_month",
      "system",
    ]);
  }

  if (filter === "destacados") {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const posts = data || [];
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(
    new Set(posts.map((post: any) => post.author_student_id).filter(Boolean)),
  );

  const [reactionSummary, commentCounts, reportCounts, myReactions, progressMap, avatarMap] =
    await Promise.all([
      getReactionSummary(postIds),
      getCommentCounts(postIds),
      getReportCounts(postIds),
      currentStudent?.id
        ? getMyReactions(postIds, currentStudent.id)
        : Promise.resolve(new Map<string, SocialReactionType>()),
      getAuthorProgressMap(authorIds),
      getStudentAvatarMap(posts.map((post: any) => {
        const student = Array.isArray(post?.students) ? post.students[0] : post?.students;
        return { id: student?.id || post.author_student_id, email: student?.email || null };
      }).filter((student: any) => student.id)),
    ]);

  return posts.map((post: any) => {
    const summary = reactionSummary.get(post.id) || { ...emptyReactionSummary };
    const reactionsCount = Object.values(summary).reduce((sum, value) => sum + value, 0);

    return {
      ...post,
      metadata: normalizeMetadata(post.metadata),
      author: mapAuthor(post, progressMap, avatarMap),
      reactions_count: reactionsCount,
      reaction_summary: summary,
      comments_count: commentCounts.get(post.id) || 0,
      reports_count: reportCounts.get(post.id) || 0,
      my_reaction: myReactions.get(post.id) || null,
    };
  }) as SocialPost[];
}

async function getAuthorProgressMap(studentIds: string[]) {
  const map = new Map<string, any>();
  if (studentIds.length === 0) return map;

  const { data, error } = await supabase
    .from("student_txs_progress_summary")
    .select(
      "student_id, full_name, email, group_id, total_points, current_level, current_level_name, badge_label",
    )
    .in("student_id", studentIds);

  if (error) {
    console.warn("No se pudo cargar progreso TXS para social:", error.message);
    return map;
  }

  (data || []).forEach((item: any) => map.set(item.student_id, item));
  return map;
}

async function getStudentAvatarMap(students: Array<{ id: string; email?: string | null }>) {
  const map = new Map<string, string | null>();
  if (students.length === 0) return map;

  const emailToStudentId = new Map<string, string>();
  students.forEach((student) => {
    if (student.id) map.set(student.id, null);
    if (student.email) emailToStudentId.set(student.email.toLowerCase(), student.id);
  });

  const emails = Array.from(emailToStudentId.keys());
  if (emails.length === 0) return map;

  const { data, error } = await supabase
    .from("profiles")
    .select("email, avatar_url")
    .in("email", emails);

  if (error) {
    console.warn("No se pudieron cargar avatares sociales:", error.message);
    return map;
  }

  (data || []).forEach((profile: any) => {
    const studentId = profile?.email
      ? emailToStudentId.get(String(profile.email).toLowerCase())
      : null;

    if (studentId) {
      map.set(studentId, profile.avatar_url || null);
    }
  });

  return map;
}

async function getReactionSummary(postIds: string[]) {
  const map = new Map<string, SocialReactionSummary>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("social_reactions")
    .select("post_id, reaction_type")
    .in("post_id", postIds);

  if (error) throw new Error(error.message);

  (data || []).forEach((item) => {
    const postId = item.post_id;
    const reactionType = item.reaction_type as SocialReactionType;
    const current = map.get(postId) || { ...emptyReactionSummary };

    if (reactionType in current) {
      current[reactionType] += 1;
    }

    map.set(postId, current);
  });

  return map;
}

async function getCommentCounts(postIds: string[]) {
  const map = new Map<string, number>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("social_comments")
    .select("post_id")
    .in("post_id", postIds)
    .eq("status", "published");

  if (error) throw new Error(error.message);

  (data || []).forEach((item) =>
    map.set(item.post_id, (map.get(item.post_id) || 0) + 1),
  );
  return map;
}

async function getReportCounts(postIds: string[]) {
  const map = new Map<string, number>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("social_reports")
    .select("post_id")
    .in("post_id", postIds)
    .in("status", ["open", "reviewing"]);

  if (error) return map;

  (data || []).forEach((item) => {
    if (item.post_id) map.set(item.post_id, (map.get(item.post_id) || 0) + 1);
  });

  return map;
}

async function getMyReactions(postIds: string[], studentId: string) {
  const map = new Map<string, SocialReactionType>();
  if (postIds.length === 0) return map;

  const { data, error } = await supabase
    .from("social_reactions")
    .select("post_id, reaction_type")
    .in("post_id", postIds)
    .eq("student_id", studentId);

  if (error) throw new Error(error.message);

  (data || []).forEach((item) =>
    map.set(item.post_id, item.reaction_type as SocialReactionType),
  );
  return map;
}

export async function createSocialPost(payload: SocialCreatePostPayload) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("social_posts").insert({
    author_student_id: student.id,
    author_profile_id: user?.id || null,
    post_type: "student_post",
    content: payload.content.trim(),
    media_url: payload.mediaUrl || null,
    media_type: payload.mediaType || null,
    visibility: payload.visibility,
    group_id:
      payload.visibility === "group"
        ? payload.groupId || student.group_id
        : null,
    status: "published",
    created_by: user?.id || null,
    metadata: {},
  });

  if (error) throw new Error(error.message);
}

export async function createAdminSocialPost(
  payload: SocialCreatePostPayload,
  publishAsOfficial = true,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Debes iniciar sesión para publicar.");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = publishAsOfficial
    ? "TXS Academia"
    : profileData?.full_name || profileData?.email || user.email || "Equipo TXS";

  const { error } = await supabase.from("social_posts").insert({
    author_student_id: null,
    author_profile_id: user.id,
    post_type: "system",
    content: payload.content.trim(),
    media_url: payload.mediaUrl || null,
    media_type: payload.mediaType || null,
    visibility: payload.visibility,
    group_id: null,
    status: "published",
    created_by: user.id,
    metadata: {
      is_official: publishAsOfficial,
      display_name: displayName,
      avatar_url: publishAsOfficial ? null : profileData?.avatar_url || null,
      source: "admin_composer",
    },
  });

  if (error) throw new Error(error.message);
}

export async function toggleSocialReaction(
  postId: string,
  reactionType: SocialReactionType,
) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const { data: existing, error: existingError } = await supabase
    .from("social_reactions")
    .select("id, reaction_type")
    .eq("post_id", postId)
    .eq("student_id", student.id)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existing?.reaction_type === reactionType) {
    const { error } = await supabase
      .from("social_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("social_reactions").upsert(
    {
      post_id: postId,
      student_id: student.id,
      reaction_type: reactionType,
    },
    { onConflict: "post_id,student_id" },
  );

  if (error) throw new Error(error.message);
}

export async function getSocialComments(postId: string) {
  const { data, error } = await supabase
    .from("social_comments")
    .select("*, students:student_id(full_name)")
    .eq("post_id", postId)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((comment: any) => ({
    ...comment,
    author_name: comment?.students?.full_name || "Alumno TXS",
  })) as SocialComment[];
}

export async function createSocialComment(postId: string, content: string) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const { error } = await supabase.from("social_comments").insert({
    post_id: postId,
    student_id: student.id,
    content: content.trim(),
    status: "published",
  });

  if (error) throw new Error(error.message);
}

export async function reportSocialPost(
  postId: string,
  reason: string,
  details?: string,
) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const { error } = await supabase.from("social_reports").insert({
    post_id: postId,
    reported_by_student_id: student.id,
    reason,
    details: details?.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function updateOwnSocialPostContent(postId: string, content: string) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .select("id, author_student_id, post_type, status, created_at")
    .eq("id", postId)
    .maybeSingle();

  if (postError) throw new Error(postError.message);
  if (!post) throw new Error("No se encontró la publicación.");
  if (post.author_student_id !== student.id) {
    throw new Error("Solo puedes editar tus propias publicaciones.");
  }
  if (post.post_type !== "student_post") {
    throw new Error("Esta publicación no se puede editar.");
  }
  if (post.status !== "published") {
    throw new Error("Solo puedes editar publicaciones activas.");
  }

  const createdAt = new Date(post.created_at).getTime();
  const elapsedMs = Date.now() - createdAt;
  if (elapsedMs > 2 * 60 * 1000) {
    throw new Error("Solo puedes editar durante los primeros 2 minutos.");
  }

  const [{ count: commentsCount }, { count: reportsCount }] = await Promise.all([
    supabase
      .from("social_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("status", "published"),
    supabase
      .from("social_reports")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .in("status", ["open", "reviewing"]),
  ]);

  if ((commentsCount ?? 0) > 0) {
    throw new Error("No se puede editar una publicación que ya tiene comentarios.");
  }
  if ((reportsCount ?? 0) > 0) {
    throw new Error("No se puede editar una publicación reportada.");
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error("La publicación no puede quedar vacía.");

  const { error } = await supabase
    .from("social_posts")
    .update({
      content: trimmedContent,
      updated_at: new Date().toISOString(),
      metadata: {
        edited: true,
        edited_at: new Date().toISOString(),
      },
    })
    .eq("id", postId)
    .eq("author_student_id", student.id);

  if (error) throw new Error(error.message);
}

export async function deleteOwnSocialPost(postId: string) {
  const student = await getCurrentSocialStudent();
  if (!student) throw new Error("No se encontró el alumno actual.");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("social_posts")
    .select("id, author_student_id, post_type")
    .eq("id", postId)
    .maybeSingle();

  if (postError) throw new Error(postError.message);
  if (!post) throw new Error("No se encontró la publicación.");
  if (post.author_student_id !== student.id) {
    throw new Error("Solo puedes eliminar tus propias publicaciones.");
  }
  if (post.post_type !== "student_post") {
    throw new Error("Esta publicación automática no se puede eliminar desde alumno.");
  }

  const { error } = await supabase
    .from("social_posts")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("author_student_id", student.id);

  if (error) throw new Error(error.message);
}

export async function getAdminSocialPosts() {
  const { data, error } = await supabase
    .from("social_posts")
    .select("*, students:author_student_id(id, full_name, email, group_id, groups:group_id(name))")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  const posts = data || [];
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(
    new Set(posts.map((post: any) => post.author_student_id).filter(Boolean)),
  );

  const [reactionSummary, commentCounts, reportCounts, progressMap, avatarMap] = await Promise.all([
    getReactionSummary(postIds),
    getCommentCounts(postIds),
    getReportCounts(postIds),
    getAuthorProgressMap(authorIds),
    getStudentAvatarMap(posts.map((post: any) => {
      const student = Array.isArray(post?.students) ? post.students[0] : post?.students;
      return { id: student?.id || post.author_student_id, email: student?.email || null };
    }).filter((student: any) => student.id)),
  ]);

  return posts.map((post: any) => {
    const summary = reactionSummary.get(post.id) || { ...emptyReactionSummary };
    const reactionsCount = Object.values(summary).reduce((sum, value) => sum + value, 0);

    return {
      ...post,
      metadata: normalizeMetadata(post.metadata),
      author: mapAuthor(post, progressMap, avatarMap),
      reactions_count: reactionsCount,
      reaction_summary: summary,
      comments_count: commentCounts.get(post.id) || 0,
      reports_count: reportCounts.get(post.id) || 0,
      my_reaction: null,
    };
  }) as SocialPost[];
}

export async function getAdminSocialReports() {
  const { data, error } = await supabase
    .from("social_reports")
    .select(
      "*, social_posts:post_id(content), students:reported_by_student_id(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data || []).map((report: any) => ({
    ...report,
    post_content: report?.social_posts?.content || null,
    reporter_name: report?.students?.full_name || null,
  })) as SocialReport[];
}

export async function updateSocialPostStatus(
  postId: string,
  status: SocialPostStatus,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "hidden" || status === "pending_review") {
    payload.hidden_at = new Date().toISOString();
    payload.hidden_by = user?.id || null;
  }

  if (status === "published") {
    payload.hidden_at = null;
    payload.hidden_by = null;
  }

  if (status === "deleted") {
    payload.deleted_at = new Date().toISOString();
    payload.deleted_by = user?.id || null;
  }

  const { error } = await supabase
    .from("social_posts")
    .update(payload)
    .eq("id", postId);
  if (error) throw new Error(error.message);
}

export async function toggleFeaturedPost(postId: string, isFeatured: boolean) {
  const { error } = await supabase
    .from("social_posts")
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(error.message);
}

export async function updateSocialReportStatus(
  reportId: string,
  status: SocialReportStatus,
  note?: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("social_reports")
    .update({
      status,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
      resolution_note: note || null,
    })
    .eq("id", reportId);

  if (error) throw new Error(error.message);
}

export async function getAdminSocialStats(
  postsInput?: SocialPost[],
  reportsInput?: SocialReport[],
): Promise<AdminSocialStats> {
  const [posts, reports] = await Promise.all([
    postsInput ? Promise.resolve(postsInput) : getAdminSocialPosts(),
    reportsInput ? Promise.resolve(reportsInput) : getAdminSocialReports(),
  ]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  let usersSuspended = 0;
  const { count } = await supabase
    .from("social_user_settings")
    .select("*", { count: "exact", head: true })
    .eq("is_social_suspended", true);
  usersSuspended = count ?? 0;

  return {
    posts_today: posts.filter((post) => new Date(post.created_at).getTime() >= startOfToday).length,
    posts_week: posts.filter((post) => new Date(post.created_at).getTime() >= startOfWeek.getTime()).length,
    reports_open: reports.filter((report) => report.status === "open" || report.status === "reviewing").length,
    posts_hidden: posts.filter((post) => post.status === "hidden" || post.status === "pending_review").length,
    users_suspended: usersSuspended,
    featured: posts.filter((post) => post.is_featured).length,
  };
}

export async function uploadSocialMedia(file: File) {
  const maxImageSizeMb = 5;
  const maxVideoSizeMb = 25;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Solo se permiten imágenes o videos.");
  }

  const maxSizeMb = isImage ? maxImageSizeMb : maxVideoSizeMb;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    throw new Error(
      isImage
        ? `La imagen no puede pesar más de ${maxImageSizeMb} MB.`
        : `El video no puede pesar más de ${maxVideoSizeMb} MB.`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Debes iniciar sesión para subir archivos.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "file";
  const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("social-media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("social-media").getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    mediaType: isImage ? "image" : "video",
    path: fileName,
  };
}

export type SocialProfileStudent = {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  group_id: string | null;
  group_name: string | null;
  created_at: string | null;
};

export async function getSocialProfileStudent(studentId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, email, group_id, created_at, groups:group_id(name)")
    .eq("id", studentId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const rawGroup = Array.isArray((data as any).groups)
    ? (data as any).groups[0]
    : (data as any).groups;
  const avatarMap = await getStudentAvatarMap([{ id: data.id, email: data.email || null }]);

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email || null,
    avatar_url: avatarMap.get(data.id) || null,
    group_id: data.group_id || null,
    group_name: rawGroup?.name || null,
    created_at: (data as any).created_at || null,
  } as SocialProfileStudent;
}

export async function getStudentSocialPosts(studentId: string, limit = 20) {
  const currentStudent = await getCurrentSocialStudent().catch(() => null);

  const { data, error } = await supabase
    .from("social_posts")
    .select(
      `
      *,
      students:author_student_id(id, full_name, email, group_id, groups:group_id(name))
    `,
    )
    .eq("author_student_id", studentId)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const posts = data || [];
  const postIds = posts.map((post) => post.id);
  const authorIds = Array.from(
    new Set(posts.map((post: any) => post.author_student_id).filter(Boolean)),
  );

  const [reactionSummary, commentCounts, reportCounts, myReactions, progressMap, avatarMap] =
    await Promise.all([
      getReactionSummary(postIds),
      getCommentCounts(postIds),
      getReportCounts(postIds),
      currentStudent?.id
        ? getMyReactions(postIds, currentStudent.id)
        : Promise.resolve(new Map<string, SocialReactionType>()),
      getAuthorProgressMap(authorIds),
      getStudentAvatarMap(posts.map((post: any) => {
        const student = Array.isArray(post?.students) ? post.students[0] : post?.students;
        return { id: student?.id || post.author_student_id, email: student?.email || null };
      }).filter((student: any) => student.id)),
    ]);

  return posts.map((post: any) => {
    const summary = reactionSummary.get(post.id) || { ...emptyReactionSummary };
    const reactionsCount = Object.values(summary).reduce(
      (sum, value) => sum + value,
      0,
    );

    return {
      ...post,
      metadata: normalizeMetadata(post.metadata),
      author: mapAuthor(post, progressMap, avatarMap),
      reactions_count: reactionsCount,
      reaction_summary: summary,
      comments_count: commentCounts.get(post.id) || 0,
      reports_count: reportCounts.get(post.id) || 0,
      my_reaction: myReactions.get(post.id) || null,
    };
  }) as SocialPost[];
}

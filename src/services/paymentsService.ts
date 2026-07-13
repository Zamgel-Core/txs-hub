// 📍 Ruta del archivo: src/services/paymentsService.ts

import { supabase } from "@/src/lib/supabase";

export type MembershipStatus = "activa" | "vencida" | "pendiente";
export type MembershipType = string;
export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "otro";

export type PaymentStudent = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  membership_status: MembershipStatus;
  membership_type: MembershipType | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  last_payment_date: string | null;
  payment_notes: string | null;
  is_active: boolean;
};

export type PaymentStaffProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active?: boolean | null;
};

export type PaymentRecord = {
  id: string;
  student_id: string;
  payment_date: string;
  concept: string;
  method: PaymentMethod | string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  membership_plan_id?: string | null;
  plan_slug_snapshot?: string | null;
  plan_name_snapshot?: string | null;
  suggested_amount?: number | null;
  membership_start_date?: string | null;
  membership_end_date?: string | null;
  classes_per_day_snapshot?: number | null;
  receipt_url?: string | null;
  received_by_user_id?: string | null;
  received_by_name?: string | null;
  registered_by_user_id?: string | null;
  registered_by_name?: string | null;
  students?: {
    full_name: string;
    email: string;
  } | null;
};

export type RegisterPaymentPayload = {
  studentId: string;
  membershipType: MembershipType;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  membershipStartDate: string;
  membershipEndDate: string;
  notes: string;
  receiptFile?: File | null;
  receivedByUserId?: string | null;
  receivedByName?: string | null;
  registeredByUserId?: string | null;
  registeredByName?: string | null;
};

export type StudentPaymentPortalData = {
  student: {
    id: string;
    full_name: string;
    email: string;
    membership_status: MembershipStatus | null;
    membership_type: MembershipType | null;
    membership_start_date: string | null;
    membership_end_date: string | null;
    last_payment_date: string | null;
  } | null;
  payments: PaymentRecord[];
};

const paymentSelect =
  "id, student_id, payment_date, concept, method, amount, status, notes, receipt_url, received_by_user_id, received_by_name, registered_by_user_id, registered_by_name, created_at, membership_plan_id, plan_slug_snapshot, plan_name_snapshot, suggested_amount, membership_start_date, membership_end_date, classes_per_day_snapshot, students(full_name, email)";
export async function getPaymentStudents() {
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, full_name, email, phone, membership_status, membership_type, membership_start_date, membership_end_date, last_payment_date, payment_notes, is_active",
    )
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentStudent[];
}

export async function getRecentPayments(limit = 500) {
  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .ilike("concept", "Membresía%")
    .in("status", ["pagado", "paid"])
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentRecord[];
}

export async function getPaymentsAdminData() {
  const [students, recentPayments] = await Promise.all([
    getPaymentStudents(),
    getRecentPayments(500),
  ]);

  return {
    students,
    recentPayments,
  };
}


export async function getPaymentStaffProfiles(): Promise<PaymentStaffProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .in("role", ["admin", "moderator", "staff"])
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentStaffProfile[];
}

export async function getCurrentPaymentUser(): Promise<PaymentStaffProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data || null) as PaymentStaffProfile | null;
}

export async function uploadPaymentReceipt(params: {
  studentId: string;
  file: File;
}): Promise<string> {
  const extension = params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(
    extension,
  )
    ? extension
    : "jpg";
  const filePath = `${params.studentId}/receipt-${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

  const { error } = await supabase.storage
    .from("payment-receipts")
    .upload(filePath, params.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: params.file.type || "image/jpeg",
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("payment-receipts")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function attachReceiptToLatestPayment(params: {
  studentId: string;
  paymentDate: string;
  method: PaymentMethod;
  amount: number;
  receiptUrl?: string | null;
  receivedByUserId?: string | null;
  receivedByName?: string | null;
  registeredByUserId?: string | null;
  registeredByName?: string | null;
}) {
  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .eq("student_id", params.studentId)
    .eq("payment_date", params.paymentDate)
    .eq("method", params.method)
    .eq("amount", params.amount)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("No se encontró el pago recién registrado para adjuntar el comprobante.");
  }

  const updatePayload: Record<string, string | null> = {};

  if (params.receiptUrl) updatePayload.receipt_url = params.receiptUrl;
  if (params.receivedByUserId !== undefined) {
    updatePayload.received_by_user_id = params.receivedByUserId;
  }
  if (params.receivedByName !== undefined) {
    updatePayload.received_by_name = params.receivedByName;
  }
  if (params.registeredByUserId !== undefined) {
    updatePayload.registered_by_user_id = params.registeredByUserId;
  }
  if (params.registeredByName !== undefined) {
    updatePayload.registered_by_name = params.registeredByName;
  }

  if (Object.keys(updatePayload).length === 0) return;

  const { error: updateError } = await supabase
    .from("payments")
    .update(updatePayload)
    .eq("id", data.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}


export async function getOverlappingMembershipPayment(params: {
  studentId: string;
  membershipStartDate: string;
  membershipEndDate: string;
}): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("student_id", params.studentId)
    .ilike("concept", "Membresía%")
    .in("status", ["pagado", "paid"])
    .lte("membership_start_date", params.membershipEndDate)
    .gte("membership_end_date", params.membershipStartDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data || null) as PaymentRecord | null;
}

export async function registerAdminPayment(payload: RegisterPaymentPayload) {
  const { error } = await supabase.rpc("register_admin_payment", {
    p_student_id: payload.studentId,
    p_membership_type: payload.membershipType,
    p_method: payload.method,
    p_amount: payload.amount,
    p_payment_date: payload.paymentDate,
    p_membership_start_date: payload.membershipStartDate,
    p_membership_end_date: payload.membershipEndDate,
    p_notes: payload.notes || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  let receiptUrl: string | null = null;

  if (payload.receiptFile) {
    receiptUrl = await uploadPaymentReceipt({
      studentId: payload.studentId,
      file: payload.receiptFile,
    });
  }

  if (
    receiptUrl ||
    payload.receivedByUserId !== undefined ||
    payload.receivedByName !== undefined ||
    payload.registeredByUserId !== undefined ||
    payload.registeredByName !== undefined
  ) {
    await attachReceiptToLatestPayment({
      studentId: payload.studentId,
      paymentDate: payload.paymentDate,
      method: payload.method,
      amount: payload.amount,
      receiptUrl,
      receivedByUserId: payload.receivedByUserId || null,
      receivedByName: payload.receivedByName || null,
      registeredByUserId: payload.registeredByUserId || null,
      registeredByName: payload.registeredByName || null,
    });
  }
}

export async function uploadReceiptForExistingPayment(params: {
  paymentId: string;
  studentId: string;
  file: File;
}): Promise<string> {
  const receiptUrl = await uploadPaymentReceipt({
    studentId: params.studentId,
    file: params.file,
  });

  const { error } = await supabase
    .from("payments")
    .update({ receipt_url: receiptUrl })
    .eq("id", params.paymentId)
    .eq("student_id", params.studentId);

  if (error) {
    throw new Error(error.message);
  }

  return receiptUrl;
}

export async function getStudentPaymentHistory(studentId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select(paymentSelect)
    .eq("student_id", studentId)
    .ilike("concept", "Membresía%")
    .in("status", ["pagado", "paid"])
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as PaymentRecord[];
}

export async function getStudentPaymentPortalData(
  email: string,
): Promise<StudentPaymentPortalData> {
  const { data: studentData, error: studentError } = await supabase
    .from("students")
    .select(
      "id, full_name, email, membership_status, membership_type, membership_start_date, membership_end_date, last_payment_date",
    )
    .ilike("email", email)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!studentData) {
    return {
      student: null,
      payments: [],
    };
  }

  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select(
      "id, student_id, payment_date, concept, method, amount, status, notes, receipt_url, received_by_user_id, received_by_name, registered_by_user_id, registered_by_name, created_at, membership_plan_id, plan_slug_snapshot, plan_name_snapshot, suggested_amount, membership_start_date, membership_end_date, classes_per_day_snapshot",
    )
    .eq("student_id", studentData.id)
    .ilike("concept", "Membresía%")
    .in("status", ["pagado", "paid"])
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  return {
    student: studentData as StudentPaymentPortalData["student"],
    payments: (paymentsData || []) as PaymentRecord[],
  };
}

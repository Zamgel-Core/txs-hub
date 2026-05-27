// 📍 Ruta: supabase/functions/create-student-user/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Faltan variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      group_level,
      group_id,
      temporary_password,
      notes,
      membership_status,
      membership_type,
      membership_start_date,
      membership_end_date,
    } = body;

    if (!full_name || !email || !phone || !temporary_password) {
      return new Response(
        JSON.stringify({
          error:
            "Nombre, correo, teléfono y contraseña temporal son requeridos.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: temporary_password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone,
          role: "alumno",
        },
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          error: authError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const userId = authUser.user.id;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name,
        phone,
        role: "alumno",
        is_active: true,
      });

    if (profileError) {
      return new Response(
        JSON.stringify({
          error: profileError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        full_name,
        email,
        phone,
        group_level: group_level || "principiante",
        group_id: group_id || null,
        temporary_password,
        is_active: true,
        notes: notes || null,
        membership_status: membership_status || "vencida",
        membership_type: membership_type || "mensual",
        membership_start_date: membership_start_date || null,
        membership_end_date: membership_end_date || null,
        last_payment_date: null,
        payment_notes: null,
      })
      .select()
      .single();

    if (studentError) {
      return new Response(
        JSON.stringify({
          error: studentError.message,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        student,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error inesperado.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

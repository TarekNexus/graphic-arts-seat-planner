import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables" },
      { status: 500 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gai.edu";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Check if admin already exists
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const alreadyExists = users.some((u) => u.email === adminEmail);

  if (alreadyExists) {
    return NextResponse.json({ message: "Admin user already exists" });
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Admin user created",
    email: adminEmail,
    password: adminPassword,
  });
}

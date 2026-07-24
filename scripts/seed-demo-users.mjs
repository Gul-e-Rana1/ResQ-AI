import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const rootDir = process.cwd();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

loadEnvFile(path.join(rootDir, ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoUsers = [
  {
    email: "admin.resqai@gmail.com",
    password: "ResQ@123",
    full_name: "ResQ AI Admin",
    phone: "+92 300 0000001",
    role: "admin",
    city: "Islamabad",
    district: "Islamabad",
    province: "Islamabad Capital Territory",
  },
  {
    email: "campmanager.resqai@gmail.com",
    password: "ResQ@123",
    full_name: "Camp Manager Demo",
    phone: "+92 300 0000002",
    role: "camp_manager",
    city: "Lahore",
    district: "Lahore",
    province: "Punjab",
  },
  {
    email: "helper.resqai@gmail.com",
    password: "ResQ@123",
    full_name: "Camp Helper Demo",
    phone: "+92 300 0000003",
    role: "camp_team_member",
    city: "Lahore",
    district: "Lahore",
    province: "Punjab",
  },
  {
    email: "user.resqai@gmail.com",
    password: "ResQ@123",
    full_name: "Registered User Demo",
    phone: "+92 300 0000004",
    role: "registered_user",
    city: "Lahore",
    district: "Lahore",
    province: "Punjab",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 100) return null;
    page += 1;
  }
}

for (const demo of demoUsers) {
  const existing = await findUserByEmail(demo.email);
  const userMetadata = {
    full_name: demo.full_name,
    phone: demo.phone,
    role: demo.role,
    city: demo.city,
    district: demo.district,
    province: demo.province,
  };

  const authResult = existing
    ? await supabase.auth.admin.updateUserById(existing.id, {
        password: demo.password,
        email_confirm: true,
        user_metadata: userMetadata,
      })
    : await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

  if (authResult.error) throw authResult.error;

  const userId = authResult.data.user.id;
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: demo.email,
      full_name: demo.full_name,
      phone: demo.phone,
      role: demo.role,
      city: demo.city,
      district: demo.district,
      province: demo.province,
      is_active: true,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  console.log(`Seeded ${demo.email}`);
}

const { data: manager } = await supabase.from("profiles").select("id").eq("email", "campmanager.resqai@gmail.com").single();
const { data: helper } = await supabase.from("profiles").select("id").eq("email", "helper.resqai@gmail.com").single();
const { data: camp } = await supabase.from("relief_camps").select("id").eq("name", "Lahore Expo Relief Camp").single();

if (manager?.id && camp?.id) {
  await supabase.from("relief_camps").update({ manager_id: manager.id }).eq("id", camp.id);
}

if (helper?.id && camp?.id) {
  const { error } = await supabase.from("camp_team_members").upsert(
    {
      camp_id: camp.id,
      user_id: helper.id,
      title: "Relief Camp Helper",
      can_update_camp: true,
      can_respond_emergencies: true,
    },
    { onConflict: "camp_id,user_id" },
  );
  if (error) throw error;
}

console.log("Demo user seed complete.");

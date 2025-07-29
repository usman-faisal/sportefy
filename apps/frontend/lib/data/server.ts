import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getSports() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sports:", error);
    return [];
  }

  return data || [];
}

export async function getExternalData() {
  try {
    const response = await fetch("https://api.example.com/data", {
      next: {
        revalidate: 3600,
        tags: ["external-data"],
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching external data:", error);
    return null;
  }
}

export async function createSport(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const { data, error } = await supabase
    .from("sports")
    .insert({ name, description })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create sport");
  }

  return data;
}

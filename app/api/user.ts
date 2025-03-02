"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function createUser(userName: string) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName }),
  });

  const data = await res.json();
  return data;
}

export async function updateUserScore(userId: string, score: number) {

 await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });
return true;
}

export async function fetchUserById(userId: string) {
  if (!userId) throw new Error("Invalid user ID!");
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
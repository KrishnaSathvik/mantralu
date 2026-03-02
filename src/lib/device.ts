import { supabase } from "@/integrations/supabase/client";

const DEVICE_KEY = "mv-device-id";
const TOKEN_KEY = "mv-device-token";
const USER_NAME_KEY = "mv-user-name";

function generateId(): string {
  return crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getDeviceToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Apply the device token as a global header on the Supabase client.
 * The SupabaseClient stores `this.headers` as a shared object reference
 * used by rest, storage, and functions clients.
 */
function applyTokenHeader(token: string) {
  (supabase as any).headers["x-device-token"] = token;
}

/**
 * Ensures a device token exists. If not, generates one and registers it.
 * Must be called early in app lifecycle, before any DB operations.
 */
let _initPromise: Promise<string> | null = null;

export function ensureDeviceToken(): Promise<string> {
  if (_initPromise) return _initPromise;

  const existing = localStorage.getItem(TOKEN_KEY);
  if (existing) {
    applyTokenHeader(existing);
    _initPromise = Promise.resolve(existing);
    return _initPromise;
  }

  _initPromise = (async () => {
    const deviceId = getDeviceId();
    const token = generateToken();

    // Register token. This INSERT uses the permissive policy on device_tokens.
    const { error } = await supabase.from("device_tokens").insert({
      device_id: deviceId,
      token,
    });

    if (error) {
      // Unique constraint violation — device_id already registered (e.g. cleared token but not device_id)
      if (error.code === "23505") {
        const newDeviceId = generateId();
        localStorage.setItem(DEVICE_KEY, newDeviceId);
        const { error: retryError } = await supabase.from("device_tokens").insert({
          device_id: newDeviceId,
          token,
        });
        if (retryError) {
          console.error("Failed to register device token:", retryError);
          throw retryError;
        }
      } else {
        console.error("Failed to register device token:", error);
        throw error;
      }
    }

    localStorage.setItem(TOKEN_KEY, token);
    applyTokenHeader(token);
    return token;
  })();

  return _initPromise;
}

export function getUserName(): string | null {
  return localStorage.getItem(USER_NAME_KEY);
}

export function setUserName(name: string) {
  localStorage.setItem(USER_NAME_KEY, name);
}

export function hasCompletedOnboarding(): boolean {
  return !!localStorage.getItem(USER_NAME_KEY);
}



const DEVICE_KEY = "mv-device-id";
const USER_NAME_KEY = "mv-user-name";

function generateId(): string {
  return crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
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

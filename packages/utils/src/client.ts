const userAgent = navigator.userAgent.toLowerCase()

export const isDarwin = /Mac|iPod|iPhone|iPad/.test(userAgent);
export const isWindows = /^Win/.test(userAgent);
export const isAndroid = /\b(android)\b/i.test(navigator.userAgent);

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined"
}

export function isMobileDevice(): boolean {
  try {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  } catch (e) {
    console.error("Error checking mobile device:", e)
    return false
  }
}

export function isMacOs(): boolean {
  try {
    return userAgent.includes("mac os")
  } catch (e) {
    console.error("Error checking MacOS:", e)
    return false
  }
}

export function isElectron() {
  return isBrowser() && navigator.userAgent.toLowerCase().includes("electron")
}

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined"
}

export function isMobileDevice(): boolean {
  try {
    const userAgent = navigator.userAgent.toLowerCase()
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  } catch (e) {
    console.error("Error checking mobile device:", e)
    return false
  }
}

export function isMacOs(): boolean {
  try {
    const userAgent = navigator.userAgent.toLowerCase()
    return userAgent.includes("mac os")
  } catch (e) {
    console.error("Error checking MacOS:", e)
    return false
  }
}

export function isElectron() {
  return isBrowser() && navigator.userAgent.toLowerCase().includes("electron")
}

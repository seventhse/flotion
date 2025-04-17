export function checkFileType(accept: string | string[], files: FileList | File[]) {
  if (!accept) {
    return {
      validFiles: Array.from(files),
      failFiles: []
    }
  }

  const allowedTypes = Array.isArray(accept) ? accept : accept.split(",")
  const validFiles: File[] = []
  const failFiles: File[] = []

  for (const file of Array.from(files)) {
    const fileType = file.type
    if (allowedTypes.some((type) => fileType.match(new RegExp(type.replace("*", ".*"))))) {
      validFiles.push(file)
    } else {
      failFiles.push(file)
    }
  }

  return {
    validFiles,
    failFiles
  } as const
}

export function checkFileSize(
  size: number | ((file: File) => boolean),
  files: File[] | FileList,
  type: "lt" | "gt" = "gt"
) {
  const validFiles: File[] = []
  const failFiles: File[] = []

  const isFunction = typeof size === "function"

  const isGt = type === "gt"

  for (const file of Array.from(files)) {
    if (isFunction) {
      const valid = size(file)
      valid ? validFiles.push(file) : failFiles.push(file)
      continue
    }
    if (isGt ? file.size > (size as number) : file.size < (size as number)) {
      failFiles.push(file)
    } else {
      validFiles.push(file)
    }
  }

  return {
    validFiles,
    failFiles
  }
}
export function byFileGenerateURL(file: File | Blob): string {
  try {
    return URL.createObjectURL(file)
  } catch (e) {
    const fr = new FileReader()
    let url = ""

    fr.onload = () => {
      url = fr.result as string
    }

    fr.onerror = () => {
      throw new Error("Failed to generate URL from file")
    }

    fr.readAsDataURL(file)
    return url
  }
}

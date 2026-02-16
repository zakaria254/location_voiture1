import toast from "react-hot-toast";

type ApiFieldError = {
  field?: string;
  message?: string;
  value?: unknown;
};

export function formatDate(date?: string) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function extractApiError(error: unknown) {
  const axiosErr = error as {
    response?: { data?: { message?: string; errors?: ApiFieldError[] } };
  };

  const message = axiosErr?.response?.data?.message || "Something went wrong.";
  const details = (axiosErr?.response?.data?.errors || [])
    .map((item) => (item?.field ? `${item.field}: ${item.message}` : item?.message || ""))
    .filter(Boolean);

  return { message, details };
}

export function showApiError(error: unknown, fallback = "Something went wrong.") {
  const parsed = extractApiError(error);
  const baseMessage = parsed.message || fallback;
  const composed = parsed.details.length > 0 ? `${baseMessage} - ${parsed.details.join(" | ")}` : baseMessage;
  toast.error(composed);
  return parsed;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read selected image file."));
    reader.readAsDataURL(file);
  });
}


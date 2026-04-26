export const getYouTubeVideoId = (url) => {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      if (parsed.hostname.includes("youtu.be")) {
        return parsed.pathname.slice(1);
      }

      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * YouTube URL에서 영상 ID를 추출한다.
 * 지원: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/, youtube-nocookie.com/embed/
 */
export function parseYouTubeId(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const isId = (v: string | undefined | null): v is string => !!v && /^[\w-]{11}$/.test(v);

  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1];
    return isId(id) ? id : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (isId(v)) return v;
    const [, kind, id] = url.pathname.split("/");
    if ((kind === "embed" || kind === "shorts" || kind === "live") && isId(id)) return id;
  }
  return null;
}

/** 개인정보 보호 모드(youtube-nocookie) 임베드 URL */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** hq: 480×360(4:3, 항상 존재) · maxres: 1280×720(16:9, 업로드 해상도가 낮으면 없음) */
export function youTubeThumbnailUrl(id: string, size: "hq" | "maxres" = "hq"): string {
  return `https://i.ytimg.com/vi/${id}/${size === "maxres" ? "maxresdefault" : "hqdefault"}.jpg`;
}

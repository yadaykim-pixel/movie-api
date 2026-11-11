import { apiUrl, getAuthHeaders } from "./api.js";

export async function uploadMoviePoster(movieId, file) {
  const formData = new FormData();
  // TODO 1: poster라는 이름으로 file을 formData에 추가합니다.
  formData.append("poster", file);
  const response = await fetch(`${apiUrl}/api/movies/${movieId}/poster`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: formData, // TODO 2: 요청 Body에 formData를 전달합니다.
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "포스터를 업로드하지 못했습니다.");
  return data;
}

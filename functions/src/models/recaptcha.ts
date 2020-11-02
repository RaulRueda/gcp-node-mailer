import axios from "axios";

export async function verifyToken(secret_key: string, token: string) {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  const response = await axios.post(url, {});

  return response.data ?? null;
}

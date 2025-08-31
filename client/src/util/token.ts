import Cookies from "js-cookie";

const COOKIE_OPTIONS = {
  path: "/",
  expires: 14, // 14일
} as const;

export const getAccessToken = () => {
  return Cookies.get("accessToken");
};

export const setAccessToken = (token: string) => {
  Cookies.set("accessToken", token, COOKIE_OPTIONS);
};

export const removeAccessToken = () => {
  Cookies.remove("accessToken", COOKIE_OPTIONS);
};

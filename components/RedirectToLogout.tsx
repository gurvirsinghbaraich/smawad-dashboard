"use client";

import { useEffect } from "react";

export default function RedirectToLogout() {
  useEffect(function () {
    const a = document.createElement("a");
    a.href = "/api/logout";
    a.click();
  }, []);
  return null;
}

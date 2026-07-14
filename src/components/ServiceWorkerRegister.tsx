"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // オフライン対応は任意機能のため、失敗しても致命的ではない
      });
    }
  }, []);

  return null;
}

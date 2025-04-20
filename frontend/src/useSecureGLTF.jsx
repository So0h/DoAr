import { useEffect, useState } from "react";

export default function useSecureGLTF(url, token) {
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!url || !token) return;

    let revoked = false;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized or not found");
        return res.blob();
      })
      .then(blob => {
        if (!revoked) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => setBlobUrl(null));

    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line
  }, [url, token]);

  return blobUrl;
}

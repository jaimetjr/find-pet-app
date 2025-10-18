import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import LoadingSpinner from "@/components/LoadingSpinner";

// Needed so WebBrowser can close after Clerk redirect
WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // After redirect, you might want to send user to home/dashboard
    router.replace("/"); 
  }, []);

  return <LoadingSpinner message="Entrando no mundo dos sonhos :)" />;
}

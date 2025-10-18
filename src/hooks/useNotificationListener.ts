import { useEffect, useMemo, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRootNavigationState, useRouter } from "expo-router";

export function useNotificationListener() {
  const router = useRouter();
  const navState = useRootNavigationState();

  const isRouterReady = !!navState?.key;
  const pendingResponseRef = useRef<Notifications.NotificationResponse | null>(
    null
  );
  const lastHandledIRef = useRef<string | null>(null);
  const markHandled = (id: string) => (lastHandledIRef.current = id);
  const wasHandled = (id: string) => lastHandledIRef.current === id;

  const handleResponse = useMemo(
    () => (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      // Unique-ish id: prefer request.identifier, fallback to trigger timestamp
      const id =
        response.notification.request.identifier ||
        String(response.notification.date);

      if (wasHandled(id)) return; // already processed
      const data = response.notification.request.content.data as any;

      console.log("[notif] response", {
        id,
        action: response.actionIdentifier,
        data,
        isRouterReady,
      });

      // Only route once the router is ready
      if (!isRouterReady) {
        pendingResponseRef.current = response;
        return;
      }

      // Normalize and route
      const screen = (data.screen || "").toLowerCase();

      try {
        switch (screen) {
          case "chat":
            if (data.userId) {
              router.push(
                `/chat?userId=${encodeURIComponent(
                  data.userId
                )}&userName=${encodeURIComponent(
                  data.userName ?? ""
                )}&userAvatar=${encodeURIComponent(
                  data.userAvatar ?? ""
                )}&petId=${encodeURIComponent(data.petId ?? "")}`
              );
              markHandled(id);
            }
            break;

          case "pet-detail":
          case "pet_detail":
          case "petdetail":
            if (data.petId) {
              router.push(
                `/pet-detail?petId=${encodeURIComponent(data.petId)}`
              );
              markHandled(id);
            }
            break;

          default:
            // optional: a default landing if payload has no screen
            console.log("[notif] unknown screen, ignoring", data);
            markHandled(id);
            break;
        }
      } catch (e) {
        console.warn("[notif] navigation error", e);
      } finally {
        // Clear buffered if we processed it
        if (
          pendingResponseRef.current?.notification.request.identifier === id
        ) {
          pendingResponseRef.current = null;
        }
      }
    },
    [router, isRouterReady]
  );
  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const cold = await Notifications.getLastNotificationResponseAsync();
        if (!isActive || !cold) return;
        handleResponse(cold);
      } catch (e) {
        console.warn("[notif] getLastNotificationResponseAsync failed", e);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [handleResponse]);

  // Live listener for taps while the app is running/in background
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (resp) => {
        handleResponse(resp);
      }
    );
    return () => sub.remove();
  }, [handleResponse]);

  // When the router becomes ready, process any buffered tap
  useEffect(() => {
    if (!isRouterReady) return;
    if (pendingResponseRef.current) {
      handleResponse(pendingResponseRef.current);
    }
  }, [isRouterReady, handleResponse]);
}

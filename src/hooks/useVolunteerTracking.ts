import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVolunteerTracking = (
  assignmentId: string,
  volunteerId: string,
  enabled: boolean
) => {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !assignmentId || !volunteerId) return;

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        await supabase.from("volunteer_location_logs").insert({
          assignment_id: assignmentId,
          volunteer_id: volunteerId,
          latitude,
          longitude,
          accuracy,
        });
      },
      (err) => console.error("GPS error", err),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, assignmentId, volunteerId]);
};

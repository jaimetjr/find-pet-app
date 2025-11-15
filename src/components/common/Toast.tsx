import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Toast = () => {
  const { toast, hideToast } = useToast();
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (toast) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      timeoutRef.current = setTimeout(() => {
        handleHide();
      }, toast.duration || 3000);
    } else {
      handleHide();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!toast) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          backgroundColor: "#10B981", // Green
          icon: "check-circle" as const,
        };
      case "warning":
        return {
          backgroundColor: "#F59E0B", // Amber/Orange
          icon: "alert-circle" as const,
        };
      case "failure":
        return {
          backgroundColor: "#EF4444", // Red
          icon: "close-circle" as const,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: "information" as const,
        };
    }
  };

  const toastStyles = getToastStyles();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.toastContainer,
          {
            backgroundColor: toastStyles.backgroundColor,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.contentContainer}>
          <MaterialCommunityIcons
            name={toastStyles.icon}
            size={24}
            color="#FFFFFF"
            style={styles.icon}
          />
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleHide}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  toastContainer: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minHeight: 56,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Toast;


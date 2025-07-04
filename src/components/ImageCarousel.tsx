"use client"

import React, { useState, useRef, useEffect } from "react"
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"

const { width } = Dimensions.get("window")

type ImageCarouselProps = {
  images: string[]
  height?: number
  showControls?: boolean
  showIndicators?: boolean
  autoPlay?: boolean
  interval?: number
  onImagePress?: () => void
  initialIndex?: number
}

export default function ImageCarousel({
  images,
  height = 200,
  showControls = true,
  showIndicators = true,
  autoPlay = false,
  interval = 3000,
  onImagePress,
  initialIndex,
}: ImageCarouselProps) {
  const theme = useTheme()
  const [activeIndex, setActiveIndex] = useState(initialIndex || 0)
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  // Auto play functionality
  useEffect(() => {
    let intervalId: number | null = null

    if (autoPlay && images.length > 1) {
      intervalId = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length
        scrollToIndex(nextIndex)
      }, interval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeIndex, autoPlay, images.length, interval])

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true })
      setActiveIndex(index)
    }
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const newIndex = Math.round(contentOffsetX / width)
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
    }
  }

  const handlePrevious = () => {
    const newIndex = Math.max(activeIndex - 1, 0)
    scrollToIndex(newIndex)
  }

  const handleNext = () => {
    const newIndex = Math.min(activeIndex + 1, images.length - 1)
    scrollToIndex(newIndex)
  }

  const handleImagePress = () => {
    // Animate opacity to give feedback
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    if (onImagePress) {
      onImagePress()
    }
  }
  

  // Scroll to initial index on mount
  React.useEffect(() => {
    if (initialIndex && initialIndex > 0 && initialIndex < images.length) {
      setTimeout(() => {
        scrollToIndex(initialIndex)
      }, 100)
    }
  }, [])

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={onImagePress ? 0.9 : 1}
            onPress={handleImagePress}
            style={{ width }}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              <Image source={{ uri: image }} style={[styles.image, { height }]} resizeMode="cover" />
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showControls && images.length > 1 && (
        <>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, { backgroundColor: theme.colors.card }]}
            onPress={handlePrevious}
            disabled={activeIndex === 0}
          >
            <Feather
              name="chevron-left"
              size={24}
              color={activeIndex === 0 ? theme.colors.border : theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, { backgroundColor: theme.colors.card }]}
            onPress={handleNext}
            disabled={activeIndex === images.length - 1}
          >
            <Feather
              name="chevron-right"
              size={24}
              color={activeIndex === images.length - 1 ? theme.colors.border : theme.colors.text}
            />
          </TouchableOpacity>
        </>
      )}

      {showIndicators && images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === activeIndex ? theme.colors.primary : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: width,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1,
  },
})

"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import ImageCarousel from "./ImageCarousel"

const { width, height } = Dimensions.get("window")

type PhotoGalleryProps = {
  images: string[]
  initialIndex?: number
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, initialIndex = 0 }) => {
  const theme = useTheme()
  const [fullscreenVisible, setFullscreenVisible] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex)

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index)
    setFullscreenVisible(true)
  }

  const renderThumbnail = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        {
          borderColor: index === selectedImageIndex ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={() => handleImagePress(index)}
    >
      <Image source={{ uri: item }} style={styles.thumbnail} resizeMode="cover" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setFullscreenVisible(true)}>
        <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} resizeMode="cover" />
      </TouchableOpacity>

      <FlatList
        data={images}
        renderItem={renderThumbnail}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailList}
      />

      <Modal visible={fullscreenVisible} transparent={true} animationType="fade">
        <SafeAreaView style={[styles.fullscreenContainer, { backgroundColor: "rgba(0,0,0,0.9)" }]}>
          <StatusBar hidden />
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullscreenVisible(false)}>
            <Feather name="x" size={24} color="#FFF" />
          </TouchableOpacity>

          <ImageCarousel
            images={images}
            height={height * 0.7}
            showControls={true}
            showIndicators={true}
            autoPlay={false}
            initialIndex={selectedImageIndex}
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  mainImage: {
    width: width,
    height: width * 0.8,
    borderRadius: 0,
  },
  thumbnailList: {
    padding: 8,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default PhotoGallery


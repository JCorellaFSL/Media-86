# Media-86 🖼️

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/JCorellaFSL/Media-86)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-orange.svg)](https://tauri.app/)

**Media-86** is a modern, lightweight image viewer and batch processor built with Tauri, React, and Rust. Designed for efficiency and ease of use, it provides a seamless experience for viewing, organizing, and processing your image collections.

## ✨ Features

### 🖼️ **Image Viewing**
- **Universal Format Support**: View JPG, PNG, GIF, BMP, WebP, SVG, TIFF, and ICO files
- **Dual View Modes**: Switch between compact list view and large thumbnail grid
- **Keyboard Navigation**: Navigate through images with arrow keys and spacebar
- **File Association**: Set as default image viewer - double-click any image to open in Media-86
- **Directory Auto-Loading**: Automatically loads all images from the selected file's directory

### ⚡ **Batch Processing**
- **Smart Batch Renaming**: Rename multiple files with customizable patterns and numbering
- **Image Rotation**: Rotate images 90° clockwise or counterclockwise with a single click
- **Intelligent Upscaling**: Upscale images with high-quality Lanczos3 filtering
- **Preview & Validation**: See exactly what will be renamed before applying changes
- **Conflict Detection**: Automatic detection and prevention of file overwrites

### 🎨 **User Experience**
- **Modern Interface**: Clean, intuitive design with Tailwind CSS and DaisyUI
- **Dark Theme**: Elegant dark theme optimized for extended viewing sessions
- **Responsive Layout**: Adaptive interface that works on different screen sizes
- **Real-time Feedback**: Toast notifications for all operations
- **Compact Design**: Minimized padding and optimized space usage

### 🛠️ **Technical Excellence**
- **Cross-Platform**: Native performance on Windows, macOS, and Linux
- **Single Instance**: Multiple file opens focus existing window instead of creating duplicates
- **Memory Efficient**: Rust backend ensures minimal resource usage
- **Fast Startup**: Quick launch times with optimized bundling

## 🚀 Release 1.0

Media-86 has reached **version 1.0**, marking a stable and feature-complete release. This milestone includes:

- ✅ **Complete File Association Support**: Seamlessly integrates with your operating system
- ✅ **Robust Batch Processing**: Reliable renaming, rotation, and upscaling operations  
- ✅ **Polished User Interface**: Refined design with improved usability
- ✅ **Cross-Platform Compatibility**: Tested and optimized for all major platforms
- ✅ **Performance Optimizations**: Enhanced speed and reduced memory footprint
- ✅ **Comprehensive Error Handling**: Graceful handling of edge cases and user errors

## 📋 Usage Guide

1.  **Opening Files**:
    - Click the **Image** button to open a system file dialog. Select any image.
    - The application will load the image in the main view and list all other images from the same folder in the sidebar.
2.  **Browsing**:
    - Click on any image name in the sidebar to view it.
    - Use the on-screen arrow buttons or your keyboard's arrow keys/spacebar to navigate.
3.  **Using the Batch Renamer**:
    - Select one or more files using the checkboxes in the sidebar.
    - Click the **Rename** button in the header to open the "Batch Rename" modal.
    - Choose a **Rename Mode** (e.g., "Selected files").
    - Enter a **Rename Pattern**. For example, `Summer-Trip-{n}`.
    - Set a **Start Number**. If you want padding, use leading zeros (e.g., `001`).
    - Adjust the **Step Size** if needed.
    - Review the changes in the **Preview** section.
    - Click **Rename Files** to perform the operation.

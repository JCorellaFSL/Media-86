# Media-86 v1.0.0 Release Notes

## 🎉 Major Release - Version 1.0.0

**Media-86** has reached its first major milestone! This release represents a stable, production-ready image viewer and batch processor with comprehensive features and cross-platform compatibility.

## 🚀 What's New in 1.0.0

### ✅ **Complete File Association Support**
- Seamlessly integrates with Windows file associations
- Double-click any image file to open in Media-86
- Single-instance handling prevents duplicate windows

### ✅ **Enhanced User Interface**
- Refined design with optimized spacing and layout
- Professional dark theme for extended viewing sessions
- Improved icon display and GitHub documentation

### ✅ **Robust Batch Processing**
- Smart batch renaming with pattern support
- Image rotation (90° clockwise/counterclockwise)
- High-quality upscaling with Lanczos3 filtering
- Preview and validation before applying changes

### ✅ **Universal Image Support**
- JPG, PNG, GIF, BMP, WebP, SVG, TIFF, ICO formats
- Dual view modes (list and thumbnail grid)
- Automatic directory loading and navigation

## 📦 Downloads

### Windows Installers
- **MSI Installer**: `Media-86_1.0.0_x64_en-US.msi` (Recommended for enterprise/silent installs)
- **NSIS Installer**: `Media-86_1.0.0_x64-setup.exe` (Standard Windows installer)

### Linux
- Linux AppImage and DEB packages available upon request
- Build from source using `npm run tauri build` on Linux systems

## 🔧 Installation

### Windows
1. Download either the MSI or NSIS installer
2. Run the installer with administrator privileges
3. Follow the installation wizard
4. Media-86 will be available in your Start Menu and can be set as default image viewer

### Linux
1. Download the AppImage or DEB package (when available)
2. For AppImage: `chmod +x Media-86_1.0.0_amd64.AppImage && ./Media-86_1.0.0_amd64.AppImage`
3. For DEB: `sudo dpkg -i media-86_1.0.0_amd64.deb`

## 🛠️ Technical Details

- **Framework**: Tauri 2.x with React frontend and Rust backend
- **Minimum Requirements**: Windows 10+ / macOS 10.15+ / Linux (glibc 2.28+)
- **Architecture**: x64 (64-bit)
- **Bundle Size**: ~4-6MB (highly optimized)

## 🐛 Bug Fixes

- Fixed file association handling in Tauri v2
- Resolved single-instance plugin configuration
- Improved CLI argument processing
- Enhanced error handling and user feedback

## 🔄 Upgrade Notes

If upgrading from a pre-1.0 version:
- Uninstall previous version before installing 1.0.0
- File associations will need to be reconfigured
- All settings and preferences are preserved

## 📋 Known Issues

- Linux builds require building from source (automated packages coming soon)
- macOS code signing pending (use "Open Anyway" in Security preferences)

## 🤝 Contributing

Visit our [GitHub repository](https://github.com/JCorellaFSL/Media-86) to:
- Report bugs or request features
- Submit pull requests
- View the complete source code
- Access build instructions

---

**Full Changelog**: https://github.com/JCorellaFSL/Media-86/compare/v0.9.0...v1.0.0 
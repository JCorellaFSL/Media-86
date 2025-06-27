# Media-86

![Media-86 Screenshot](https://i.imgur.com/rS2aG6J.jpeg)

Media-86 is a high-performance, cross-platform desktop media viewer built with modern web technologies. It leverages the power of Rust on the backend for speed and safety, and a sleek React frontend for a responsive user experience. It's designed for efficient media browsing and management, with a special focus on batch processing tools.

## ✨ Features

- **Versatile Media Opening**:
  - Open individual image files (`.jpg`, `.png`, `.webp`, etc.).
  - When an image is opened, its entire parent directory is loaded into the sidebar for seamless browsing.
- **Fluid Navigation**:
  - Clickable list of images in the sidebar.
  - On-screen previous/next buttons for quick navigation.
  - Full keyboard support: Use **Arrow Keys** (← →) and the **Spacebar** to move between images.
- **Advanced Batch Renaming**:
  - A powerful utility to rename multiple files at once.
  - **Modes**: Choose to rename the *current* image, *selected* files, or *all* files in the folder.
  - **Smart Pattern System**:
    - Use `{n}` for a number sequence.
    - Use `{ext}` for the original file extension.
  - **Intelligent Fallbacks**:
    - If `{n}` is omitted when renaming multiple files, a number is automatically appended to prevent overwrites.
    - If `{ext}` is omitted, the original file extension is automatically preserved.
  - **Intuitive Number Padding**: The number sequence's padding is automatically determined by the "Start Number" field.
    - `1` → 1, 2, 3...
    - `01` → 01, 02, 03...
    - `001` → 001, 002, 003...
  - **Live Preview**: See the results of your renaming pattern in real-time before committing any changes.
- **Selection Tools**:
  - Checkboxes next to each file for selecting specific images.
  - "Select All" / "Deselect All" button for quick batch selections.
- **Placeholder Utilities**:
  - **Video Support**: A button and placeholder function for future video file support.

## 💻 Technology Stack

- **Backend Framework**: [Tauri](https://tauri.app/) (using Rust)
- **Frontend Framework**: [React](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Rust](https://www.rust-lang.org/tools/install) and Cargo
- Follow the Tauri environment setup guide for your specific OS: [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Installation & Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Media-86
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm run tauri dev
    ```
    This command will start the Vite development server for the frontend and build/run the Tauri application, enabling hot-reloading for both.

### Building for Production

To create optimized, distributable binaries for your current operating system, run:

```bash
npm run tauri build
```

This command will bundle the application into a native installer or portable executable. The output can be found in `src-tauri/target/release/bundle/`.

- **Windows**: Generates a Microsoft Installer (`.msi`) for easy installation and a portable `.exe` inside a `.zip` archive.
- **Linux**: Generates a portable `.AppImage` file and a Debian package (`.deb`). Flatpak support can be configured manually.
- **macOS**: Generates an Application bundle (`.app`) and a distributable disk image (`.dmg`).

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
    
## 🚀 Release 1.0

This marks the first stable release of Media-86. Key features include:

-   Image viewing and directory browsing.
-   Advanced batch renaming capabilities.
-   List and grid view for image thumbnails.
-   Image rotation.
-   Sleek, modern, and compact user interface.

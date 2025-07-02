use image::{self, imageops::FilterType, ImageFormat, GenericImageView};
use std::fs;
use std::path::Path;
use tauri::{Manager, Emitter};
use serde::{Deserialize, Serialize};
use rayon::prelude::*;
use std::collections::HashMap;

use base64::{engine::general_purpose, Engine as _};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut entries = Vec::new();

    match fs::read_dir(path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                if let Ok(entry) = entry {
                    if let Some(file_name) = entry.file_name().to_str() {
                        entries.push(file_name.to_string());
                    }
                }
            }
            entries.sort();
            Ok(entries)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

#[tauri::command]
fn get_image_files(path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut image_files = Vec::new();
    let image_extensions = vec![
        "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico",
    ];

    match fs::read_dir(path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                if let Ok(entry) = entry {
                    if let Some(file_name) = entry.file_name().to_str() {
                        if let Some(extension) = Path::new(file_name).extension() {
                            if let Some(ext_str) = extension.to_str() {
                                if image_extensions.contains(&ext_str.to_lowercase().as_str()) {
                                    image_files.push(file_name.to_string());
                                }
                            }
                        }
                    }
                }
            }
            image_files.sort();
            Ok(image_files)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

#[tauri::command]
fn get_full_path(directory: String, filename: String) -> String {
    let path = Path::new(&directory).join(&filename);
    path.to_string_lossy().to_string()
}

#[tauri::command]
fn rename_files(
    directory: String,
    file_mappings: Vec<(String, String)>,
) -> Result<Vec<String>, String> {
    let dir_path = Path::new(&directory);

    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut results = Vec::new();

    for (old_name, new_name) in file_mappings {
        let old_path = dir_path.join(&old_name);
        let new_path = dir_path.join(&new_name);

        // Check if old file exists
        if !old_path.exists() {
            results.push(format!("❌ {} - File not found", old_name));
            continue;
        }

        // Check if new file would overwrite existing file
        if new_path.exists() && old_path != new_path {
            results.push(format!(
                "❌ {} → {} - Target file already exists",
                old_name, new_name
            ));
            continue;
        }

        // Skip if no change
        if old_name == new_name {
            results.push(format!("⏭️ {} - No change needed", old_name));
            continue;
        }

        // Attempt to rename
        match fs::rename(&old_path, &new_path) {
            Ok(_) => results.push(format!("✅ {} → {}", old_name, new_name)),
            Err(e) => results.push(format!("❌ {} → {} - Error: {}", old_name, new_name, e)),
        }
    }

    Ok(results)
}

#[tauri::command]
fn rotate_image(directory: String, filename: String, degrees: i32) -> Result<(), String> {
    let path = Path::new(&directory).join(&filename);
    if !path.exists() {
        return Err("File does not exist.".to_string());
    }

    let img = image::open(&path).map_err(|e| e.to_string())?;

    let rotated = if degrees == 90 {
        img.rotate90()
    } else if degrees == -90 {
        img.rotate270()
    } else {
        return Err("Unsupported rotation angle. Only 90 and -90 are supported.".to_string());
    };

    rotated.save(&path).map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Serialize, Deserialize)]
struct ThumbnailData {
    filename: String,
    thumbnail: String, // Base64 encoded thumbnail
    width: u32,
    height: u32,
    file_size: u64,
}

#[tauri::command]
fn generate_thumbnail(directory: String, filename: String, max_size: u32) -> Result<String, String> {
    let path = Path::new(&directory).join(&filename);
    if !path.exists() {
        return Err("File does not exist.".to_string());
    }

    let img = image::open(&path).map_err(|e| e.to_string())?;
    
    // Calculate thumbnail dimensions maintaining aspect ratio
    let (width, height) = img.dimensions();
    let (thumb_width, thumb_height) = if width > height {
        let ratio = height as f32 / width as f32;
        (max_size, (max_size as f32 * ratio) as u32)
    } else {
        let ratio = width as f32 / height as f32;
        ((max_size as f32 * ratio) as u32, max_size)
    };

    // Generate thumbnail
    let thumbnail = img.resize_exact(thumb_width, thumb_height, FilterType::Lanczos3);
    
    // Convert to bytes and encode as base64
    let mut bytes: Vec<u8> = Vec::new();
    thumbnail
        .write_to(&mut std::io::Cursor::new(&mut bytes), ImageFormat::Jpeg)
        .map_err(|e| e.to_string())?;
    
    let base64_thumbnail = general_purpose::STANDARD.encode(&bytes);
    
    Ok(base64_thumbnail)
}

#[tauri::command]
fn generate_thumbnails_batch(
    directory: String, 
    filenames: Vec<String>, 
    max_size: u32
) -> Result<Vec<ThumbnailData>, String> {
    let dir_path = Path::new(&directory);
    
    if !dir_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    // Use parallel processing for thumbnail generation
    let thumbnails: Result<Vec<ThumbnailData>, String> = filenames
        .par_iter()
        .map(|filename| {
            let path = dir_path.join(filename);
            
            if !path.exists() {
                return Err(format!("File {} does not exist", filename));
            }

            // Get file size
            let file_size = fs::metadata(&path)
                .map_err(|e| format!("Failed to get file metadata for {}: {}", filename, e))?
                .len();

            // Open and process image
            let img = image::open(&path)
                .map_err(|e| format!("Failed to open image {}: {}", filename, e))?;
            
            let (original_width, original_height) = img.dimensions();
            
            // Calculate thumbnail dimensions maintaining aspect ratio
            let (thumb_width, thumb_height) = if original_width > original_height {
                let ratio = original_height as f32 / original_width as f32;
                (max_size, (max_size as f32 * ratio) as u32)
            } else {
                let ratio = original_width as f32 / original_height as f32;
                ((max_size as f32 * ratio) as u32, max_size)
            };

            // Generate thumbnail
            let thumbnail = img.resize_exact(thumb_width, thumb_height, FilterType::Lanczos3);
            
            // Convert to bytes and encode as base64
            let mut bytes: Vec<u8> = Vec::new();
            thumbnail
                .write_to(&mut std::io::Cursor::new(&mut bytes), ImageFormat::Jpeg)
                .map_err(|e| format!("Failed to encode thumbnail for {}: {}", filename, e))?;
            
            let base64_thumbnail = general_purpose::STANDARD.encode(&bytes);
            
            Ok(ThumbnailData {
                filename: filename.clone(),
                thumbnail: base64_thumbnail,
                width: original_width,
                height: original_height,
                file_size,
            })
        })
        .collect();

    thumbnails
}

#[tauri::command]
fn get_image_metadata(directory: String, filename: String) -> Result<HashMap<String, String>, String> {
    let path = Path::new(&directory).join(&filename);
    if !path.exists() {
        return Err("File does not exist.".to_string());
    }

    let mut metadata = HashMap::new();
    
    // Get file metadata
    if let Ok(file_metadata) = fs::metadata(&path) {
        metadata.insert("file_size".to_string(), file_metadata.len().to_string());
        if let Ok(modified) = file_metadata.modified() {
            metadata.insert("modified".to_string(), format!("{:?}", modified));
        }
    }

    // Get image dimensions
    if let Ok(img) = image::open(&path) {
        let (width, height) = img.dimensions();
        metadata.insert("width".to_string(), width.to_string());
        metadata.insert("height".to_string(), height.to_string());
        metadata.insert("color_type".to_string(), format!("{:?}", img.color()));
    }

    Ok(metadata)
}

#[tauri::command]
fn upscale_image(directory: String, filename: String, scale: u32) -> Result<String, String> {
    let dir_path = Path::new(&directory);
    let original_path = dir_path.join(&filename);
    if !original_path.exists() {
        return Err("File does not exist.".to_string());
    }

    let img = image::open(&original_path).map_err(|e| e.to_string())?;

    let new_width = img.width() * scale;
    let new_height = img.height() * scale;

    let upscaled = img.resize(new_width, new_height, FilterType::Lanczos3);

    let original_stem = original_path
        .file_stem()
        .ok_or("Could not get file stem")?
        .to_str()
        .ok_or("Invalid file stem")?;
    let extension = original_path
        .extension()
        .ok_or("Could not get extension")?
        .to_str()
        .ok_or("Invalid extension")?;

    // Find a unique filename to prevent overwrites
    let new_filename_base = format!("{}_{}x", original_stem, scale);
    let mut new_path;
    let mut counter = 0;

    loop {
        let temp_filename = if counter == 0 {
            format!("{}.{}", new_filename_base, extension)
        } else {
            format!("{} ({}).{}", new_filename_base, counter, extension)
        };
        new_path = dir_path.join(&temp_filename);
        if !new_path.exists() {
            break;
        }
        counter += 1;
    }

    let final_filename = new_path
        .file_name()
        .ok_or("Could not get final filename")?
        .to_str()
        .ok_or("Invalid final filename")?
        .to_string();

    // Explicitly convert to RGB8 to ensure maximum compatibility before saving
    upscaled
        .to_rgb8()
        .save(&new_path)
        .map_err(|e| e.to_string())?;

    Ok(final_filename)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            // When a new instance is launched with arguments, send them to the existing instance
            if argv.len() > 1 {
                // argv[0] is the executable path, argv[1] should be the file path
                let file_path = &argv[1];
                app.emit("open-file", file_path).unwrap();
            }
            app.get_webview_window("main")
                .expect("no main window")
                .set_focus()
                .unwrap();
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_directory,
            get_image_files,
            get_full_path,
            rename_files,
            rotate_image,
            generate_thumbnail,
            generate_thumbnails_batch,
            get_image_metadata,
            upscale_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

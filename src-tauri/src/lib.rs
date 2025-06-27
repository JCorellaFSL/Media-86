use image;
use image::imageops::FilterType;
use std::fs;
use std::path::Path;
use tauri::Manager;

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
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
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
            upscale_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

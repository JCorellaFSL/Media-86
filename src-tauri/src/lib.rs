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
        Err(e) => Err(format!("Failed to read directory: {}", e))
    }
}

#[tauri::command]
fn get_image_files(path: String) -> Result<Vec<String>, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err("Directory does not exist".to_string());
    }
    
    let mut image_files = Vec::new();
    let image_extensions = vec!["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico"];
    
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
        Err(e) => Err(format!("Failed to read directory: {}", e))
    }
}

#[tauri::command]
fn get_full_path(directory: String, filename: String) -> String {
    let path = Path::new(&directory).join(&filename);
    path.to_string_lossy().to_string()
}

#[tauri::command]
fn rename_files(directory: String, file_mappings: Vec<(String, String)>) -> Result<Vec<String>, String> {
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
            results.push(format!("❌ {} → {} - Target file already exists", old_name, new_name));
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
            Err(e) => results.push(format!("❌ {} → {} - Error: {}", old_name, new_name, e))
        }
    }
    
    Ok(results)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, read_directory, get_image_files, get_full_path, rename_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

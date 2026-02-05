use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

struct GoServer {
    process: Mutex<Option<Child>>,
}

fn start_go_server(app: &tauri::AppHandle) -> Result<Child, std::io::Error> {
    #[cfg(target_os = "windows")]
    let binary_name = "server.exe";
    #[cfg(not(target_os = "windows"))]
    let binary_name = "server";

    let resource_path = app
        .path()
        .resource_dir()
        .expect("failed to get resource dir")
        .join("bin")
        .join(binary_name);

    let child = Command::new(&resource_path)
        .env("PORT", "8880")
        .env("ENV", "desktop")
        .spawn()?;

    Ok(child)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            match start_go_server(&app.handle()) {
                Ok(server) => {
                    app.manage(GoServer {
                        process: Mutex::new(Some(server)),
                    });
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    println!("Go server started on http://localhost:8880");
                }
                Err(e) => {
                    println!("Note: Go server not started ({}). Run it separately in dev mode.", e);
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                if let Some(state) = window.app_handle().try_state::<GoServer>() {
                    if let Ok(mut process) = state.process.lock() {
                        if let Some(mut child) = process.take() {
                            let _ = child.kill();
                            println!("Go server stopped");
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

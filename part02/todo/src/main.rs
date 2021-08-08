use actix_web::{get, web, App, HttpResponse, HttpServer, ResponseError};
use askama::Template;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params;
use thiserror::Error;

struct TodoEntry {
    id: u32,
    text: String,
}

#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate {
    entries: Vec<TodoEntry>,
}

#[derive(Error, Debug)]
enum MyError {
    #[error("Failed to render HTML")]
    AskamaError(#[from] askama::Error),

    #[error("Failed to get db connection")]
    ConnectionPollError(#[from] r2d2::Error),

    #[error("Failed SQL execution")]
    SqliteError(#[from] rusqlite::Error),
}

impl ResponseError for MyError {}

#[get("/")]
async fn index(db: web::Data<Pool<SqliteConnectionManager>>) -> Result<HttpResponse, MyError> {
    let conn = db.get()?;
    let mut statement = conn.prepare("SELECT id, text FROM todo")?;
    let rows = statement.query_map(params![], |row| {
        let id = row.get(0)?;
        let text = row.get(1)?;
        return Ok(TodoEntry { id: id, text: text });
    })?;

    let mut entries = Vec::new();
    for entry in rows {
        entries.push(entry?);
    }

    let html = IndexTemplate { entries };
    let response_body = html.render()?;

    return Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(response_body));
}

#[actix_web::main]
async fn main() -> Result<(), actix_web::Error> {
    let manager = SqliteConnectionManager::file("todo.db");
    let pool = Pool::new(manager).expect("Failed to initialize SQLite connection pool.");
    let conn = pool.get().expect("Failed to get SQLite connection");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL
        )",
        params![],
    )
    .expect("Failed to create table `todo`.");

    const ADDRESS: &str = "0.0.0.0";
    const PORT: u16 = 8080;
    println!("Listening on http://127.0.0.1:{}", PORT);

    HttpServer::new(move || App::new().service(index).data(pool.clone()))
        .bind(format!("{}:{}", ADDRESS, PORT))?
        .run()
        .await?;

    return Ok(());
}

use actix_web::{get, App, HttpResponse, HttpServer, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
enum MyError {}

impl ResponseError for MyError {}

#[get("/")]
async fn index() -> Result<HttpResponse, MyError> {
    let response_body = "Hello, world!";
    return Ok(HttpResponse::Ok().body(response_body));
}

#[actix_web::main]
async fn main() -> Result<(), actix_web::Error> {
    const ADDRESS: &str = "0.0.0.0";
    const PORT: u16 = 8080;
    println!("Listening on http://127.0.0.1:{}", PORT);

    HttpServer::new(move || App::new().service(index))
        .bind(format!("{}:{}", ADDRESS, PORT))?
        .run()
        .await?;

    return Ok(());
}

use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    let handler = thread::spawn(move || {
        let data = rx.recv().unwrap();
        println!("{}", data);
    });

    let _ = tx.send("Hello, world!");
    let _ = handler.join();
}

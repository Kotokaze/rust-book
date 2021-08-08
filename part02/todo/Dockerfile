FROM rust:1.43 AS builder

WORKDIR /todo

COPY Cargo.toml Cargo.toml
COPY ./src ./src
COPY ./templates ./templates

RUN cargo build --release
RUN cargo install --path .

CMD ["todo"]

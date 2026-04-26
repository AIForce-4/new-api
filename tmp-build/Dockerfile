FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY new-api /new-api
RUN chmod +x /new-api
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]

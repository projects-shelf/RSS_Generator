FROM golang:1.24.3-alpine

WORKDIR /back
COPY . .

RUN apk add --no-cache git \
    && go mod tidy \
    && go build -o main .

CMD ["./main"]
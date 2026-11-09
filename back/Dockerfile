FROM golang:1.27.3-alpine

WORKDIR /back
COPY . .

RUN apk add --no-cache git \
    && go mod tidy \
    && go build -o main .

CMD ["./main"]
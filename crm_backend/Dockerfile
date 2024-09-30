FROM golang:1.23-alpine as builder

WORKDIR /mydir

COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o crm_backend

FROM alpine:3.17

RUN apk --no-cache add curl

COPY --from=builder /mydir/crm_backend ./crm_backend
COPY --from=builder /mydir/app/config/config.json ./app/config/config.json

ENTRYPOINT ["./crm_backend"]

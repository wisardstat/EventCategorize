#!/bin/bash
docker build --network=host -t event-frontend ./frontend

docker run -d --name event-frontend --network eventnet -p 3000:3000 \
  -e NEXT_PUBLIC_HOST_URL=http://139.180.144.194:3000/ \
  event-frontend 

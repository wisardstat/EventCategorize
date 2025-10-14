#!/bin/bash
docker build --network=host -t event-backend ./backend

docker run -d --name event-backend --network eventnet -p 8000:8000 \
    -e openai_api_key=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\
    -e postgres_host=event-db -e postgres_db=eventfeedback \
    -e postgres_user=postgres -e postgres_password=postgres -e postgres_port=5432 \
    event-backend 

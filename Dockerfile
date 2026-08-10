FROM nginx:alpine
COPY cardioscore.html /usr/share/nginx/html/index.html
COPY cardioscore.css /usr/share/nginx/html/cardioscore.css

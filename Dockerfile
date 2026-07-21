FROM nginx:alpine
COPY cardioscore.html /usr/share/nginx/html/index.html
COPY favicon.svg /usr/share/nginx/html/
COPY og-image.png /usr/share/nginx/html/
COPY og-image.svg /usr/share/nginx/html/

FROM nginx:alpine
COPY calculadora_riesgo_modificada.html /usr/share/nginx/html/index.html
COPY favicon.svg /usr/share/nginx/html/
COPY og-image.png /usr/share/nginx/html/
COPY og-image.svg /usr/share/nginx/html/

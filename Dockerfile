FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY tailwind.css /usr/share/nginx/html/
COPY metodologia.html terminos.html robots.txt sitemap.xml manifest.json sw.js favicon.svg og-image.png /usr/share/nginx/html/
COPY tools /usr/share/nginx/html/tools
COPY icons /usr/share/nginx/html/icons
COPY vendor /usr/share/nginx/html/vendor

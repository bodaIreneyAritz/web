FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# No calen fitxers de deploy dins el document root
RUN rm -f /usr/share/nginx/html/Dockerfile \
        /usr/share/nginx/html/docker-compose.yml \
        /usr/share/nginx/html/nginx.conf \
        /usr/share/nginx/html/README.md

EXPOSE 80

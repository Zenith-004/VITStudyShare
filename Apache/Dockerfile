FROM httpd:2.4

# Create the uploads directory
RUN mkdir -p /usr/local/apache2/htdocs/uploads

# Copy the contents of the current directory to the Apache document root
COPY ./ /usr/local/apache2/htdocs/

# Copy the CORS configuration file to the Apache configuration directory
COPY cors.conf /usr/local/apache2/conf/extra/cors.conf

# Enable the headers module and include the CORS configuration
RUN echo "LoadModule headers_module modules/mod_headers.so" >> /usr/local/apache2/conf/httpd.conf && \
    echo "Include conf/extra/cors.conf" >> /usr/local/apache2/conf/httpd.conf

# Expose port 80 to the host
EXPOSE 80

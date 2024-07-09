FROM httpd:2.4

# Create the uploads directory
RUN mkdir -p /usr/local/apache2/htdocs/uploads

# Copy the contents of the current directory to the Apache document root
COPY ./ /usr/local/apache2/htdocs/

# Expose port 80 to the host
EXPOSE 80

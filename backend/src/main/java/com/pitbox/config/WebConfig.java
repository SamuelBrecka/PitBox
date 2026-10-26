package com.pitbox.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path uploadLocation;

    public WebConfig(@Value("${pitbox.storage.upload-dir:./uploads}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPathUri = uploadLocation.toUri().toString();
        if (!uploadPathUri.endsWith("/")) {
            uploadPathUri += "/";
        }

        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPathUri);
    }
}

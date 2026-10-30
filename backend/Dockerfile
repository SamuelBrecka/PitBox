# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -B || true
COPY src src
RUN sed -i 's/\r$//' mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S pitbox && adduser -S pitbox -G pitbox
RUN mkdir -p /app/uploads && chown -R pitbox:pitbox /app
USER pitbox
COPY --from=builder /workspace/target/*.jar app.jar
ENV JAVA_OPTS="-Xms64m -Xmx256m -XX:+UseG1GC"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

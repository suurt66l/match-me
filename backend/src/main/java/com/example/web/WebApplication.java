package com.example.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebApplication {

	public static void main(String[] args) {
		for (String arg: args) {
			if(arg.equals("-d")) {
				System.setProperty("spring.graphql.graphiql.enabled", "true");
			}
		}
		SpringApplication.run(WebApplication.class, args);
	}

}

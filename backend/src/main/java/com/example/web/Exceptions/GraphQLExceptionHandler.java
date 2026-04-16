package com.example.web.Exceptions;

import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

import com.example.web.Controller.GraphQLController;

import graphql.GraphQLError;
import org.springframework.graphql.execution.ErrorType;

@ControllerAdvice(assignableTypes = GraphQLController.class)
public class GraphQLExceptionHandler {

    @GraphQlExceptionHandler
    public GraphQLError handle(RuntimeException ex) {
        return GraphQLError.newError()
                .errorType(ErrorType.FORBIDDEN)
                .message(ex.getMessage())
                .build();
    }
}

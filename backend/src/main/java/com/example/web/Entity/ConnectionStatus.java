package com.example.web.Entity;

public enum ConnectionStatus {
    PENDING, //request sent, awaiting response
    ACCEPTED, //both users are connected
    REJECTED, // request was rejected
    BLOCKED // one user blocked the other
}
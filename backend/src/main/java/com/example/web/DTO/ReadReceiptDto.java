package com.example.web.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReadReceiptDto {
    private Long readBy; // ID of the user who read the messages
}
package com.example.web.DTO;

import java.util.List;

import lombok.Data;

@Data
public class RecommendationsResponseDto {
    private boolean complete;
    private List<String> missingFields;
    private List<RecommendationItemDto> matches;
}
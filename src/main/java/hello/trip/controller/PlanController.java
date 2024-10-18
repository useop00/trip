package hello.trip.controller;

import hello.trip.dto.PlanDto;
import hello.trip.dto.UserCreateDto;
import hello.trip.entity.PlanEntity;
import hello.trip.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @PostMapping
    public ResponseEntity<PlanDto> savedPlan(@RequestBody PlanDto planDto, @AuthenticationPrincipal UserCreateDto user) {

        String username = user.getUsername();

        PlanEntity savedPlan = planService.savePlan(planDto.getPlaces(), planDto.getTitle(), username);
        PlanDto responseDto = planService.convertToDto(savedPlan);

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }


    @GetMapping
    public ResponseEntity<List<PlanDto>> getUserPlans(@AuthenticationPrincipal UserCreateDto user) {
        String username = user.getUsername();

        List<PlanEntity> plans = planService.getUserPlans(username);

        List<PlanDto> planDtos = plans.stream()
                .map(planService::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(planDtos);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<PlanDto> getPlanById(@PathVariable Long planId, @AuthenticationPrincipal UserCreateDto user) {
        String username = user.getUsername();

        PlanEntity plan = planService.getPlanByIdAndUser(planId, username);

        PlanDto planDto = planService.convertToDto(plan);

        return ResponseEntity.ok(planDto);
    }
}

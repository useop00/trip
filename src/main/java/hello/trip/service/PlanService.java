package hello.trip.service;

import hello.trip.dto.PlaceDto;
import hello.trip.dto.PlanDto;
import hello.trip.entity.PlaceEntity;
import hello.trip.entity.PlanEntity;
import hello.trip.entity.UserEntity;
import hello.trip.repository.PlanRepository;
import hello.trip.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    public UserEntity getUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public PlanEntity savePlan(List<PlaceDto> places, String title, String username) {
        // 검증
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("제목은 필수 입력 값입니다.");
        }
        if (places == null || places.isEmpty()) {
            throw new IllegalArgumentException("적어도 하나 이상의 장소가 필요합니다.");
        }
        UserEntity userEntity = getUsername(username);
        PlanEntity plan = new PlanEntity();
        plan.setTitle(title);
        plan.setDate(LocalDate.now());
        plan.setUser(userEntity);

        List<PlaceEntity> placesEntities = places.stream()
                .map(dto -> convertToEntity(dto, plan))
                .collect(Collectors.toList());

        plan.setPlaces(placesEntities);
        return planRepository.save(plan);
    }

    private PlaceEntity convertToEntity(PlaceDto dto, PlanEntity plan) {
        PlaceEntity place = new PlaceEntity();
        place.setName(dto.getPlaceName());
        place.setSequence(dto.getSequence());
        place.setLat(dto.getLat());
        place.setLng(dto.getLng());
        place.setPlan(plan);
        return place;
    }
    public PlanDto convertToDto(PlanEntity planEntity) {
        PlanDto planDto = new PlanDto();
        planDto.setTitle(planEntity.getTitle());

        // PlaceEntity 리스트를 PlaceDto 리스트로 변환
        List<PlaceDto> placeDtos = planEntity.getPlaces().stream()
                .map(this::convertToPlaceDto)
                .collect(Collectors.toList());

        planDto.setPlaces(placeDtos);

        return planDto;
    }
    private PlaceDto convertToPlaceDto(PlaceEntity placeEntity) {
        PlaceDto placeDto = new PlaceDto();
        placeDto.setPlaceName(placeEntity.getName());
        placeDto.setSequence(placeEntity.getSequence());
        placeDto.setLat(placeEntity.getLat());
        placeDto.setLng(placeEntity.getLng());
        return placeDto;
    }

    public PlanEntity getPlanByIdAndUser(Long planId, String username){
        return planRepository.findByIdAndUser_Username(planId, username)
                .orElseThrow(() -> new EntityNotFoundException("해당 계획을 찾을 수 없습니다."));
    }

    public List<PlanEntity> getUserPlans(String username) {
        return planRepository.findByUser_Username(username);
    }
}

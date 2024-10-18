package hello.trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PlanDto {

    @NotBlank(message = "제목은 필수 입력 값입니다.")
    private String title;

    @Size(min = 1, message = "적어도 하나 이상의 장소가 필요합니다.")
    private List<PlaceDto> places;

    private String username;
}

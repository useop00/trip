package hello.trip.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlaceDto {

    private String placeName;
    private int sequence;
    private double lat; // 위도
    private double lng; // 경도

    public PlaceDto() {
    }

    public PlaceDto(String placeName, int sequence, double lat, double lng) {
        this.placeName = placeName;
        this.sequence = sequence;
        this.lat = lat;
        this.lng = lng;
    }


}

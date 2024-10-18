package hello.trip.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "place")
public class PlaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int sequence;
    private double lat;
    private double lng;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private PlanEntity plan;
}



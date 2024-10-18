package hello.trip.repository;

import hello.trip.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlanRepository extends JpaRepository<PlanEntity, Long> {

    List<PlanEntity> findByUser_Username(String username);

    Optional<PlanEntity> findByIdAndUser_Username(Long planId, String username);

}

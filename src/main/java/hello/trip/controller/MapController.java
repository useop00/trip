package hello.trip.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class MapController {

    @GetMapping("/map")
    public String map() {
        return "map";
    }
}

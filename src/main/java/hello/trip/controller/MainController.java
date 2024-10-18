package hello.trip.controller;

import hello.trip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class MainController {

    private final UserService userService;

    @PostMapping("/")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        Model model) {

        if (userService.validateUser(username, password)) {
            return "redirect:/map";
        } else {
            model.addAttribute("loginError", "아이디 비밀번호를 확인하세요");
            return "index";
        }
    }

    @GetMapping("/")
    public String main() {
        return "index";
    }

}

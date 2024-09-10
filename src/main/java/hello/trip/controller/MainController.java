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
    public String login(@RequestParam("userName") String username,
                        @RequestParam("password") String password,
                        Model model) {

        // 아이디와 비밀번호 검증 로직 (실제 로직으로 교체 필요)
        if (userService.validateUser(username, password)) {
            return "redirect:/map"; // 로그인 성공 시 map 페이지로 이동
        } else {
            model.addAttribute("loginError", "아이디 비밀번호를 확인하세요");
            return "index"; // 로그인 실패 시 index 페이지로 다시 이동
        }
    }

    @GetMapping("/")
    public String main() {
        return "index";
    }

}

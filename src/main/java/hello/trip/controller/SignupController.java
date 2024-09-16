package hello.trip.controller;

import hello.trip.dto.UserCreateDto;
import hello.trip.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@RequiredArgsConstructor
public class SignupController {

    private final UserService userService;

    @GetMapping("/signup")
    public String login(UserCreateDto userCreateDto) {
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(@Valid UserCreateDto userCreateDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "signup";
        }
        if (!userCreateDto.getPassword().equals(userCreateDto.getPasswordConfirm())) {
            bindingResult.rejectValue("passwordConfirm", "passwordInCorrect", "" +
                    "2개의 비밀번호가 일치하지 않습니다.");
            return "signup";
        }

        userService.create(userCreateDto.getUserName(), userCreateDto.getMail(), userCreateDto.getPassword());
        return "redirect:/";
    }
}

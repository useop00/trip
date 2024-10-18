package hello.trip.service;

import hello.trip.entity.UserEntity;
import hello.trip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService{

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserEntity create(String username, String mail,String password) {
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setMail(mail);
        user.setPassword(passwordEncoder.encode(password));
        this.userRepository.save(user);

        return user;
    }

    public boolean validateUser(String username, String password) {
        UserEntity user = userRepository.findByUsername(username);
        if (user != null) {
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    public boolean isUserNameAvailable(String username) {
        return userRepository.findByUsername(username) == null;
    }

}

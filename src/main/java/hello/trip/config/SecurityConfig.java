package hello.trip.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{

        http
                .authorizeHttpRequests((auth) -> auth
                        // 인가 동작 순서 : 위에서 부터 아래로 순서대로 ! 따라서 순서 유의 (anyRequest 특히)
                        .requestMatchers("/**","/oauth2/**","/signup/**","/css/**", "/js/**", "/images/**","/mail/**").permitAll()
                        .anyRequest().authenticated()
                );

        // 로그인 설정
        http
                .formLogin((auth) -> auth.loginPage("/")
                        .loginProcessingUrl("/map")
                        .permitAll()
                );

        // 로그아웃 URL 설정
        http
                .logout((logout) -> logout.logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                        .logoutSuccessUrl("/")
                        .invalidateHttpSession(true));

        // csrf : 사이트 위변조 방지 설정 (스프링 시큐리티에는 자동으로 설정 되어 있음)
        // csrf기능 켜져있으면 post 요청을 보낼때 csrf 토큰도 보내줘야 로그인 진행됨 !
        // 개발단계에서만 csrf 잠시 꺼두기
        http
                .csrf((auth) -> auth.disable());

        return http.build();
    }

    // BCrypt password encoder를 리턴하는 메서드
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder(){

        return new BCryptPasswordEncoder();
    }
}
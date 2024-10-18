function sendNumber(){
    $("#mail_number").css("display","block");
    $.ajax({
        url:"/mail",
        type:"post",
        dataType:"json",
        data:{"mail" : $("#mail").val()},
        success: function(data){
            alert("인증번호 발송");
            $("#Confirm").attr("value",data);
        }
    });
}

function confirmNumber() {
    var number1 = $("#number").val();
    var number2 = $("#Confirm").val();

    if (number1 == number2) {
        alert("이메일 인증이 완료되었습니다.");
        $("#signupBtn").prop("disabled", false);  // 회원가입 버튼 활성화
    } else {
        alert("인증번호가 올바르지 않습니다.");
    }
}

$(document).ready(function () {
    $("#username").on("input", function () {
        var username = $(this).val();

        if (username.length > 2) { // 아이디가 3글자 이상일 때만 확인
            $.ajax({
                url: "/check-username",  // 백엔드의 아이디 중복 체크 API
                type: "POST",
                data: { username: username },
                success: function (response) {
                    console.log("서버 응답:", response);
                    if (response.isAvailable) {
                        $("#usernameCheckResult").text("사용 가능한 아이디입니다.").removeClass("invalid").addClass("valid");
                        $("#signupBtn").prop("disabled", false);
                    } else {
                        $("#usernameCheckResult").text("이미 사용 중인 아이디입니다.").removeClass("valid").addClass("invalid");
                        $("#signupBtn").prop("disabled", true);
                    }
                }
            });
        } else {
            $("#usernameCheckResult").text("아이디는 최소 3글자 이상이어야 합니다.").removeClass("valid").addClass("invalid");
            $("#signupBtn").prop("disabled", true);
        }
    });
});
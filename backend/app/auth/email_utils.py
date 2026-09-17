from flask import current_app, render_template_string
from flask_mail import Message
from app.extensions import mail, get_serializer

def send_verification_email(user):
    serializer = get_serializer(current_app)
    token = serializer.dumps(user.email, salt='email-verify')

    verify_url = f"{current_app.config['FRONTEND_URL']}/verify-email/{token}"

    html_body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>이메일 인증</h2>
        <p>{user.username}님, 아래 버튼을 눌러 이메일 인증을 완료해주세요.</p>
        <a href="{verify_url}"
           style="display:inline-block; background:#4f46e5; color:white;
                  padding:12px 24px; border-radius:8px; text-decoration:none;">
            이메일 인증하기
        </a>
        <p style="color:#888; font-size:13px; margin-top:20px;">
            버튼이 안 눌리면 이 링크를 복사하세요: {verify_url}<br>
            이 링크는 1시간 동안만 유효합니다.
        </p>
    </div>
    """

    msg = Message(
        subject="[MyCommunity] 이메일 인증을 완료해주세요",
        recipients=[user.email],
        html=html_body
    )
    mail.send(msg)


def confirm_verification_token(token, expiration=3600):
    serializer = get_serializer(current_app)
    try:
        email = serializer.loads(token, salt='email-verify', max_age=expiration)
    except Exception:
        return None
    return email
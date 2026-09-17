from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User
from app.schemas import register_schema, login_schema
from app.auth.email_utils import send_verification_email, confirm_verification_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': '이미 사용중인 이메일입니다.'}), 409

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': '이미 사용중인 아이디입니다.'}), 409

    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    try:
        send_verification_email(user)
    except Exception as e:
        current_app.logger.error(f"메일 발송 실패: {e}")
        # 메일 발송 실패해도 회원가입 자체는 유지 (재발송 API로 복구 가능)

    return jsonify({
        'message': '회원가입 완료. 이메일을 확인해서 인증을 완료해주세요.',
        'user': user.to_dict()
    }), 201


@auth_bp.route('/verify-email/<token>', methods=['POST'])
def verify_email(token):
    email = confirm_verification_token(token)
    if not email:
        return jsonify({'error': '유효하지 않거나 만료된 링크입니다.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': '사용자를 찾을 수 없습니다.'}), 404

    if user.is_verified:
        return jsonify({'message': '이미 인증된 계정입니다.'}), 200

    user.is_verified = True
    db.session.commit()

    return jsonify({'message': '이메일 인증이 완료되었습니다.'}), 200


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': '해당 이메일로 가입된 계정이 없습니다.'}), 404
    if user.is_verified:
        return jsonify({'message': '이미 인증된 계정입니다.'}), 200

    try:
        send_verification_email(user)
    except Exception as e:
        current_app.logger.error(f"메일 발송 실패: {e}")
        return jsonify({'error': '메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'}), 500

    return jsonify({'message': '인증 메일을 재발송했습니다.'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': '이메일 또는 비밀번호가 올바르지 않습니다.'}), 401

    if not user.is_verified:
        return jsonify({'error': '이메일 인증이 필요합니다.', 'need_verification': True}), 403

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': '사용자를 찾을 수 없습니다.'}), 404
    return jsonify(user.to_dict()), 200
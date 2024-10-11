class User < ApplicationRecord
  attr_accessor :old_password
  has_secure_password validations: false

  before_validation :downcase_login
  
  private 

  def downcase_login
    self.login.downcase!
  end

  def login_complexity
    return if login =~ /\A[a-zA-Z0-9_]+\z/
    errors.add :login, 'complexity requirement not met. Login should include only digits, uppercases, lowercases and underscore'
  end

  def password_complexity
    # Regexp extracted from https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    return if password.blank? || password =~ /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*\.\-_])/
    errors.add :password, 'complexity requirement not met. Password should include: 1 uppercase, 1 lowercase, 1 digit and 1 special character'
  end

  def password_presence
    errors.add(:password, :blank) unless password_digest.present?
  end

  def correct_old_password
    return if BCrypt::Password.new(password_digest_was).is_password?(old_password)
    errors.add :old_password, 'is incorrect'
  end
end

class User < ApplicationRecord
  include Player

  has_one :room_player, as: :player
  has_many :rooms, through: :room_players
  has_many :purchased_items
  has_many :items, through: :purchased_items
  
  attr_accessor :old_password
  has_secure_password validations: false

  validates :login, presence: true
  validate :login_complexity, if: -> { login.present? }
  validates :login, uniqueness: true, if: -> { login.present? }
  validates :password, confirmation: true, allow_blank: true, length: { minimum: 8, maximum: 32 }
  validate :password_complexity, if: -> { password.present? }
  validate :password_presence
  validate :correct_old_password, on: :update, if: -> { password.present? || login_changed? }
  
  before_validation :downcase_login
  before_save :set_valid_nickname

  def initialize(attributes = {})
    super
    self.nickname ||= "Player_#{SecureRandom.hex(4)}"
  end

  def avatar
    current_purchased_item = purchased_items.joins(:item).find_by(current: true, items: { itemable_type: 'Avatar' })
    return current_purchased_item.item.itemable if current_purchased_item
    return Avatar.default
  end

  private 

  def downcase_login
    self.login&.downcase!
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
